import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Activity} from '../../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http:HttpClient) {

  }

  getAllActivities(){
    return this.http.get<Activity[]>('http://localhost:8080/activities');
  }

  getActivityById(id: number){
    return this.http.get<Activity>(`http://localhost:8080/activities/${id}`)
  }
}
