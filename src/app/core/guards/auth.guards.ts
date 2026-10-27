import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '../storage/auth-storage.service';
import { UserRole } from '../models/api.models';

export const authGuard: CanActivateFn = () => {
  const storage = inject(AuthStorageService);
  const router = inject(Router);
  if (storage.token && storage.user) return true;
  return router.createUrlTree(['/login']);
};

export function roleGuard(role: UserRole): CanActivateFn {
  return () => {
    const storage = inject(AuthStorageService);
    const router = inject(Router);
    if (!storage.token || !storage.user) return router.createUrlTree(['/login']);
    return storage.user.role === role
      ? true
      : router.createUrlTree([`/${storage.user.role}`]);
  };
}
