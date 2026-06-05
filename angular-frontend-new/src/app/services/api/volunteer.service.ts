import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { Organisation } from '../../models/organisation.model';
import { Activity } from '../../models/activity.model';
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
   * Returns the current logged in user
   */
  getCurrentUser() {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  /**
   * Returns a single volunteer by their ID
   */
  getVolunteerById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Returns friends of a volunteer by their ID
   */
  getFriends(id: number) {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/friends`);
  }

  /**
   * Returns organisations of a volunteer by their ID
   */
  getOrganisations(id: number) {
    return this.http.get<Organisation[]>(`${this.apiUrl}/${id}/organisations`);
  }

  /**
   * Returns activities of a volunteer by their ID
   */
  getActivities(id: number) {
    return this.http.get<Activity[]>(`${this.apiUrl}/${id}/activities`);
  }

  /**
   * Returns only active volunteers
   */
  getActiveVolunteers() {
    return this.http.get<User[]>(`${this.apiUrl}/active`);
  }
}
