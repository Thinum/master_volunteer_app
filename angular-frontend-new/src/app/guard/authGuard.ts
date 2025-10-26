import { CanActivateFn } from '@angular/router';
import {AuthService} from '../services/authservice/auth.service';
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService);
  return authService.isAuthenticated();
};
