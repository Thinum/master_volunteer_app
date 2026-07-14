import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments/me`;

  private readonly http = inject(HttpClient);

  getPersonalAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      map(appointments => appointments.map(appointment => this.withDates(appointment)))
    );
  }

  createPersonalAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment).pipe(map(created => this.withDates(created)));
  }

  deletePersonalAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private withDates(appointment: Appointment): Appointment {
    return {
      ...appointment,
      startDateTime: new Date(appointment.startDateTime),
      endDateTime: new Date(appointment.endDateTime)
    };
  }
}