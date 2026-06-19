import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FriendListComponent } from './friend-list/friend-list.component';
import { FriendsGraphComponent } from './friends-graph/friends-graph.component';
import { ActivityGraphComponent } from './activity-graph/activity-graph.component';
import { ActivitiesSmallCardComponent } from '../../activities/activities-small-card/activities-small-card.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { NgIf } from '@angular/common';

import { VolunteerService } from '../../../services/api/volunteer.service';
import { ActivityService } from '../../../services/api/activity.service';

import { User } from '../../../models/user.model';
import { Activity } from '../../../models/activity.model';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [
    FriendListComponent,
    FriendsGraphComponent,
    ActivityGraphComponent,
    ActivitiesSmallCardComponent,
    NgForOf,
    MatTabGroup,
    MatTab,
  ],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent implements OnInit {
  friends: User[] = [];
  activitiesOfFriends: Activity[] = [];
  activeTab = 0;
  currentUserId = 1;

  private destroyRef = inject(DestroyRef);

  constructor(
    private volunteerService: VolunteerService,
    private activityService: ActivityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.volunteerService.getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (user && user.id) {
            this.currentUserId = user.id;
          }
          this.loadDataForUser(this.currentUserId);
        },
        error: () => {
          this.currentUserId = 1;
          this.loadDataForUser(this.currentUserId);
        }
      });
  }

  loadDataForUser(userId: number): void {
    this.volunteerService.getConnections(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(friends => this.friends = friends);

    this.activityService.getActivitiesByUserParticipation(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(activities => this.activitiesOfFriends = activities);
  }

  goToActivity(id: number): void {
    this.router.navigate(['/activities', id]);
  }
}
