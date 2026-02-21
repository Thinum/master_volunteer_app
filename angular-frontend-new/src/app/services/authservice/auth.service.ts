import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthUserDTOModel } from '../../models/contract/AuthUserDTO.model';
import { AuthToken } from '../../models/contract/AuthToken.model';

export const EXPIRY_DATE_STRING = 'expiryDate';
export const AUTH_TOKEN_STRING = 'authToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public loggedInEvent = new EventEmitter<boolean>();
  private tokenCheckInterval: any;

  constructor(private http: HttpClient, private router: Router) {
    if (this.isLoggedIn()) {
      this.loggedInEvent.emit(true);
      this.startTokenCheck();
    } else {
      this.logout();
    }
  }

  public login(username: string, password: string) {
    const body: AuthUserDTOModel = { username, password };
    this.http.post<AuthToken>('http://localhost:8080/auth/login', body)
      .subscribe({
        next: (authToken) => {
          this.setSession(authToken);
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.loggedInEvent.emit(false);
        }
      });
  }

  public logout() {
    localStorage.removeItem(AUTH_TOKEN_STRING);
    localStorage.removeItem(EXPIRY_DATE_STRING);
    this.loggedInEvent.emit(false);
    this.router.navigate(['']);
    if (this.tokenCheckInterval) clearInterval(this.tokenCheckInterval);
  }

  public isLoggedIn(): boolean {
    return new Date().getTime() < this.getExpiration().getTime();
  }

  public isAuthenticated(){
    return this.isLoggedIn();
  }

  private setSession(authToken: AuthToken) {
    localStorage.setItem(AUTH_TOKEN_STRING, authToken.token);
    localStorage.setItem(EXPIRY_DATE_STRING, authToken.expiryDate.toString());
    this.loggedInEvent.emit(true);
    this.startTokenCheck();
  }

  private getExpiration(): Date {
    const expiration = localStorage.getItem(EXPIRY_DATE_STRING);
    return expiration ? new Date(expiration) : new Date(0);
  }

  private startTokenCheck() {
    if (this.tokenCheckInterval) clearInterval(this.tokenCheckInterval);

    this.tokenCheckInterval = setInterval(() => {
      if (!this.isLoggedIn()) {
        this.logout();
      }
    }, 5000);
  }

  // TODO: make this work or mock idk ?
  register(username: string, email: string, password: string) {
    return this.http.post('/api/auth/register', {
      username,
      email,
      password
    });
  }

}
