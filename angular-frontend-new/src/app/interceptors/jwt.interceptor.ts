import { HttpInterceptorFn } from '@angular/common/http';
import { AUTH_TOKEN_STRING, EXPIRY_DATE_STRING } from '../services/authservice/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem(AUTH_TOKEN_STRING);
  const expiry = localStorage.getItem(EXPIRY_DATE_STRING);

  const isValid = authToken && expiry && new Date().getTime() < new Date(expiry).getTime();

  if (isValid) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` }
    });
    return next(cloned);
  }

  return next(req);
};
