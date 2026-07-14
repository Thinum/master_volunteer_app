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

  private readonly fb = inject(FormBuilder);
  private readonly calendarDataService = inject(CalendarDataService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly snackBar = inject(MatSnackBar);

  readonly appointmentForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    startDateTime: ['', Validators.required],
    endDateTime: ['', Validators.required],
    location: [''],
    description: ['']
  });


  ngOnInit(): void {
    this.loadEvents();
  }

  get personalEvents(): CalendarEvent[] {
    return this.events.filter(event => event.type === 'personal');
  }

  openAppointmentForm(date = new Date()): void {
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    this.appointmentForm.reset({
      title: '',
      startDateTime: this.toLocalInput(start),
      endDateTime: this.toLocalInput(end),
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
    const start = new Date(value.startDateTime);
    const end = new Date(value.endDateTime);
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

  private toLocalInput(date: Date): string {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return offsetDate.toISOString().slice(0, 16);
  }
}