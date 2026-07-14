import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { VolunteerService } from '../../services/api/volunteer.service';
import { NotificationService } from '../../services/notification.service';
import { ActivityService } from '../../services/api/activity.service';
import { of } from 'rxjs';
import { CalendarDataService } from '../../services/api/calendar-data.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockVolunteerService: any;
  let mockNotificationService: any;
  let mockActivityService: any;

  beforeEach(async () => {
    mockVolunteerService = {
      getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(of({ id: 1, name: 'Test User', profilePicture: '' })),
      getActivities: jasmine.createSpy('getActivities').and.returnValue(of([])),
      getOrganisations: jasmine.createSpy('getOrganisations').and.returnValue(of([])),
      getFriends: jasmine.createSpy('getFriends').and.returnValue(of([]))
    };

    mockNotificationService = {
      getNotifications: jasmine.createSpy('getNotifications').and.returnValue(of([]))
    };

    mockActivityService = {
      getAllActivities: jasmine.createSpy('getAllActivities').and.returnValue(of([])),
      joinActivity: jasmine.createSpy('joinActivity').and.returnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: VolunteerService, useValue: mockVolunteerService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: CalendarDataService, useValue: { loadEvents: () => of([]) } }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
