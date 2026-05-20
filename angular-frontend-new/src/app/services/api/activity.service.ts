import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Activity } from '../../models/activity.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  /**
   * Returns all activities (API)
   */
  getAllActivities() {
    return this.http.get<Activity[]>(this.apiUrl);
  }

  /**
   * Returns a single activity by its ID
   */
  getActivityById(id: number) {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
  }

  /**
   * Returns all activities a specific user participates in
   */
  getActivitiesByUserParticipation(userId: number) {
    return this.http.get<Activity[]>(`${this.apiUrl}/user/${userId}`);
  }
}
