import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Activity } from '../../models/activity.model';
import { Appointment } from '../../models/appointment.model';
import { CalendarEvent } from '../../models/calendar-event.model';
import { CommunityGoal } from '../../models/community-goal.model';
import { Organisation } from '../../models/organisation.model';
import { ActivityService } from './activity.service';
import { AppointmentService } from './appointment.service';
import { CommunityGoalService } from './community-goal.service';
import { VolunteerService } from './volunteer.service';

@Injectable({ providedIn: 'root' })
export class CalendarDataService {
  private readonly activityService = inject(ActivityService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly communityGoalService = inject(CommunityGoalService);
  private readonly volunteerService = inject(VolunteerService);

  loadEvents(): Observable<CalendarEvent[]> {
    return this.volunteerService.getCurrentUser().pipe(
      switchMap(user => forkJoin({
        userId: of(user.id),
        activities: this.activityService.getActivitiesByUserParticipation(user.id)
          .pipe(catchError(() => of([] as Activity[]))),
        personalAppointments: this.appointmentService.getPersonalAppointments()
          .pipe(catchError(() => of([] as Appointment[]))),
        organisations: this.volunteerService.getOrganisations(user.id)
          .pipe(catchError(() => of([] as Organisation[])))
      })),
      switchMap(base => this.loadGoals(base.organisations).pipe(
        map(goals => this.toCalendarEvents(
          base.activities,
          base.personalAppointments,
          base.organisations,
          goals,
          base.userId
        ))
      ))
    );
  }

  private loadGoals(organisations: Organisation[]): Observable<CommunityGoal[]> {
    if (organisations.length === 0) return of([]);
    return forkJoin(organisations.map(org =>
      this.communityGoalService.getGoalsForOrganisation(org.id).pipe(catchError(() => of([] as CommunityGoal[])))
    )).pipe(map(groups => groups.reduce((all, group) => all.concat(group), [] as CommunityGoal[])));
  }

  private toCalendarEvents(
    activities: Activity[],
    personalAppointments: Appointment[],
    organisations: Organisation[],
    goals: CommunityGoal[],
    userId: number
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    activities.forEach(activity => {
      if (!activity.date) return;
      const start = this.combineDateAndTime(activity.date, activity.startTime);
      const organisation = activity.organisations?.find(org => this.hasCoordinates(org.location));
      const coordinates = this.hasCoordinates(activity.coordinates)
        ? activity.coordinates
        : organisation
          ? { lat: organisation.location.lat, lng: organisation.location.lon }
          : undefined;
      events.push({
        id: `activity-${activity.id}`,
        title: activity.title,
        type: 'activity',
        start,
        end: this.activityEnd(start, activity.endTime, activity.duration),
        allDay: !activity.startTime && this.asDate(activity.date).getHours() === 0,
        location: activity.location || (organisation ? `${organisation.orgName} home base` : undefined),
        coordinates,
        description: activity.description || activity.body,
        route: `/activities/${activity.id}`
      });
    });
    personalAppointments.forEach(appointment => events.push({
      id: `personal-${appointment.id}`,
      title: appointment.title,
      type: 'personal',
      start: this.asDate(appointment.startDateTime),
      end: this.asDate(appointment.endDateTime),
      allDay: false,
      location: appointment.location,
      description: appointment.description,
      personalAppointmentId: appointment.id
    }));

    goals.forEach(goal => {
      const deadline = goal.endDate ?? goal.startDate;
      if (!deadline) return;
      const organisationId = goal.organisation?.id;
      events.push({
        id: `goal-${goal.id}`,
        title: `Goal deadline: ${goal.title}`,
        type: 'goal',
        start: this.asDate(deadline),
        allDay: true,
        description: goal.description,
        route: organisationId ? `/community-goals?organisationId=${organisationId}` : undefined
      });
    });

    organisations.forEach(org => {
      if (!this.hasCoordinates(org.location)) return;
      const membership = org.orgMembers?.find(member => member.user?.id === userId);
      const joinedAt = membership?.joinedAt ?? org.createdAt;
      if (!joinedAt) return;
      events.push({
        id: `organisation-${org.id}`,
        title: `Joined ${org.orgName}`,
        type: 'organisation',
        start: this.asDate(joinedAt),
        allDay: false,
        location: `${org.orgName} home base`,
        coordinates: { lat: org.location.lat, lng: org.location.lon },
        markerImageUrl: org.profilePicture,
        description: org.body,
        route: `/organisations/${org.id}`
      });
    });

    organisations.forEach(org => {
      if (!org.reactivationTime) return;
      events.push({
        id: `reactivation-${org.id}`,
        title: `${org.orgName} reactivates`,
        type: 'reactivation',
        start: this.asDate(org.reactivationTime),
        allDay: false,
        route: `/organisations/${org.id}`
      });
    });

    return events.sort((left, right) => left.start.getTime() - right.start.getTime());
  }

  private asDate(value: Date | string): Date {
    return value instanceof Date ? new Date(value.getTime()) : new Date(value);
  }

  private combineDateAndTime(dateValue: Date | string, time?: string): Date {
    const date = this.asDate(dateValue);
    if (!time) return date;
    const [hours, minutes] = time.split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  }

  private activityEnd(start: Date, endTime?: string, duration?: string): Date | undefined {
    if (endTime) {
      const end = this.combineDateAndTime(start, endTime);
      if (end <= start) end.setDate(end.getDate() + 1);
      return end;
    }
    const hours = Number.parseFloat(duration ?? '');
    return Number.isFinite(hours) ? new Date(start.getTime() + hours * 60 * 60 * 1000) : undefined;
  }

  private hasCoordinates(value?: { lat: number; lng?: number; lon?: number }): boolean {
    const longitude = value?.lng ?? value?.lon;
    return Number.isFinite(value?.lat) && Number.isFinite(longitude);
  }

}
