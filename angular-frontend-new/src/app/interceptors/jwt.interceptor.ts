import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import {
  clearStoredAuthSession,
  getAuthTokenExpiryTime,
  getStoredAuthExpiry,
  getStoredAuthToken
} from '../services/authservice/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const requestPath = req.url.replace(/[?#].*$/, '');
  const isAuthenticationRequest = /\/auth\/(login|register)$/.test(requestPath);
  const authToken = getStoredAuthToken();
  const expiry = getStoredAuthExpiry();
  const expiryTime = getAuthTokenExpiryTime(authToken, expiry);

  const isValid = !!authToken && Number.isFinite(expiryTime) && Date.now() < expiryTime;
  if (!isValid && (authToken || expiry)) {
    clearStoredAuthSession(authToken);
  }

  const request = isValid && !isAuthenticationRequest
    ? req.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` }
    })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const currentUserRejected = error.status === 403
        && request.url.replace(/\?.*$/, '').endsWith('/users/me');
      const rejectedTokenIsStillCurrent = !!authToken
        && getStoredAuthToken() === authToken;
      if (rejectedTokenIsStillCurrent && (error.status === 401 || currentUserRejected)) {
        clearStoredAuthSession(authToken);
        void router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
