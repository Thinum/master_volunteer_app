import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganisationAdminAssignment } from '../../models/organisation-admin-assignment.model';

@Injectable({ providedIn: 'root' })
export class OrganisationAdminAssignmentService {
  private readonly apiUrl = `${environment.apiUrl}/organisation-admin-assignments`;

  constructor(private readonly http: HttpClient) {}

  hasAccess(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/access`);
  }

  getAssignments(): Observable<OrganisationAdminAssignment[]> {
    return this.http.get<OrganisationAdminAssignment[]>(this.apiUrl);
  }

  updateAssignments(organisationId: number, adminIds: number[]): Observable<OrganisationAdminAssignment> {
    return this.http.put<OrganisationAdminAssignment>(
      `${this.apiUrl}/${organisationId}`,
      { adminIds }
    );
  }
}
