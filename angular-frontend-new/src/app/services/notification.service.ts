import { Injectable } from '@angular/core';
import {MOCK_NOTIFICATIONS} from '../mock/mock-notification';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Maybe remove for push notifications
  constructor() { }

  getNotifications(){
    return of(MOCK_NOTIFICATIONS);
  }
}
