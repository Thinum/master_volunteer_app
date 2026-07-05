import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InterestService {
  private apiUrl = `${environment.apiUrl}/interests`;

  constructor(private http: HttpClient) {}

  getAllInterests(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);
  }
}
