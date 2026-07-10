import { Injectable } from '@angular/core';
import {MOCK_NOTIFICATIONS} from '../mock/mock-notification';
import {AppNotification} from '../models/notification.model';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, finalize, map, Observable, of, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private mockNotifications = MOCK_NOTIFICATIONS.map(notification => ({...notification}));
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private hasLoaded = false;
  private isLoading = false;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<AppNotification[]> {
    if (!this.hasLoaded && !this.isLoading) {
      this.loadNotifications();
    }
    return this.notificationsSubject.asObservable();
  }

  refreshNotifications(): void {
    this.hasLoaded = false;
    this.loadNotifications();
  }

  private loadNotifications(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this.http.get<AppNotification[]>(`${this.apiUrl}/notifications`)
      .pipe(
        map(notifications => [...(notifications ?? []), ...this.mockNotifications]),
        catchError(() => of([...this.mockNotifications])),
        finalize(() => this.isLoading = false)
      )
      .subscribe(notifications => {
        this.hasLoaded = true;
        this.notificationsSubject.next(notifications);
      });
  }

  createNotification(notification: AppNotification){
    return this.http.post<AppNotification>(`${this.apiUrl}/addNotification`, notification)
  }

  readNotification(notification: AppNotification){
    if (notification.id !== undefined && notification.id < 0) {
      notification.hasBeenRead = true;
      this.mockNotifications = this.mockNotifications.filter(item => item.id !== notification.id);
      this.removeFromState(notification);
      return of(notification);
    }

    return this.http.post<AppNotification>(`${this.apiUrl}/read`, notification)
      .pipe(tap(() => this.removeFromState(notification)));
  }

  acceptFriendRequest(notification: AppNotification) {
    return this.http.post<AppNotification>(`${this.apiUrl}/${notification.id}/accept`, {})
      .pipe(tap(() => this.removeFromState(notification)));
  }

  rejectFriendRequest(notification: AppNotification) {
    return this.http.post<AppNotification>(`${this.apiUrl}/${notification.id}/reject`, {})
      .pipe(tap(() => this.removeFromState(notification)));
  }

  private removeFromState(notification: AppNotification): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.filter(item => item.id !== notification.id)
    );
  }
}
