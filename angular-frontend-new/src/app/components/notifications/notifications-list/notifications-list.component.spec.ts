import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsListComponent } from './notifications-list.component';
import { NotificationService } from '../../../services/notification.service';
import { BehaviorSubject } from 'rxjs';
import { AppNotification } from '../../../models/notification.model';

describe('NotificationsListComponent', () => {
  let component: NotificationsListComponent;
  let fixture: ComponentFixture<NotificationsListComponent>;
  let notifications: BehaviorSubject<AppNotification[]>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    notifications = new BehaviorSubject<AppNotification[]>([]);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'getNotifications', 'refreshNotifications'
    ]);
    notificationService.getNotifications.and.returnValue(notifications.asObservable());
    await TestBed.configureTestingModule({
      imports: [NotificationsListComponent],
      providers: [{ provide: NotificationService, useValue: notificationService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('refreshes notifications when the page opens', () => {
    expect(notificationService.refreshNotifications).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes from notifications when the page closes', () => {
    fixture.destroy();
    expect(notifications.observed).toBeFalse();
  });
});
