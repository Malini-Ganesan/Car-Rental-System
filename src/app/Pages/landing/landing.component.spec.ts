import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { OAuthService } from 'angular-oauth2-oidc';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let oauthServiceSpy: jasmine.SpyObj<OAuthService>;

  beforeEach(async () => {
    // ✅ Create spy
    oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['initLoginFlow']);

    await TestBed.configureTestingModule({
      declarations: [LandingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: OAuthService, useValue: oauthServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ✅ Basic
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ✅ Test login function
  it('should call OAuthService.initLoginFlow with redirect URL', () => {
    component.login();

    expect(oauthServiceSpy.initLoginFlow).toHaveBeenCalledWith('/dashboard');
  });

});