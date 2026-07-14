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
    return forkJoin({
      activities: this.activityService.getAllActivities().pipe(catchError(() => of([] as Activity[]))),
      personalAppointments: this.appointmentService.getPersonalAppointments().pipe(catchError(() => of([] as Appointment[]))),
      user: this.volunteerService.getCurrentUser()
    }).pipe(
      switchMap(base => this.volunteerService.getOrganisations(base.user.id).pipe(
        catchError(() => of([] as Organisation[])),
        switchMap(organisations => this.loadGoals(organisations).pipe(
          map(goals => this.toCalendarEvents(base.activities, base.personalAppointments, organisations, goals))
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
    goals: CommunityGoal[]
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    activities.forEach(activity => {
      const appointments = activity.appointments ?? [];
      if (appointments.length > 0) {
        appointments.forEach(appointment => events.push({
          id: `session-${appointment.id}`,
          title: appointment.title,
          type: 'session',
          start: this.asDate(appointment.startDateTime),
          end: this.asDate(appointment.endDateTime),
          allDay: false,
          location: appointment.location || activity.location,
          description: appointment.description,
          route: `/activities/${activity.id}`
        }));
      } else if (activity.date) {
        const start = this.combineDateAndTime(activity.date, activity.startTime);
        events.push({
          id: `activity-${activity.id}`,
          title: activity.title,
          type: 'activity',
          start,
          end: this.activityEnd(start, activity.endTime, activity.duration),
          allDay: !activity.startTime && this.asDate(activity.date).getHours() === 0,
          location: activity.location,
          description: activity.description || activity.body,
          route: `/activities/${activity.id}`
        });
      }

      if (activity.expiresAt) {
        events.push({
          id: `deadline-${activity.id}`,
          title: `${activity.title} expires`,
          type: 'deadline',
          start: this.asDate(activity.expiresAt),
          allDay: true,
          route: `/activities/${activity.id}`
        });
      }
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
      if (!goal.startDate && !goal.endDate) return;
      const organisationId = goal.organisation?.id;
      events.push({
        id: `goal-${goal.id}`,
        title: goal.title,
        type: 'goal',
        start: this.asDate(goal.startDate ?? goal.endDate as Date),
        end: goal.endDate ? this.endOfDay(this.asDate(goal.endDate)) : undefined,
        allDay: true,
        description: goal.description,
        route: organisationId ? `/community-goals?organisationId=${organisationId}` : undefined
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

  private endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }
}