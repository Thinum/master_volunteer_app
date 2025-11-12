import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Activity } from '../../models/activity.model';
import { MOCK_ACTIVITIES } from '../../mock/mock-activities';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  // Mock data
  private activities: Activity[] = MOCK_ACTIVITIES;

  constructor(private http: HttpClient) {}

  /**
   * Returns all activities (mock or API)
   */
  getAllActivities() {
    return of(this.activities);
    // return this.http.get<Activity[]>('http://localhost:8080/activities');
  }

  /**
   * Returns a single activity by its ID
   */
  getActivityById(id: number) {
    return of(this.activities.find(a => a.id === id));
    // return this.http.get<Activity>(`http://localhost:8080/activities/${id}`);
  }

  /**
   * Returns all activities a specific user participates in
   */
  getActivitiesByUserParticipation(userId: number) {
    const userActivities = this.activities.filter(a =>
      a.friends?.some(f => f.id === userId)
    );
    return of(userActivities);
    // return this.http.get<Activity[]>(`http://localhost:8080/activities/user/${userId}`);
  }
}
