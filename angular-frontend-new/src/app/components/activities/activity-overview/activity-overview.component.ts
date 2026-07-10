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

import { Activity, RecommendationReason } from '../../../models/activity.model';
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
  private backendRecommendedActivities: Activity[] = [];
  searchTerm = '';
  selectedStatus: Activity['status'] | null = null;
  selectedTags: string[] = [];
  tagOptions: string[] = [];
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
    forkJoin({
      activities: this.activityService.getAllActivities(),
      recommendations: this.activityService.getRecommendedActivities().pipe(catchError(() => of([]))),
      tagCatalog: this.activityService.getActivityTagCatalog().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ activities, recommendations, tagCatalog }) => {
        this.activities = (activities || []).map(activity => this.withFriendParticipants(activity));
        this.tagOptions = this.getTagOptions(tagCatalog, this.activities);
        this.backendRecommendedActivities = (recommendations || []).map(recommendation => this.withFriendParticipants({
          ...recommendation.activity,
          recommendation: {
            score: recommendation.score,
            reasons: recommendation.reasons || []
          }
        }));
        this.applyFilters();
      },
      error: err => console.error('Could not load activities', err)
    });
  }

  getOrganisationNames(activity: Activity): string {
    return activity.organisations?.map(org => org.orgName).join(', ') || 'No organization';
  }

  getVisibleTags(activity: Activity): string[] {
    return (activity.tags || []).slice(0, 4);
  }

  getVisibleReasons(activity: Activity): RecommendationReason[] {
    return (activity.recommendation?.reasons || []).slice(0, 3);
  }

  isRecommendationMatchedTag(activity: Activity, tag: string): boolean {
    const normalizedTag = this.normalizeChip(tag);
    return (activity.recommendation?.reasons || []).some(reason =>
      reason.type === 'TAG' && this.normalizeChip(reason.label) === normalizedTag
    );
  }

  get activeFilterCount(): number {
    return (this.selectedStatus ? 1 : 0) + this.selectedTags.length;
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    this.filteredActivities = this.activities.filter(activity => this.matchesFilters(activity, search));
  }

  toggleStatus(status: Activity['status']): void {
    this.selectedStatus = this.selectedStatus === status ? null : status;
    this.applyFilters();
  }

  toggleTag(tag: string): void {
    this.selectedTags = this.selectedTags.includes(tag)
      ? this.selectedTags.filter(selectedTag => selectedTag !== tag)
      : [...this.selectedTags, tag];
    this.applyFilters();
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedTags = [];
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
    const source = this.backendRecommendedActivities.length
      ? this.backendRecommendedActivities.filter(activity => this.matchesFilters(activity, this.searchTerm.trim().toLowerCase()))
      : this.filteredActivities;

    return source
      .filter(activity => !this.joinedActivityIds.has(activity.id) && activity.status !== 'finished' && activity.status !== 'canceled')
      .slice(0, 3);
  }

  addNew(): void {
  }

  private withFriendParticipants(activity: Activity): Activity {
    return {
      ...activity,
      participants: (activity.participants || []).filter(participant => this.friendIds.has(participant.id))
    };
  }

  private matchesFilters(activity: Activity, search: string): boolean {
    const matchesSearch = !search ||
      activity.title.toLowerCase().includes(search) ||
      (activity.description || activity.body || '').toLowerCase().includes(search) ||
      this.getOrganisationNames(activity).toLowerCase().includes(search) ||
      (activity.tags || []).some(tag => tag.toLowerCase().includes(search));
    const matchesStatus = !this.selectedStatus || (activity.status || 'open') === this.selectedStatus;
    const matchesTags = this.selectedTags.length === 0 || this.selectedTags.every(selectedTag =>
      (activity.tags || []).some(tag => this.normalizeChip(tag) === this.normalizeChip(selectedTag))
    );
    return matchesSearch && matchesStatus && matchesTags;
  }

  private getTagOptions(tagCatalog: string[], activities: Activity[]): string[] {
    const tags = new Map<string, string>();
    const activityTags: string[] = [];

    activities.forEach(activity => {
      activityTags.push(...(activity.tags || []));
    });

    [...(tagCatalog || []), ...activityTags]
      .map(tag => tag?.trim())
      .filter((tag): tag is string => !!tag)
      .forEach(tag => {
        const normalized = this.normalizeChip(tag);
        if (!tags.has(normalized)) {
          tags.set(normalized, tag);
        }
      });

    return Array.from(tags.values()).sort((first, second) => first.localeCompare(second));
  }

  private normalizeChip(value: string): string {
    return value.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  }
}
