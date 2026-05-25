import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VolunteerService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Returns all volunteers (API)
   */
  getAllVolunteers() {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Returns a single volunteer by their ID
   */
  getVolunteerById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Returns only active volunteers
   */
  getActiveVolunteers() {
    return this.http.get<User[]>(`${this.apiUrl}/active`);
  }
}
