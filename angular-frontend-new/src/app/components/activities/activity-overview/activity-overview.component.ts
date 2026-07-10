import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { DatePipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Activity } from '../../../models/activity.model';
import { ActivityService } from '../../../services/api/activity.service';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-activity-overview',
  imports: [NgFor, NgIf, NgTemplateOutlet, DatePipe, RouterLink, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatChipsModule, MatTooltipModule],
  templateUrl: './activity-overview.component.html',
  styleUrl: './activity-overview.component.css'
})

export class ActivityOverviewComponent implements OnInit {
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  searchTerm = '';
  selectedStatus: Activity['status'] | null = null;
  showFilters = false;
  private friendIds = new Set<number>();
  private joinedActivityIds = new Set<number>();

  constructor(
    private activityService: ActivityService,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit(): void {
    this.volunteerService.getCurrentUser().subscribe({
      next: user => {
        forkJoin({
          friends: this.volunteerService.getFriends(user.id).pipe(catchError(() => of([]))),
          joinedActivities: this.volunteerService.getActivities(user.id).pipe(catchError(() => of([])))
        }).subscribe({
          next: ({ friends, joinedActivities }) => {
            this.friendIds = new Set((friends || []).map(friend => friend.id));
            this.joinedActivityIds = new Set((joinedActivities || []).map(activity => activity.id));
            this.loadActivities();
          },
          error: err => {
            console.error('Could not load user activity data', err);
            this.loadActivities();
          }
        });
      },
      error: err => {
        console.error('Could not load current user', err);
        this.loadActivities();
      }
    });
  }

  private loadActivities(): void {
    this.activityService.getAllActivities().subscribe({
      next: activities => {
        this.activities = (activities || []).map(activity => ({
          ...activity,
          participants: (activity.participants || []).filter(participant => this.friendIds.has(participant.id))
        }));
        this.applyFilters();
      },
      error: err => console.error('Could not load activities', err)
    });
  }

  getOrganisationNames(activity: Activity): string {
    return activity.organisations?.map(org => org.orgName).join(', ') || 'No organization';
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    this.filteredActivities = this.activities.filter(activity => {
      const matchesSearch = !search ||
        activity.title.toLowerCase().includes(search) ||
        (activity.description || activity.body || '').toLowerCase().includes(search) ||
        this.getOrganisationNames(activity).toLowerCase().includes(search);
      const matchesStatus = !this.selectedStatus || (activity.status || 'open') === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  toggleStatus(status: Activity['status']): void {
    this.selectedStatus = this.selectedStatus === status ? null : status;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.applyFilters();
  }

  get activitiesWithFriends(): number {
    return this.activities.filter(activity => activity.participants?.length).length;
  }

  get joinedActivitiesCount(): number {
    return this.joinedActivityIds.size;
  }

  get openActivitiesCount(): number {
    return this.activities.filter(activity => !activity.status || activity.status === 'open' || activity.status === 'upcoming').length;
  }

  get joinedActivities(): Activity[] {
    return this.filteredActivities.filter(activity => this.joinedActivityIds.has(activity.id));
  }

  get recommendedActivities(): Activity[] {
    return this.filteredActivities
      .filter(activity => !this.joinedActivityIds.has(activity.id) && activity.status !== 'finished' && activity.status !== 'canceled')
      .slice(0, 3);
  }

  addNew(): void {
  }
}
