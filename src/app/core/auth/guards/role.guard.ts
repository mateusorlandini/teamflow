import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../../domain/enums';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: UserRole[] = route.data['roles'] ?? [];
  const user = auth.currentUser();

  if (!user) {
    return router.createUrlTree(['/auth/login']);
  }

  if (requiredRoles.length === 0 || requiredRoles.includes(user.role)) {
    return true;
  }

  return router.createUrlTree(['/403']);
};
