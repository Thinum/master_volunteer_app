import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { Organisation } from '../../models/organisation.model';
import { MOCK_ORGANISATIONS } from '../../mock/mock-organisations';

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {
  // Use the shared mock data
  private organisations: Organisation[] = MOCK_ORGANISATIONS;

  constructor(private http: HttpClient) {}

  /**
   * Returns all organisations.
   * Currently uses mock data via RxJS 'of', but can easily switch to an API.
   */
  getAllOrganisations(): Observable<Organisation[]> {
    // Development (mock):
    return of(this.organisations);

    // Production (API):
    // return this.http.get<Organisation[]>('http://localhost:8080/organisations');
  }

  /**
   * Returns a single organisation by ID.
   */
  getOrganisationById(id: number): Observable<Organisation | undefined> {
    // Development (mock):
    const org = this.organisations.find(o => o.id === id);
    return of(org);

    // Production (API):
    // return this.http.get<Organisation>(`http://localhost:8080/organisations/${id}`);
  }

  /**
   * Optional helper: adds a new organisation (mock only).
   */
  addOrganisation(org: Organisation): Observable<Organisation> {
    this.organisations.push(org);
    return of(org);
  }
}
