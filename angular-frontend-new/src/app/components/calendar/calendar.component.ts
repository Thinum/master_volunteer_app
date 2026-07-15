import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Appointment } from '../../models/appointment.model';
import { CalendarEvent } from '../../models/calendar-event.model';
import { AppointmentService } from '../../services/api/appointment.service';
import { CalendarDataService } from '../../services/api/calendar-data.service';
import { CalendarMonthComponent } from '../../shared/components/calendar-month/calendar-month.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CalendarMonthComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  loading = true;
  saving = false;
  showAppointmentForm = false;
  formError = '';
  appointmentFilter: 'all' | 'upcoming' | 'past' = 'all';

  private readonly fb = inject(FormBuilder);
  private readonly calendarDataService = inject(CalendarDataService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly snackBar = inject(MatSnackBar);

  readonly appointmentForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    startDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['', Validators.required],
    location: [''],
    description: ['']
  });


  ngOnInit(): void {
    this.loadEvents();
  }

  get personalEvents(): CalendarEvent[] {
    const now = new Date();
    return this.events
      .filter(event => event.type === 'personal')
      .sort((left, right) => {
        const leftPast = this.isPast(left, now);
        const rightPast = this.isPast(right, now);

        if (leftPast !== rightPast) return leftPast ? 1 : -1;
        return leftPast
          ? right.start.getTime() - left.start.getTime()
          : left.start.getTime() - right.start.getTime();
      });
  }

  get filteredPersonalEvents(): CalendarEvent[] {
    if (this.appointmentFilter === 'all') return this.personalEvents;
    const now = new Date();
    return this.personalEvents.filter(event =>
      this.appointmentFilter === 'past' ? this.isPast(event, now) : !this.isPast(event, now)
    );
  }

  get upcomingAppointmentCount(): number {
    const now = new Date();
    return this.personalEvents.filter(event => !this.isPast(event, now)).length;
  }

  get pastAppointmentCount(): number {
    return this.personalEvents.length - this.upcomingAppointmentCount;
  }

  get minimumEndDate(): string {
    return this.appointmentForm.controls.startDate.value;
  }

  openAppointmentForm(date = new Date()): void {
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    this.appointmentForm.reset({
      title: '',
      startDate: this.toLocalDate(start),
      startTime: this.toLocalTime(start),
      endDate: this.toLocalDate(end),
      endTime: this.toLocalTime(end),
      location: '',
      description: ''
    });
    this.formError = '';
    this.showAppointmentForm = true;
  }

  selectDay(date: Date): void {
    this.openAppointmentForm(date);
  }

  closeAppointmentForm(): void {
    this.showAppointmentForm = false;
    this.formError = '';
  }

  saveAppointment(): void {
    this.appointmentForm.markAllAsTouched();
    if (this.appointmentForm.invalid) return;

    const value = this.appointmentForm.getRawValue();
    const start = this.combineLocalDateAndTime(value.startDate, value.startTime);
    const end = this.combineLocalDateAndTime(value.endDate, value.endTime);
    if (end <= start) {
      this.formError = 'End time must be after start time.';
      return;
    }

    const appointment: Appointment = {
      id: 0,
      title: value.title.trim(),
      description: value.description.trim(),
      location: value.location.trim(),
      startDateTime: start,
      endDateTime: end,
      createdBy: 0,
      activityId: undefined
    };

    this.saving = true;
    this.appointmentService.createPersonalAppointment(appointment).subscribe({
      next: () => {
        this.saving = false;
        this.showAppointmentForm = false;
        this.snackBar.open('Appointment added to your calendar', 'Close', { duration: 3000 });
        this.loadEvents();
      },
      error: () => {
        this.saving = false;
        this.formError = 'Could not save the appointment. Please try again.';
      }
    });
  }

  deleteAppointment(event: CalendarEvent): void {
    if (!event.personalAppointmentId) return;
    this.appointmentService.deletePersonalAppointment(event.personalAppointmentId).subscribe({
      next: () => {
        this.snackBar.open('Appointment removed', 'Close', { duration: 2500 });
        this.loadEvents();
      },
      error: () => this.snackBar.open('Could not remove appointment', 'Close', { duration: 3000 })
    });
  }

  setAppointmentFilter(filter: 'all' | 'upcoming' | 'past'): void {
    this.appointmentFilter = filter;
  }

  appointmentStatus(event: CalendarEvent): 'past' | 'today' | 'upcoming' {
    const now = new Date();
    if (this.isPast(event, now)) return 'past';
    if (this.isSameDay(event.start, now)) return 'today';
    return 'upcoming';
  }

  appointmentStatusLabel(event: CalendarEvent): string {
    const status = this.appointmentStatus(event);
    if (status === 'past') return 'Past';
    if (status === 'today') return 'Today';
    return 'Upcoming';
  }

  trackEvent(_: number, event: CalendarEvent): string {
    return event.id;
  }

  private loadEvents(): void {
    this.loading = true;
    this.calendarDataService.loadEvents().subscribe({
      next: events => {
        this.events = events;
        this.loading = false;
      },
      error: () => {
        this.events = [];
        this.loading = false;
        this.snackBar.open('Could not load calendar data', 'Close', { duration: 3500 });
      }
    });
  }

  private toLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toLocalTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private combineLocalDateAndTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00`);
  }

  private isPast(event: CalendarEvent, now = new Date()): boolean {
    return (event.end ?? event.start).getTime() < now.getTime();
  }

  private isSameDay(left: Date, right: Date): boolean {
    return left.getFullYear() === right.getFullYear()
      && left.getMonth() === right.getMonth()
      && left.getDate() === right.getDate();
  }
}
