import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppNotification, NotificationType } from '../models/notification.model';
import { AuthService } from './authservice/auth.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  const url = `${environment.apiUrl}/notifications/notifications`;
  let service: NotificationService;
  let http: HttpTestingController;
  let session: BehaviorSubject<string | null>;
  let displayed: AppNotification[];

  const friendRequest = (id: number): AppNotification => ({
    id, type: NotificationType.FRIEND_REQUEST, hasBeenRead: false, createdAt: new Date()
  });

  beforeEach(() => {
    session = new BehaviorSubject<string | null>(null);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: AuthService, useValue: { sessionToken$: session.asObservable() } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(NotificationService);
    service.getNotifications().subscribe(value => displayed = value);
  });

  afterEach(() => {
    session.next(null);
    http.verify();
  });

  it('does not fetch or show notifications while logged out', () => {
    service.refreshNotifications();
    http.expectNone(url);
    expect(displayed).toEqual([]);
  });

  it('clears the old account immediately and fetches the new account', () => {
    session.next('account-a');
    http.expectOne(url).flush([friendRequest(1)]);
    expect(displayed.some(item => item.id === 1)).toBeTrue();
    session.next('account-b');
    expect(displayed).toEqual([]);
    http.expectOne(url).flush([friendRequest(2)]);
    expect(displayed.some(item => item.id === 1)).toBeFalse();
    expect(displayed.some(item => item.id === 2)).toBeTrue();
  });

  it('cancels an old account load when switching accounts', () => {
    session.next('account-a');
    const oldRequest = http.expectOne(url);
    session.next('account-b');
    expect(oldRequest.cancelled).toBeTrue();
    http.expectOne(url).flush([friendRequest(2)]);
    expect(displayed.some(item => item.id === 2)).toBeTrue();
  });

  it('clears notifications and stops polling on logout', fakeAsync(() => {
    session.next('account-a');
    http.expectOne(url).flush([friendRequest(1)]);
    session.next(null);
    expect(displayed).toEqual([]);
    tick(60_000);
    http.expectNone(url);
  }));

  it('cancels an unfinished load on logout', () => {
    session.next('account-a');
    const request = http.expectOne(url);
    session.next(null);
    expect(request.cancelled).toBeTrue();
    expect(displayed).toEqual([]);
  });

  it('polls for requests that arrive after the initial load', fakeAsync(() => {
    session.next('account-a');
    http.expectOne(url).flush([]);
    tick(30_000);
    http.expectOne(url).flush([friendRequest(3)]);
    expect(displayed.some(item => item.id === 3)).toBeTrue();
    session.next(null);
  }));

  it('retries a failed initial load without displaying mock success data', () => {
    session.next('account-a');
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server error' });
    expect(displayed).toEqual([]);
    service.refreshNotifications();
    http.expectOne(url).flush([friendRequest(4)]);
    expect(displayed.some(item => item.id === 4)).toBeTrue();
  });

  it('keeps the last result after a refresh error and retries on the next poll', fakeAsync(() => {
    session.next('account-a');
    http.expectOne(url).flush([friendRequest(1)]);
    service.refreshNotifications();
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server error' });
    expect(displayed.some(item => item.id === 1)).toBeTrue();
    tick(30_000);
    http.expectOne(url).flush([friendRequest(1), friendRequest(2)]);
    expect(displayed.some(item => item.id === 2)).toBeTrue();
    session.next(null);
  }));

  it('shares one pending fetch across consumers and refresh triggers', () => {
    session.next('account-a');
    service.getNotifications().subscribe();
    service.refreshNotifications();
    http.expectOne(url).flush([]);
    service.refreshNotifications();
    http.expectOne(url).flush([friendRequest(5)]);
    expect(displayed.some(item => item.id === 5)).toBeTrue();
  });
});
