import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organisation } from '../../models/organisation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {
  private apiUrl = `${environment.apiUrl}/organisations`;

  constructor(private http: HttpClient) {}

  /**
   * Returns all organisations.
   */
  getAllOrganisations(): Observable<Organisation[]> {
    return this.http.get<Organisation[]>(this.apiUrl);
  }

  /**
   * Returns a single organisation by ID.
   */
  getOrganisationById(id: number): Observable<Organisation> {
    return this.http.get<Organisation>(`${this.apiUrl}/${id}`);
  }

  /**
   * Adds a new organisation.
   */
  addOrganisation(org: Organisation): Observable<Organisation> {
    return this.http.post<Organisation>(this.apiUrl, org);
  }

  joinOrganisation(orgId: number | null | undefined): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/join/${orgId}`, {});
  }
}
