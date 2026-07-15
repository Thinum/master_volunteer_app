import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Activity, ActivityRecommendation, TagConcept } from '../../models/activity.model';
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

  getRecommendedActivities() {
    return this.http.get<ActivityRecommendation[]>(`${this.apiUrl}/recommendations`);
  }

  getActivityTagCatalog() {
    return this.http.get<string[]>(`${this.apiUrl}/tags/catalog`);
  }

  getActivityTagConceptCatalog() {
    return this.http.get<TagConcept[]>(`${this.apiUrl}/tags/concepts`);
  }


  updateActivity(id: number, activity: Activity) {
    return this.http.put<Activity>(`${this.apiUrl}/${id}`, activity);
  }

  deleteActivity(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  createActivity(activity: Activity) {
    return this.http.post<Activity>(this.apiUrl, activity);
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

  joinActivity(activityId: number) {
    return this.http.post<boolean>(`${this.apiUrl}/join/${activityId}`, {});
  }
}
