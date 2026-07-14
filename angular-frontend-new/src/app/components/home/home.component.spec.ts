import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { VolunteerService } from '../../services/api/volunteer.service';
import { NotificationService } from '../../services/notification.service';
import { ActivityService } from '../../services/api/activity.service';
import { of } from 'rxjs';
import { CalendarDataService } from '../../services/api/calendar-data.service';
import { Activity } from '../../models/activity.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockVolunteerService: any;
  let mockNotificationService: any;
  let mockActivityService: any;
  let mockCalendarDataService: jasmine.SpyObj<CalendarDataService>;

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

    mockCalendarDataService = jasmine.createSpyObj<CalendarDataService>('CalendarDataService', ['loadEvents']);
    mockCalendarDataService.loadEvents.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: VolunteerService, useValue: mockVolunteerService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: CalendarDataService, useValue: mockCalendarDataService }
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
  it('refreshes the calendar after joining an activity', () => {
    const initialCalendarLoads = mockCalendarDataService.loadEvents.calls.count();
    const joinedActivity: Activity = {
      id: 9,
      title: 'Test activity',
      body: 'Test activity body',
      organisations: [],
      appointments: [],
      participants: [],
      skills: [],
      qualifications: [],
      prerequisites: [],
      capacity: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    component.recommendedActivities = [joinedActivity];

    component.joinActivity(9);

    expect(mockActivityService.joinActivity).toHaveBeenCalledWith(9);
    expect(mockCalendarDataService.loadEvents.calls.count()).toBe(initialCalendarLoads + 1);
  });
});
