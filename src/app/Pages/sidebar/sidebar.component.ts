import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  constructor(private oauthService: OAuthService) {}

  getUserRoles(): string[] {

    const claims: any = this.oauthService.getIdentityClaims();

    if (!claims) return [];

    return claims.realm_access?.roles || [];
  }

  showAdmin(): boolean {
    return this.getUserRoles().includes('Admin');
  }

  showUser(): boolean {
    return this.getUserRoles().includes('User');
  }

  logout(){
    this.oauthService.logOut();
  }

}