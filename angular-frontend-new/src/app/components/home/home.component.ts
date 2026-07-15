import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CardComponent } from '../../shared/components/card/card.component';
import { User } from '../../models/user.model';
import { Activity, RecommendationReason } from '../../models/activity.model';
import { Organisation } from '../../models/organisation.model';
import { VolunteerService } from '../../services/api/volunteer.service';
import { NotificationService } from '../../services/notification.service';
import { ActivityService } from '../../services/api/activity.service';
import { NotificationType } from '../../models/notification.model';
import { CalendarEvent } from '../../models/calendar-event.model';
import { CalendarDataService } from '../../services/api/calendar-data.service';
import { CalendarMonthComponent } from '../../shared/components/calendar-month/calendar-month.component';

interface VerificationRequest {
  id?: number;
  organisation: string;
  title: string;
  hours: number;
  user: { name: string; avatar: string };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    RouterLink,
    CardComponent,
    CalendarMonthComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  activitiesCount = 0;
  organisationsCount = 0;
  friendsCount = 0;

  lastActivity: Activity | null = null;
  lastOrganisation: Organisation | null = null;
  lastFriend: User | null = null;

  recommendedActivities: Activity[] = [];
  requests: VerificationRequest[] = [];
  calendarEvents: CalendarEvent[] = [];

  private readonly volunteerService = inject(VolunteerService);
  private readonly notificationService = inject(NotificationService);
  private readonly activityService = inject(ActivityService);
  private readonly calendarDataService = inject(CalendarDataService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadUserData();
    this.loadNotifications();
    this.loadCalendar();
  }

  private loadCalendar(): void {
    this.calendarDataService.loadEvents().subscribe({
      next: events => this.calendarEvents = events,
      error: err => console.error('Error fetching calendar data:', err)
    });
  }

  loadUserData(): void {
    this.volunteerService.getCurrentUser().subscribe({
      next: (currentUser: User) => {
        if (currentUser) {
          this.currentUser = currentUser;

          // Fetch activities
          this.volunteerService.getActivities(currentUser.id).subscribe({
            next: (activities) => {
              const acts = activities || [];
              this.activitiesCount = acts.length;
              if (acts.length > 0) {
                this.lastActivity = acts[acts.length - 1];
              }
              // Fetch recommended activities
              this.loadRecommendedActivities(acts);
            },
            error: (err) => console.error('Error fetching activities:', err)
          });

          // Fetch organisations
          this.volunteerService.getOrganisations(currentUser.id).subscribe({
            next: (orgs) => {
              const oList = orgs || [];
              this.organisationsCount = oList.length;
              if (oList.length > 0) {
                this.lastOrganisation = oList[oList.length - 1];
              }
            },
            error: (err) => console.error('Error fetching organisations:', err)
          });

          // Fetch friends
          this.volunteerService.getFriends(currentUser.id).subscribe({
            next: (friends) => {
              const fList = friends || [];
              this.friendsCount = fList.length;
              if (fList.length > 0) {
                this.lastFriend = fList[fList.length - 1];
              }
            },
            error: (err) => console.error('Error fetching friends:', err)
          });
        }
      },
      error: (err) => console.error('Error fetching current user:', err)
    });
  }

  private loadRecommendedActivities(joinedActivities: Activity[]): void {
    this.activityService.getRecommendedActivities().subscribe({
      next: (recommendations) => {
        const joinedIds = new Set(joinedActivities.map(a => a.id));
        this.recommendedActivities = (recommendations || [])
          .filter(recommendation => !joinedIds.has(recommendation.activity.id))
          .slice(0, 3)
          .map(recommendation => ({
            ...recommendation.activity,
            recommendation: {
              score: recommendation.score,
              reasons: recommendation.reasons || []
            }
          }));
      },
      error: (err) => {
        console.error('Error fetching recommended activities:', err);
        this.recommendedActivities = [];
      }
    });
  }

  private loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.requests = (notifications || [])
          .filter(notif => notif.type === NotificationType.FRIEND_REQUEST)
          .map(notif => ({
          id: notif.id,
          organisation: notif.title || 'Notification',
          title: notif.text || 'New request received',
          hours: notif.id && notif.id > 0 ? (notif.id * 4) % 12 + 1 : 4,
          user: {
            name: notif.user?.name || 'System',
            avatar: notif.user?.profilePicture || 'https://i.pravatar.cc/40?img=1'
          }
          }));
      },
      error: (err) => console.error('Error fetching notifications:', err)
    });
  }

  getSpotsTaken(activity: Activity): number {
    return activity.spotsTaken ?? activity.participants?.length ?? 0;
  }

  isActivityFull(activity: Activity): boolean {
    return !!activity.capacity && this.getSpotsTaken(activity) >= activity.capacity;
  }

  getVisibleTags(activity: Activity): string[] {
    return this.uniqueLabels(activity.tags || []).slice(0, 4);
  }

  getVisibleSkills(activity: Activity): string[] {
    return this.uniqueLabels(activity.skills || []);
  }

  isRecommendationMatchedTag(activity: Activity, tag: string): boolean {
    const normalizedTag = this.normalizeChip(tag);
    return (activity.recommendation?.reasons || []).some(reason =>
      this.normalizeChip(reason.label) === normalizedTag
    );
  }

  getVisibleReasons(activity: Activity): RecommendationReason[] {
    const visibleLabels = new Set([
      ...this.getVisibleTags(activity),
      ...this.getVisibleSkills(activity)
    ].map(label => this.normalizeChip(label)));
    const reasonsByLabel = new Map<string, RecommendationReason>();

    (activity.recommendation?.reasons || []).forEach(reason => {
      const normalizedLabel = this.normalizeChip(reason.label);
      if (!visibleLabels.has(normalizedLabel) && !reasonsByLabel.has(normalizedLabel)) {
        reasonsByLabel.set(normalizedLabel, reason);
      }
    });

    return Array.from(reasonsByLabel.values()).slice(0, 3);
  }

  joinActivity(activityId: number): void {
    const activity = this.recommendedActivities.find(act => act.id === activityId);
    if (activity && this.isActivityFull(activity)) {
      return;
    }

    this.activityService.joinActivity(activityId).subscribe({
      next: (success) => {
        if (success) {
          this.loadUserData();
          this.loadCalendar();
        }
      },
      error: (error) => this.snackBar.open(
        error?.error?.detail || error?.error?.message || 'Could not join this activity.', 'Close', { duration: 5000 }
      )
    });
  }

  private normalizeChip(value: string): string {
    return value.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  }

  private uniqueLabels(values: string[]): string[] {
    const labels = new Map<string, string>();

    values
      .map(value => value?.trim().replace(/\s+/g, ' '))
      .filter((value): value is string => !!value)
      .forEach(value => {
        const normalized = this.normalizeChip(value);
        if (!labels.has(normalized)) {
          labels.set(normalized, value);
        }
      });

    return Array.from(labels.values());
  }
}
