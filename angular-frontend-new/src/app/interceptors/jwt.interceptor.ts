import { HttpInterceptorFn } from '@angular/common/http';
import {AUTH_TOKEN_STRING} from '../services/authservice/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem(AUTH_TOKEN_STRING);

  if(authToken){
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authToken)
    })
    return next(clonedRequest);
  } else {
    return next(req);
  }
};
