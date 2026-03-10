import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-login',
  template: '<div style="text-align:center; padding: 50px;"><h2>Redirecting to Secure Login...</h2></div>'
})
export class LoginComponent implements OnInit {
  constructor(private readonly oauthService: OAuthService, private router: Router) {}
    async ngOnInit() {
    if (this.oauthService.hasValidAccessToken()) {
      this.router.navigate(['/dashboard']);
    } else {
      // ✅ Triggers the Keycloak login page
      this.oauthService.initCodeFlow();
    }
  }
}
