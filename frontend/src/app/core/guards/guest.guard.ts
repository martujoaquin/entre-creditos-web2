import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return router.createUrlTree(['/club/home']);
  }

  return authService.me().pipe(
    map(() => router.createUrlTree(['/club/home'])),
    catchError(() => of(true)),
  );
};
