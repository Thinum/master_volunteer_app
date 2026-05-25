import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUserDTOModel } from '../../models/contract/AuthUserDTO.model';
import { AuthToken } from '../../models/contract/AuthToken.model';

export const EXPIRY_DATE_STRING = 'expiryDate';
export const AUTH_TOKEN_STRING = 'authToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public loggedIn$ = this.loggedInSubject.asObservable();
  private tokenCheckInterval: any;

  constructor(private http: HttpClient, private router: Router) {
    if (this.isLoggedIn()) {
      this.startTokenCheck();
    } else {
      this.logout();
    }
  }

  public login(username: string, password: string): Observable<AuthToken> {
    const body: AuthUserDTOModel = { username, password };
    return this.http.post<AuthToken>(`${environment.apiUrl}/auth/login`, body)
      .pipe(
        tap((authToken) => {
          this.setSession(authToken);
          this.loggedInSubject.next(true);
        })
      );
  }

  public logout() {
    localStorage.removeItem(AUTH_TOKEN_STRING);
    localStorage.removeItem(EXPIRY_DATE_STRING);
    this.loggedInSubject.next(false);
    this.router.navigate(['']);
    if (this.tokenCheckInterval) clearInterval(this.tokenCheckInterval);
  }

  public isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  private hasValidToken(): boolean {
    const expiry = this.getExpiration();
    return new Date().getTime() < expiry.getTime();
  }

  public isAuthenticated(){
    return this.isLoggedIn();
  }

  private setSession(authToken: AuthToken) {
    localStorage.setItem(AUTH_TOKEN_STRING, authToken.token);
    localStorage.setItem(EXPIRY_DATE_STRING, authToken.expiryDate.toString());
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

  register(username: string, email: string, password: string): Observable<AuthToken> {
    return this.http.post<AuthToken>(`${environment.apiUrl}/auth/register`, {
      username: username,
      email: email,
      password: password
    }).pipe(
      tap((authToken) => {
        this.setSession(authToken);
        this.loggedInSubject.next(true);
      })
    );
  }
}
