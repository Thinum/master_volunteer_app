import { Component, OnInit } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatList } from '@angular/material/list';
import { User } from '../../../models/user.model';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VolunteerService } from '../../../services/api/volunteer.service';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {NotificationService} from '../../../services/notification.service';
import {AppNotification, NotificationType, AppNotificationPayload} from '../../../models/notification.model';

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
    MatIcon,
    MatIconButton,
  ],
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  user?: User;
  id?: number;

  constructor(
    private route: ActivatedRoute,
    private volunteerService: VolunteerService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(this.id) && this.id) {
      this.volunteerService.getVolunteerById(this.id).subscribe(user => {
        this.user = user;
      });
    }else{
      this.volunteerService.getVolunteerById(1).subscribe(user => {
        this.user = user;
      });
    }
  }

  public sendFriendRequest(){
    let notification: AppNotification = {
      createdAt: new Date(),
      hasBeenRead: false,
      user: this.user,
      type: NotificationType.FRIEND_REQUEST,
    }
    this.notificationService.createNotification(notification).subscribe({
      next: result => console.log(result),
      error: err => console.error(err)
    });
  }
}
