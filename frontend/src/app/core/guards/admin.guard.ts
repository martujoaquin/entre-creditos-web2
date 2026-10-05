import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (currentUser) {
    return currentUser.es_admin === 1 ? true : router.createUrlTree(['/club/home']);
  }

  return authService.me().pipe(
    map((usuario) => (usuario.es_admin === 1 ? true : router.createUrlTree(['/club/home']))),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
