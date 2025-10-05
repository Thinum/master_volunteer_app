import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Project} from '../../models/project.model';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly projects: Project[] = [
    {
      id: 1,
      title: "Example 1",
      description: "Description Project",
      closed: true,
    },
    {
      id: 2,
      title: "Example 2",
      description: "Description Project 2",
      closed: true,
    },
    {
      id: 3,
      title: "Example 3",
      description: "Description Project 3",
      closed: false,
    }
  ]

  constructor(private http: HttpClient) { }

  getAllProjects(): Observable<Project[]> {
    return of(this.projects);
  }

  getProjectById(id: number): Observable<Project> {
    return of(this.projects[id]);
  }
}
