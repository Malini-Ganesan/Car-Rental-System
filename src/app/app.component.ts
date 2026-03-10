import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './app.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'car-rental';

  constructor(private router: Router, private oauthService: OAuthService) {}

  ngOnInit() {
  this.router.initialNavigation();

  if (!this.oauthService.hasValidAccessToken()) {
    this.oauthService.initCodeFlow();
  }
}
}
