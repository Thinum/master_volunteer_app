import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {UnreadBadgeComponent} from '../unread-badge/unread-badge.component';
import {NotificationService} from '../../../services/notification.service';

@Component({
  selector: 'app-notification-bar',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    UnreadBadgeComponent,
  ],
  templateUrl: './notification-bar.component.html',
  styleUrl: './notification-bar.component.css'
})
export class NotificationBarComponent {
  protected notificationCount: number = 0;
  constructor(private notificationService: NotificationService) {
    notificationService.getNotifications().subscribe(notifications => {
      this.notificationCount = notifications.length;
    })
  }
}
