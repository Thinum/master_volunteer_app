import { Component } from '@angular/core';
import {NotificationService} from '../../../services/notification.service';
import {AppNotification} from '../../../models/notification.model';
import {CardComponent} from '../../../shared/components/card/card.component';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-notifications-list',
  imports: [
    CardComponent,
    MatIcon
  ],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.css'
})
export class NotificationsListComponent {
    public notificationsToDisplay: AppNotification[] = [];
    constructor(notificationService: NotificationService) {
      notificationService.getNotifications().subscribe(notifications => {
        this.notificationsToDisplay = notifications ?? [];
      })
    }
}
