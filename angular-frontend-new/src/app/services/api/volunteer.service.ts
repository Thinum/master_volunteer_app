import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { Organisation } from '../../models/organisation.model';
import { Activity } from '../../models/activity.model';
import { RelationshipDTO, RelationshipType } from '../../models/relationship.model';
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
   * Updates the current logged in user's public profile
   */
  updateCurrentUser(user: User) {
    return this.http.put<User>(`${this.apiUrl}/me`, user);
  }

  /**
   * Returns a single volunteer by their ID
   */
  getVolunteerById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Returns users of a volunteer by their ID and relationship
   */
  getRelatedUsers(id: number, type: RelationshipType) {
    return this.http.get<User[]>(
      `${this.apiUrl}/${id}/relationships/${type}`
    );
  }

  /**
   * Returns every user of a volunteer they have a relationship with
   */
  getConnections(id: number) {
    return this.http.get<User[]>(
      `${this.apiUrl}/${id}/connections`
    );
  }

  /**
   * Returns friends of a volunteer by their ID
   */
  getFriends(id: number) {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/friends`);
  }

  /**
   * Returns relationship graph data of a volunteer by their ID
   */
  getUserRelationships(id: number) {
    return this.http.get<RelationshipDTO[]>(`${this.apiUrl}/${id}/relationships`);
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
