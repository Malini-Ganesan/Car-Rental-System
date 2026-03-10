import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  userRoles: string[] = [];

  constructor(private readonly oauthService: OAuthService) {}

  ngOnInit(): void {
    // Load the roles once when the component starts
    const claims: any = this.oauthService.getIdentityClaims();
    if (claims) {
      this.userName = claims.given_name || claims.preferred_username || 'User';

      this.userRoles = claims.realm_access?.roles || [];
      
      console.log('Logged in User:', this.userName);
      console.log('Assigned Roles:', this.userRoles);
  }
}

    hasRole(roleName: string): boolean {
    return this.userRoles.includes(roleName);
  }

  showAdmin(): boolean {
    return this.hasRole('Admin');
  }

  showUser(): boolean {
    return this.hasRole('User');
  }

  logout(): void {
    this.oauthService.logOut();
  }
}
