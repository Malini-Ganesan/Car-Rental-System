import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(childRoute);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean {

    // 🔐 Not logged in
    if (!this.authService.isLoggedIn()) {
      this.authService.login();
      return false;
    }

    const requiredRoles: string[] = route.data['roles'];

    // If no roles required → allow
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const claims: any = this.authService.getUser();
    //Get realm roles
    const realmRoles: string[] = claims?.realm_access?.roles || [];

    //Keycloak client id
    const clientId = 'car-rental-frontend';

    //Get client roles
    const clientRoles: string[] =
    claims?.resource_access?.[clientId]?.roles || [];

    // Merge both
    const userRoles: string[] = [...realmRoles, ...clientRoles];

    console.log('User Roles:', userRoles);

    //Case-insensitive comparison
    const hasRole = requiredRoles.some((role: string) =>
      userRoles.some((userRole: string) =>
        userRole.toLowerCase() === role.toLowerCase()
      )
    );

    if (hasRole) {
      return true;
    }

    console.warn('Access denied. Required roles:', requiredRoles);
    this.router.navigate(['/dashboard']);
    return false;
  }
}