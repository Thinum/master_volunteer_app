import { Injectable } from '@angular/core';
import {MOCK_NOTIFICATIONS} from '../mock/mock-notification';
import {AppNotification} from '../models/notification.model';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {AuthService} from './authservice/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getNotifications(){
    return this.http.get<AppNotification[]>(`${this.apiUrl}/notifications`)
  }

  createNotification(notification: AppNotification){
    return this.http.post<AppNotification>(`${this.apiUrl}/addNotification`, notification)
  }

  readNotification(notification: AppNotification){
    return this.http.post<AppNotification>(`${this.apiUrl}/read`, notification)
  }
}
