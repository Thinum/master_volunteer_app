import { Component, OnInit } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { User } from '../../../models/user.model';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VolunteerService } from '../../../services/api/volunteer.service';
import {MatIcon} from '@angular/material/icon';
import {MatFabButton, MatIconButton} from '@angular/material/button';
import {NotificationService} from '../../../services/notification.service';
import {AppNotification, NotificationType, AppNotificationPayload} from '../../../models/notification.model';
import {CardComponent} from '../../../shared/components/card/card.component';
import {ShareButtonComponent} from '../../../shared/components/share-button/share-button.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  imports: [
    MatCard,
    MatCardSubtitle,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    DatePipe,
    MatIcon,
    MatIconButton,
    CardComponent,
    ShareButtonComponent,
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
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.id = Number(idParam);
        if (!isNaN(this.id)) {
          this.loadUser(this.id);
        }
      } else {
        this.loadCurrentUser();
      }
    });
  }

  loadCurrentUser(): void {
    this.volunteerService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (user.id) {
        this.id = user.id;
        this.loadFriends(user.id);
        this.loadOrganisations(user.id);
        this.loadActivities(user.id);
      }
    });
  }

  loadUser(id: number): void {
    this.volunteerService.getVolunteerById(id).subscribe(user => {
      this.user = user;
      this.loadFriends(id);
      this.loadOrganisations(id);
      this.loadActivities(id);
    });
  }

  loadFriends(id: number): void {
    this.volunteerService.getFriends(id).subscribe(friends => {
      if (this.user) {
        this.user.friends = friends;
      }
    });
  }

  loadOrganisations(id: number): void {
    this.volunteerService.getOrganisations(id).subscribe(organisations => {
      if (this.user) {
        this.user.organisations = organisations;
      }
    });
  }

  loadActivities(id: number): void {
    this.volunteerService.getActivities(id).subscribe(activities => {
      if (this.user) {
        this.user.activities = activities;
      }
    });
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
