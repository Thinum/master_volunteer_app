import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Organisation} from '../../models/organisations.model';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  constructor(private http:HttpClient) {

  }

  getAllOrganisations() {
    return this.http.get<Organisation[]>('http://localhost:8080/organisations');
  }

  getOrganisationById(id: string) {
    return this.http.get<Organisation>(`http://localhost:8080/organisations/${id}`);
  }
}
