import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card/card.component';
import { User } from '../../models/user.model';
import { Activity } from '../../models/activity.model';
import { Organisation } from '../../models/organisation.model';
import { VolunteerService } from '../../services/api/volunteer.service';
import { NotificationService } from '../../services/notification.service';
import { ActivityService } from '../../services/api/activity.service';
import { NotificationType } from '../../models/notification.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    CardComponent
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
  requests: any[] = [];

  constructor(
    private volunteerService: VolunteerService,
    private notificationService: NotificationService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadNotifications();
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
    this.activityService.getAllActivities().subscribe({
      next: (allActivities) => {
        const joinedIds = new Set(joinedActivities.map(a => a.id));
        this.recommendedActivities = (allActivities || [])
          .filter(a => !joinedIds.has(a.id))
          .slice(0, 3);
      },
      error: (err) => console.error('Error fetching recommended activities:', err)
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

  joinActivity(activityId: number): void {
    const activity = this.recommendedActivities.find(act => act.id === activityId);
    if (activity && this.isActivityFull(activity)) {
      return;
    }

    this.activityService.joinActivity(activityId).subscribe({
      next: (success) => {
        if (success) {
          this.loadUserData();
        }
      },
      error: (err) => console.error('Error joining activity:', err)
    });
  }
}
