import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isLoggedIn',
      'login',
      'getUser'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    // ✅ Default mock user
    authServiceSpy.getUser.and.returnValue({
      realm_access: { roles: [] },
      resource_access: {}
    });
  });

  // ─────────────────────────────────────────────
  // ✅ 1. Logged in, no roles required
  // ─────────────────────────────────────────────
  it('should allow access if user is logged in and no roles required', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    const route = { data: {} } as any;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, {} as any)
    );

    expect(result).toBeTrue();
  });

  // ─────────────────────────────────────────────
  // ❌ 2. Not logged in
  // ─────────────────────────────────────────────
  it('should block access and trigger login if not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    const route = { data: {} } as any;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, {} as any)
    );

    expect(result).toBeFalse();
    expect(authServiceSpy.login).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  // ✅ 3. Role match (realm role)
  // ─────────────────────────────────────────────
  it('should allow access if user has required realm role', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    authServiceSpy.getUser.and.returnValue({
      realm_access: { roles: ['Admin'] },
      resource_access: {}
    });

    const route = { data: { roles: ['Admin'] } } as any;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, {} as any)
    );

    expect(result).toBeTrue();
  });

  // ─────────────────────────────────────────────
  // ✅ 4. Role match (client role)
  // ─────────────────────────────────────────────
  it('should allow access if user has required client role', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    authServiceSpy.getUser.and.returnValue({
      realm_access: { roles: [] },
      resource_access: {
        'car-rental-frontend': {
          roles: ['User']
        }
      }
    });

    const route = { data: { roles: ['User'] } } as any;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, {} as any)
    );

    expect(result).toBeTrue();
  });

  // ─────────────────────────────────────────────
  // ❌ 5. Role mismatch
  // ─────────────────────────────────────────────
  it('should deny access and redirect if role does not match', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    authServiceSpy.getUser.and.returnValue({
      realm_access: { roles: ['User'] },
      resource_access: {}
    });

    const route = { data: { roles: ['Admin'] } } as any;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, {} as any)
    );

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  // ─────────────────────────────────────────────
  // ✅ 6. Case-insensitive role match
  // ─────────────────────────────────────────────
  it('should allow access with case-insensitive role match', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    authServiceSpy.getUser.and.returnValue({
      realm_access: { roles: ['admin'] },
      resource_access: {}
    });

    const route = { data: { roles: ['Admin'] } } as any;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, {} as any)
    );

    expect(result).toBeTrue();
  });

  // ─────────────────────────────────────────────
  // ✅ 7. Handle missing claims safely
  // ─────────────────────────────────────────────
  it('should handle missing claims without crashing', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getUser.and.returnValue(null as any);

    const route = { data: { roles: ['Admin'] } } as any;

    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, {} as any)
    );

    expect(result).toBeFalse();
  });
});