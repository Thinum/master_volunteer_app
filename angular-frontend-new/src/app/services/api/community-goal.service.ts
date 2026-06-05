import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommunityGoal } from '../../models/community-goal.model';
import { environment } from '../../../environments/environment';

@Injectable({
providedIn: 'root',
})
export class CommunityGoalService {
private apiUrl = `${environment.apiUrl}/community-goals`;

constructor(private http: HttpClient) {}

  getGoalsForOrganisation(orgId: number): Observable<CommunityGoal[]> {
    const params = new HttpParams().set('organisationId', orgId);
    return this.http.get<CommunityGoal[]>(this.apiUrl, { params });
  }

  createGoal(orgId: number, goal: CommunityGoal): Observable<CommunityGoal> {
    const params = new HttpParams().set('organisationId', orgId);
    return this.http.post<CommunityGoal>(this.apiUrl, goal, { params });
  }
}
