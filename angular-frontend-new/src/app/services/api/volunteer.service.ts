import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { User } from '../../models/user.model';
import { MOCK_USERS } from '../../mock/mock-users';

@Injectable({
  providedIn: 'root',
})
export class VolunteerService {
  private users: User[] = MOCK_USERS;

  constructor(private http: HttpClient) {}

  /**
   * Returns all volunteers (mock or API)
   */
  getAllVolunteers() {
    return of(this.users);
    // return this.http.get<User[]>('http://localhost:8080/volunteers');
  }

  /**
   * Returns a single volunteer by their ID
   */
  getVolunteerById(id: number) {
    return of(this.users.find(u => u.id === id));
    // return this.http.get<User>(`http://localhost:8080/volunteers/${id}`);
  }

  /**
   * Returns only active volunteers
   */
  getActiveVolunteers() {
    return of(this.users.filter(u => u.isActive));
    // return this.http.get<User[]>('http://localhost:8080/volunteers/active');
  }
}
