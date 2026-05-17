import { Component, OnInit } from '@angular/core';
import { NgForOf } from '@angular/common';
import { Router } from '@angular/router';

import { FriendListComponent } from './friend-list/friend-list.component';
import { FriendsGraphComponent } from './friends-graph/friends-graph.component';
import { ActivitiesSmallCardComponent } from '../../activities/activities-small-card/activities-small-card.component';

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
    ActivitiesSmallCardComponent,
    NgForOf,
  ],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css',
})
export class FriendsComponent implements OnInit {
  friends: User[] = [];
  activitiesOfFriends: Activity[] = [];

  constructor(
    private volunteerService: VolunteerService,
    private activityService: ActivityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.volunteerService.getAllVolunteers().subscribe(users => {
      this.friends = users;
    });

    this.activityService
      .getActivitiesByUserParticipation(1)
      .subscribe(activities => {
        this.activitiesOfFriends = activities// Optinal: .slice(0, 3);
      });
  }

  goToActivity(id: number): void {
    this.router.navigate(['/activities', id]);
  }
}
