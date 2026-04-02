import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🔐 Not logged in
  if (!authService.isLoggedIn()) {
    authService.login();
    return false;
  }

  const requiredRoles: string[] = route.data['roles'];

  // ✅ No roles required
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const claims: any = authService.getUser();

  const realmRoles: string[] = claims?.realm_access?.roles || [];

  const clientId = 'car-rental-frontend';
  const clientRoles: string[] =
    claims?.resource_access?.[clientId]?.roles || [];

  const userRoles: string[] = [...realmRoles, ...clientRoles];

  const hasRole = requiredRoles.some(role =>
    userRoles.some(userRole =>
      userRole.toLowerCase() === role.toLowerCase()
    )
  );

  if (hasRole) return true;

  router.navigate(['/dashboard']);
  return false;
};