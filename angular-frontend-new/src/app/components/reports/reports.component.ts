import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import Chart from 'chart.js/auto';
import type { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

import { MOCK_ACTIVITIES } from '../../mock/mock-activities';
import { MOCK_USERS } from '../../mock/mock-users';
import { Activity } from '../../models/activity.model';
import { User } from '../../models/user.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

type StatusFilter = 'all' | 'open' | 'upcoming' | 'closed';
type UserMetric = 'hours' | 'activities';

interface ContributionRow {
  user: User;
  hours: number;
  activities: number;
}

interface ActivityReportRow {
  activity: Activity;
  category: string;
  hours: number;
  monthLabel: string;
  occupancy: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, MatButtonModule, MatIconModule, MatSelectModule, AvatarComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('monthlyChart') private monthlyChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') private categoryChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('contributionChart') private contributionChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('capacityChart') private capacityChartRef?: ElementRef<HTMLCanvasElement>;

  protected readonly users = MOCK_USERS;
  protected readonly statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'closed', label: 'Closed' },
  ];

  protected selectedStatus: StatusFilter = 'all';
  protected selectedUserId = MOCK_USERS[0].id;
  protected userMetric: UserMetric = 'hours';
  protected selectedCategory = '';

  private charts: Chart[] = [];
  private readonly palette = ['#46608a', '#2a9d8f', '#d66a4a', '#7d5b80', '#d9a441', '#5f7f95'];

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  protected get rows(): ActivityReportRow[] {
    return MOCK_ACTIVITIES
      .filter(activity => this.selectedStatus === 'all' || activity.status === this.selectedStatus)
      .map(activity => this.toReportRow(activity))
      .filter(row => !this.selectedCategory || row.category === this.selectedCategory);
  }

  protected get contributions(): ContributionRow[] {
    const contributionMap = new Map<number, ContributionRow>();

    for (const user of this.users) {
      contributionMap.set(user.id, { user, hours: 0, activities: 0 });
    }

    for (const row of this.rows) {
      const participants = row.activity.participants ?? [];
      for (const participant of participants) {
        const existing = contributionMap.get(participant.id);
        if (existing) {
          existing.hours += row.hours;
          existing.activities += 1;
        }
      }
    }

    return Array.from(contributionMap.values()).sort((a, b) => b.hours - a.hours);
  }

  protected get selectedContribution(): ContributionRow {
    return this.contributions.find(row => row.user.id === this.selectedUserId) ?? this.contributions[0];
  }

  protected get totalVolunteerHours(): number {
    return this.rows.reduce((total, row) => total + row.hours * (row.activity.participants?.length ?? 0), 0);
  }

  protected get averageOccupancy(): number {
    if (this.rows.length === 0) {
      return 0;
    }

    const total = this.rows.reduce((sum, row) => sum + row.occupancy, 0);
    return Math.round(total / this.rows.length);
  }

  protected get activeVolunteers(): number {
    return this.contributions.filter(row => row.activities > 0).length;
  }

  protected get topActivity(): ActivityReportRow | undefined {
    return [...this.rows].sort((a, b) => (b.activity.spotsTaken ?? 0) - (a.activity.spotsTaken ?? 0))[0];
  }

  protected setStatusFilter(status: StatusFilter): void {
    this.selectedStatus = status;
    this.renderCharts();
  }

  protected setUserMetric(metric: UserMetric): void {
    this.userMetric = metric;
    this.renderCharts();
  }

  protected onSelectedUserChange(): void {
    this.renderCharts();
  }

  protected clearCategoryFilter(): void {
    this.selectedCategory = '';
    this.renderCharts();
  }

  private renderCharts(): void {
    if (!this.monthlyChartRef || !this.categoryChartRef || !this.contributionChartRef || !this.capacityChartRef) {
      return;
    }

    this.destroyCharts();
    this.charts = [
      this.createChart(this.monthlyChartRef.nativeElement, this.monthlyConfig()),
      this.createChart(this.categoryChartRef.nativeElement, this.categoryConfig()),
      this.createChart(this.contributionChartRef.nativeElement, this.contributionConfig()),
      this.createChart(this.capacityChartRef.nativeElement, this.capacityConfig()),
    ];
  }

  private createChart<TType extends ChartType>(canvas: HTMLCanvasElement, config: ChartConfiguration<TType>): Chart<TType> {
    return new Chart(canvas, config);
  }

  private destroyCharts(): void {
    for (const chart of this.charts) {
      chart.destroy();
    }
    this.charts = [];
  }

  private monthlyConfig(): ChartConfiguration<'line'> {
    const monthly = this.groupBy(this.rows, row => row.monthLabel);
    const labels = Array.from(monthly.keys());

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Activities',
            data: labels.map(label => monthly.get(label)?.length ?? 0),
            borderColor: '#46608a',
            backgroundColor: 'rgba(70, 96, 138, 0.14)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      },
      options: this.baseOptions('Activity timeline') as ChartOptions<'line'>
    };
  }

  private categoryConfig(): ChartConfiguration<'doughnut'> {
    const categories = this.groupBy(this.rows, row => row.category);
    const labels = Array.from(categories.keys());

    return {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: labels.map(label => categories.get(label)?.length ?? 0),
            backgroundColor: labels.map((_, index) => this.palette[index % this.palette.length]),
            borderWidth: 0,
            hoverOffset: 10,
          }
        ]
      },
      options: {
        ...(this.baseOptions('Activity categories', false) as ChartOptions<'doughnut'>),
        cutout: '62%',
        onClick: (_event, elements, chart) => {
          const firstElement = elements[0];
          if (!firstElement) {
            return;
          }
          const label = chart.data.labels?.[firstElement.index];
          this.selectedCategory = typeof label === 'string' ? label : '';
          this.renderCharts();
        }
      }
    };
  }

  private contributionConfig(): ChartConfiguration<'bar'> {
    const rows = this.contributions;
    const selectedIndex = rows.findIndex(row => row.user.id === this.selectedUserId);

    return {
      type: 'bar',
      data: {
        labels: rows.map(row => row.user.name),
        datasets: [
          {
            label: this.userMetric === 'hours' ? 'Volunteer hours' : 'Activities joined',
            data: rows.map(row => this.userMetric === 'hours' ? row.hours : row.activities),
            backgroundColor: rows.map((_, index) => index === selectedIndex ? '#d66a4a' : 'rgba(70, 96, 138, 0.72)'),
            borderRadius: 8,
            maxBarThickness: 40,
          }
        ]
      },
      options: {
        ...(this.baseOptions('User contribution') as ChartOptions<'bar'>),
        indexAxis: 'y',
      }
    };
  }

  private capacityConfig(): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data: {
        labels: this.rows.map(row => row.activity.title),
        datasets: [
          {
            label: 'Spots taken',
            data: this.rows.map(row => row.activity.spotsTaken ?? row.activity.participants?.length ?? 0),
            backgroundColor: 'rgba(42, 157, 143, 0.72)',
            borderRadius: 8,
            maxBarThickness: 34,
          },
          {
            label: 'Capacity',
            data: this.rows.map(row => row.activity.capacity ?? 0),
            backgroundColor: 'rgba(175, 178, 187, 0.34)',
            borderRadius: 8,
            maxBarThickness: 34,
          }
        ]
      },
      options: this.baseOptions('Capacity overview') as ChartOptions<'bar'>
    };
  }

  private baseOptions(title: string, includeScales = true): ChartOptions<ChartType> {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
          }
        },
        title: {
          display: false,
          text: title,
        },
        tooltip: {
          backgroundColor: '#2f323a',
          padding: 12,
        }
      },
    } as ChartOptions<ChartType>;

    if (includeScales) {
      (options as { scales?: unknown }).scales = {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#5c5f68',
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(175, 178, 187, 0.2)',
          },
          ticks: {
            precision: 0,
            color: '#5c5f68',
          }
        }
      };
    }

    return options;
  }

  private toReportRow(activity: Activity): ActivityReportRow {
    const appointment = activity.appointments[0];
    const hours = appointment
      ? Math.max(1, (appointment.endDateTime.getTime() - appointment.startDateTime.getTime()) / 36e5)
      : this.parseDuration(activity.duration);
    const category = activity.organisations[0]?.category ?? 'Other';
    const spotsTaken = activity.spotsTaken ?? activity.participants?.length ?? 0;
    const capacity = activity.capacity ?? Math.max(spotsTaken, 1);

    return {
      activity,
      category,
      hours,
      monthLabel: this.formatMonth(activity.date ?? appointment?.startDateTime ?? activity.createdAt),
      occupancy: Math.round((spotsTaken / capacity) * 100),
    };
  }

  private parseDuration(duration?: string): number {
    const parsed = Number.parseFloat(duration ?? '');
    return Number.isFinite(parsed) ? parsed : 1;
  }

  private formatMonth(date: Date): string {
    return new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
  }

  private groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
    const grouped = new Map<string, T[]>();
    for (const item of items) {
      const key = getKey(item);
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }
    return grouped;
  }
}
