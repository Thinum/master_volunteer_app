import { Component } from '@angular/core';
import {FriendListComponent} from './friend-list/friend-list.component';
import {FriendsGraphComponent} from './friends-graph/friends-graph.component';
import {VolunteerService} from '../../../services/api/volunteer.service';
import {User} from '../../../models/user.model';
import {ActivitiesSmallCardComponent} from '../../activities/activities-small-card/activities-small-card.component';
import {Activity} from '../../../models/activity.model';
import {ActivityService} from '../../../services/api/activity.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-friends',
  imports: [
    FriendListComponent,
    FriendsGraphComponent,
    ActivitiesSmallCardComponent,
    NgForOf
  ],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css'
})
export class FriendsComponent {
  friends: User[];
  activitiesOfFriends?: Activity[];

  constructor(private volunteerService: VolunteerService, private activityService: ActivityService) {
    this.friends = volunteerService.getUsers();
    activityService.getActivityByUserPartIn(1).
      subscribe(activities => this.activitiesOfFriends = activities);
  }
}
