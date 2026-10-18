import { DestroyRef, inject, Injectable } from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MOCK_NOTIFICATIONS} from '../mock/mock-notification';
import {AppNotification} from '../models/notification.model';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, EMPTY, exhaustMap, map, merge, Observable, of, Subject, switchMap, tap, timer} from 'rxjs';
import {AuthService} from './authservice/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;
  private mockNotifications = MOCK_NOTIFICATIONS.map(notification => ({...notification}));
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private readonly refreshSubject = new Subject<void>();

  constructor() {
    const authService = inject(AuthService);
    const destroyRef = inject(DestroyRef);
    authService.sessionToken$.pipe(
      switchMap(token => {
        // Switching sessions cancels the previous account's pending request and polling.
        this.notificationsSubject.next([]);
        this.mockNotifications = MOCK_NOTIFICATIONS.map(notification => ({...notification}));
        if (!token) return EMPTY;

        return merge(of(undefined), timer(30_000, 30_000), this.refreshSubject).pipe(
          exhaustMap(() => this.http.get<AppNotification[]>(`${this.apiUrl}/notifications`).pipe(
            map(notifications => [...(notifications ?? []), ...this.mockNotifications]),
            // Keep the last successful result and allow the next refresh to retry.
            catchError(() => EMPTY)
          ))
        );
      }),
      takeUntilDestroyed(destroyRef)
    ).subscribe(notifications => this.notificationsSubject.next(notifications));
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.notificationsSubject.asObservable();
  }

  refreshNotifications(): void {
    this.refreshSubject.next();
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
