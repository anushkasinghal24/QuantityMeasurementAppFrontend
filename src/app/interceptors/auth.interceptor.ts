import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokens = inject(TokenStorageService);
  const state = tokens.getTokenState();

  if (state.expired) {
    router.navigate(['/login']);
  }

  const authReq = state.token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${state.token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 || err.status === 403) {
        tokens.clearToken();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
