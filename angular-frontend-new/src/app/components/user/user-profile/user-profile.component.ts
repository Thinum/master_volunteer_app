import { Component } from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatList} from '@angular/material/list';
import {User} from '../../../models/user.model';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  imports: [
    MatCard,
    MatCardSubtitle,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    MatList,
    DatePipe,
  ],
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  user: User | undefined = {
    email: 'test@test', id: 0, joinedAt: new Date(), name: 'Heinrich', profilePicture: 'https://i.imgur.com/0np9ebl.jpeg'
  };
}
