import { Injectable } from '@angular/core';
import {MOCK_NOTIFICATIONS} from '../mock/mock-notification';
import {Observable, of} from 'rxjs';
import {AppNotification} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Maybe remove for push notifications

  private readonly mockNotificationObservable: Observable<AppNotification[]>;
  constructor() {
    this.mockNotificationObservable = of(MOCK_NOTIFICATIONS);
  }

  getNotifications(){
    return this.mockNotificationObservable;
  }

  setNotificationRead(notification: AppNotification){
    MOCK_NOTIFICATIONS[notification.id] = notification;
    MOCK_NOTIFICATIONS[notification.id].wasRead = true;
  }
}
