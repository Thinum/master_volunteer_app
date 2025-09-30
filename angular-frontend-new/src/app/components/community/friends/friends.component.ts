import { Component } from '@angular/core';
import {FriendListComponent} from './friend-list/friend-list.component';
import {VolunteerService} from '../../../services/api/volunteer.service';
import {User} from '../../../models/user.model';

@Component({
  selector: 'app-friends',
  imports: [
    FriendListComponent
  ],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css'
})
export class FriendsComponent {
  friends: User[];
  constructor(private volunteerService: VolunteerService) {
    this.friends = volunteerService.getUsers();
  }
}
