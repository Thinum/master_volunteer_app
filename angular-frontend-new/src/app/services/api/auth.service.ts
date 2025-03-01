import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient ) {}

  login(email:string, password:string) {
    return this.http.post<User>('/auth/login', {email, password})
  }
}
