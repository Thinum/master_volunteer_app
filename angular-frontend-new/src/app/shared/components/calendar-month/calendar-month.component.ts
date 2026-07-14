import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CalendarDay, CalendarEvent, CalendarEventType } from '../../../models/calendar-event.model';

@Component({
  selector: 'app-calendar-month',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './calendar-month.component.html',
  styleUrl: './calendar-month.component.css'
})
export class CalendarMonthComponent implements OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Input() compact = false;
  @Input() allowNavigation = true;
  @Output() daySelected = new EventEmitter<Date>();

  readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly eventTypes: { type: CalendarEventType; label: string }[] = [
    { type: 'activity', label: 'Activity' },
    { type: 'session', label: 'Activity session' },
    { type: 'personal', label: 'My appointment' },
    { type: 'goal', label: 'Community goal' },
    { type: 'deadline', label: 'Expiration' },
    { type: 'reactivation', label: 'Reactivation' }
  ];

  viewDate = this.startOfMonth(new Date());
  days: CalendarDay[] = [];

  private readonly router = inject(Router);

  constructor() {
    this.rebuildDays();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) this.rebuildDays();
  }

  get monthLabel(): string {
    return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(this.viewDate);
  }

  previousMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.rebuildDays();
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.rebuildDays();
  }

  goToToday(): void {
    this.viewDate = this.startOfMonth(new Date());
    this.rebuildDays();
  }

  selectDay(day: CalendarDay): void {
    this.daySelected.emit(new Date(day.date));
  }

  openEvent(event: CalendarEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    if (event.route) {
      domEvent.preventDefault();
      void this.router.navigateByUrl(event.route);
    }
  }

  visibleEvents(day: CalendarDay): CalendarEvent[] {
    return this.compact ? day.events.slice(0, 2) : day.events.slice(0, 3);
  }

  formatTime(event: CalendarEvent): string {
    if (event.allDay) return '';
    return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(event.start);
  }

  private rebuildDays(): void {
    const first = this.startOfMonth(this.viewDate);
    const mondayOffset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - mondayOffset);

    this.days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return {
        date,
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === this.viewDate.getMonth(),
        isToday: this.isSameDay(date, new Date()),
        events: this.eventsForDay(date)
      };
    });
  }

  private eventsForDay(date: Date): CalendarEvent[] {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.events
      .filter(event => event.start <= end && (event.end ?? event.start) >= start)
      .sort((left, right) => left.start.getTime() - right.start.getTime());
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private isSameDay(left: Date, right: Date): boolean {
    return left.getFullYear() === right.getFullYear()
      && left.getMonth() === right.getMonth()
      && left.getDate() === right.getDate();
  }
}