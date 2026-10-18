import { Component, inject, OnInit } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NotificationService} from '../../../services/notification.service';
import {AppNotification, NotificationType} from '../../../models/notification.model';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-notifications-list',
  imports: [
    MatIcon,
    MatButtonModule
  ],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.css'
})
export class NotificationsListComponent implements OnInit {
    private readonly notificationService = inject(NotificationService);
    protected readonly NotificationType = NotificationType;
    public notificationsToDisplay: AppNotification[] = [];
    constructor() {
      this.notificationService.getNotifications().pipe(takeUntilDestroyed()).subscribe(notifications => {
        this.notificationsToDisplay = notifications ?? [];
      })
    }

    ngOnInit(): void {
      this.notificationService.refreshNotifications();
    }

    public onNotificationClick(notification: AppNotification) {
      this.notificationService.readNotification(notification).subscribe({
        next: () => {
          this.notificationsToDisplay = this.notificationsToDisplay.filter(item => item.id !== notification.id);
        },
        error: err => console.error(err),
      })
    }

    public getProgress(notification: AppNotification): number | null {
      const value = Number(
        notification.notificationPayloadList?.find(payload => payload.payloadType === 'progress')?.payload
      );
      return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null;
    }

    public acceptFriendRequest(notification: AppNotification): void {
      this.notificationService.acceptFriendRequest(notification).subscribe({
        next: () => this.removeNotification(notification),
        error: err => console.error(err),
      });
    }

    public rejectFriendRequest(notification: AppNotification): void {
      this.notificationService.rejectFriendRequest(notification).subscribe({
        next: () => this.removeNotification(notification),
        error: err => console.error(err),
      });
    }

    private removeNotification(notification: AppNotification): void {
      this.notificationsToDisplay = this.notificationsToDisplay.filter(item => item.id !== notification.id);
    }
}
