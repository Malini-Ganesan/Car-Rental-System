import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { OAuthModule, OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { CarListComponent } from './Pages/car/car-list/car-list.component';
import { CarCreateComponent } from './Pages/car/car-create/car-create.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { UserBookingComponent } from './Pages/user-booking/user-booking.component';
import { LandingComponent } from './Pages/landing/landing.component';
import { NavbarComponent } from './Pages/navbar/navbar.component';
import { SidebarComponent } from './Pages/sidebar/sidebar.component';
import { DashboardOverviewComponent } from './Pages/dashboard-overview/dashboard-overview.component';
import { CarTrackComponent } from './Pages/car/car-track/car-track.component';
import { FooterComponent } from './Pages/footer/footer.component';



export const authCodeFlowConfig: AuthConfig = {
  issuer: 'http://localhost:8080/realms/CarRentalRealm',
  redirectUri: window.location.origin + '/dashboard' ,
  clientId: 'car-rental-frontend',
  responseType: 'code',
  scope: 'openid profile email offline_access',
  showDebugInformation: true,
  requireHttps: false,
  postLogoutRedirectUri: window.location.origin 
};

export function initializeApp(oauthService: OAuthService) {
  return async () => {
    oauthService.configure(authCodeFlowConfig);
    oauthService.setupAutomaticSilentRefresh();
    await oauthService.loadDiscoveryDocumentAndTryLogin();

    if (oauthService.hasValidAccessToken()) {

      if (window.location.search.includes('iss=')) {
        window.history.replaceState({}, document.title, '/dashboard/dashboard-main');
      }

    }
  };
}


@NgModule({
  declarations: [
    AppComponent,
    CarListComponent,
    CarCreateComponent,
    DashboardComponent,
    UserBookingComponent,
    LandingComponent,
    NavbarComponent,
    SidebarComponent,
    DashboardOverviewComponent,
    CarTrackComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['http://localhost:5020/api'], 
        sendAccessToken: true
      }
    })
  ],
  providers: [
     {
       provide: APP_INITIALIZER,
       useFactory: initializeApp,
       multi: true,
       deps: [OAuthService],
     },
     {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }