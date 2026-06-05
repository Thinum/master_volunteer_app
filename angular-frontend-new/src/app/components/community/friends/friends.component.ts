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
    NgIf,
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

  private destroyRef = inject(DestroyRef);

  constructor(
    private volunteerService: VolunteerService,
    private activityService: ActivityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // TODO: replace with real auth user id
    const userId = 1;


    this.volunteerService.getAllVolunteers().subscribe(users => { this.friends = users; });

    this.activityService
      .getActivitiesByUserParticipation(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (activities) => {
          this.activitiesOfFriends = activities;

          /*
          // collect friends from all activities safely
          this.friends = Array.from(
            new Map(
              (activities as Activity[])
                .flatMap(a => (a.friends ?? []) as User[])
                .map(f => [f.id, f] as [number, User])
            ).values()
          );

           */
        },
      });
  }

  goToActivity(id: number): void {
    this.router.navigate(['/activities', id]);
  }
}
