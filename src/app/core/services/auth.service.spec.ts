import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { OAuthService } from 'angular-oauth2-oidc';
const mockOAuthService = jasmine.createSpyObj('OAuthService', [
  'getIdentityClaims'
]);

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
      { provide: OAuthService, useValue: mockOAuthService }
    ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
