import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Activity} from '../../models/activity.model';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private readonly activities: Activity[] = [{
    id: 1,
    title: "Test Activity 1",
    body: "Activity Body 1",
    project_id: 1,
    organisation_id: 1,
    appointment_ids: [1],
  }];

  constructor(private http:HttpClient) {

  }

  getAllActivities(){
    return this.http.get<Activity[]>('http://localhost:8080/activities');
  }

  getActivityById(id: number){
    return this.http.get<Activity>(`http://localhost:8080/activities/${id}`)
  }
  getActivityByUserPartIn(userId: number){
    //Todo change mock to actual implementation
    return of(this.activities)
  }
}
