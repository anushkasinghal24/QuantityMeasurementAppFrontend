import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.loading$
    .pipe(
      filter(loading => !loading),
      take(1),
      map(() => auth.isAuthenticated ? true : router.createUrlTree(['/login']))
    );
};

export const publicOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.loading$
    .pipe(
      filter(loading => !loading),
      take(1),
      map(() => !auth.isAuthenticated ? true : router.createUrlTree(['/dashboard']))
    );
};
