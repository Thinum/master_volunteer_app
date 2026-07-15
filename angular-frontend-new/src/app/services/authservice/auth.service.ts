import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUserDTOModel } from '../../models/contract/AuthUserDTO.model';
import { AuthToken } from '../../models/contract/AuthToken.model';

export const EXPIRY_DATE_STRING = 'expiryDate';
export const AUTH_TOKEN_STRING = 'authToken';

let runtimeAuthToken: string | null = null;
let runtimeExpiry: string | null = null;

function readLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The in-memory session remains available when browser privacy settings block storage.
  }
}

function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing else is required because the in-memory session is cleared below.
  }
}

export function getStoredAuthToken(): string | null {
  return runtimeAuthToken ?? readLocalStorage(AUTH_TOKEN_STRING);
}

export function getStoredAuthExpiry(): string | null {
  return runtimeExpiry ?? readLocalStorage(EXPIRY_DATE_STRING);
}

export function setStoredAuthSession(token: string, expiry: string | null): void {
  runtimeAuthToken = token;
  runtimeExpiry = expiry;
  writeLocalStorage(AUTH_TOKEN_STRING, token);
  if (expiry) {
    writeLocalStorage(EXPIRY_DATE_STRING, expiry);
  } else {
    removeLocalStorage(EXPIRY_DATE_STRING);
  }
}

export function clearStoredAuthSession(expectedToken?: string | null): boolean {
  if (expectedToken && getStoredAuthToken() !== expectedToken) {
    return false;
  }
  runtimeAuthToken = null;
  runtimeExpiry = null;
  removeLocalStorage(AUTH_TOKEN_STRING);
  removeLocalStorage(EXPIRY_DATE_STRING);
  return true;
}

export function getAuthTokenExpiryTime(token: string | null, serializedExpiry: string | null): number {
  if (token) {
    try {
      const payloadPart = token.split('.')[1];
      if (payloadPart) {
        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const payload = JSON.parse(atob(paddedBase64)) as { exp?: number };
        const jwtExpiry = Number(payload.exp) * 1000;
        if (Number.isFinite(jwtExpiry) && jwtExpiry > 0) {
          return jwtExpiry;
        }
      }
    } catch {
      // Fall back to the separately serialized expiry for older token formats.
    }
  }

  if (!serializedExpiry) {
    return Number.NaN;
  }
  const numericExpiry = Number(serializedExpiry);
  return new Date(Number.isFinite(numericExpiry) && numericExpiry > 0
    ? numericExpiry
    : serializedExpiry).getTime();
}

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
    clearStoredAuthSession();
    this.loggedInSubject.next(false);
    this.router.navigate(['']);
    if (this.tokenCheckInterval) clearInterval(this.tokenCheckInterval);
  }

  public isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  private hasValidToken(): boolean {
    const token = getStoredAuthToken();
    if (!token) {
      return false;
    }
    const expiryTime = getAuthTokenExpiryTime(token, getStoredAuthExpiry());
    return Number.isFinite(expiryTime) && Date.now() < expiryTime;
  }

  public isAuthenticated(){
    return this.isLoggedIn();
  }

  private setSession(authToken: AuthToken) {
    const expiryTime = getAuthTokenExpiryTime(authToken.token, String(authToken.expiryDate ?? ''));
    const serializedExpiry = Number.isFinite(expiryTime) ? String(expiryTime) : null;
    setStoredAuthSession(authToken.token, serializedExpiry);
    this.startTokenCheck();
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
