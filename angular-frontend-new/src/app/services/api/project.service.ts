import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project } from '../../models/project.model';
import { Activity } from '../../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  constructor(private readonly http: HttpClient) {}

  getAllProjects(organisationId?: number): Observable<Project[]> {
    const options = organisationId
      ? { params: new HttpParams().set('organisationId', organisationId) }
      : {};
    return this.http.get<Project[]>(this.apiUrl, options);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  getProjectActivities(id: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/${id}/activities`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
