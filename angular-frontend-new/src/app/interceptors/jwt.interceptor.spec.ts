import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { jwtInterceptor } from './jwt.interceptor';
import {
  AUTH_TOKEN_STRING,
  clearStoredAuthSession,
  EXPIRY_DATE_STRING,
  setStoredAuthSession
} from '../services/authservice/auth.service';

describe('jwtInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => jwtInterceptor(req, next));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => {
    clearStoredAuthSession();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('does not clear a newer session when an older request returns 401', () => {
    const expirySeconds = Math.floor(Date.now() / 1000) + 3600;
    const encodedPayload = btoa(JSON.stringify({ sub: 'old-user', exp: expirySeconds }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const oldToken = `header.${encodedPayload}.signature`;
    const newToken = 'new-session-token';
    localStorage.setItem(AUTH_TOKEN_STRING, oldToken);
    localStorage.setItem(EXPIRY_DATE_STRING, String(expirySeconds * 1000));

    const request = new HttpRequest('GET', 'http://localhost:8080/users/me');
    const response = interceptor(request, () => throwError(() =>
      new HttpErrorResponse({ status: 401, url: request.url })
    ));

    localStorage.setItem(AUTH_TOKEN_STRING, newToken);
    response.subscribe({ error: () => undefined });

    expect(localStorage.getItem(AUTH_TOKEN_STRING)).toBe(newToken);
  });

  it('attaches the in-memory token when browser storage is blocked', () => {
    const expirySeconds = Math.floor(Date.now() / 1000) + 3600;
    const encodedPayload = btoa(JSON.stringify({ sub: 'charlie', exp: expirySeconds }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const token = `header.${encodedPayload}.signature`;
    spyOn(Storage.prototype, 'setItem').and.throwError('Storage blocked');
    setStoredAuthSession(token, String(expirySeconds * 1000));

    let authorizationHeader: string | null = null;
    const request = new HttpRequest('GET', 'http://localhost:8080/users/me');
    interceptor(request, authenticatedRequest => {
      authorizationHeader = authenticatedRequest.headers.get('Authorization');
      return of(new HttpResponse({ status: 200 }));
    }).subscribe();

    expect(String(authorizationHeader)).toBe(`Bearer ${token}`);
    expect(localStorage.getItem(AUTH_TOKEN_STRING)).toBeNull();
  });
});
