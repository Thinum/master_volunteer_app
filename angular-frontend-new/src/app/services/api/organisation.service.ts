import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Organisation} from '../../models/organisations.model';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
  private organisations: Organisation[] = [
    {
      id: 1,
      orgName: "Test Organisation 1",
      location: {
        lat: 0,
        lon: 0
      },
      createdAt: "",
      body: "This is an organisation 1",
      deactivated: false
    },
    {
      id: 2,
      orgName: "Test Organisation 2",
      location: {
        lat: 0,
        lon: 0
      },
      createdAt: "",
      body: "This is an organisation 2",
      deactivated: false
    },
    {
      id: 3,
      orgName: "Test Organisation 3",
      location: {
        lat: 0,
        lon: 0
      },
      createdAt: "",
      body: "This is an organisation 3",
      deactivated: false
    }
  ]

  constructor(private http:HttpClient) {

  }

  getAllOrganisations() {
    return of(this.organisations);
    //return this.http.get<Organisation[]>('http://localhost:8080/organisations');
  }

  getOrganisationById(id: number) {
    return of(this.organisations.find(o => o.id === id));
    //return this.http.get<Organisation>(`http://localhost:8080/organisations/${id}`);
  }
}
