import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { OAuthService } from 'angular-oauth2-oidc';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let oauthServiceSpy: jasmine.SpyObj<OAuthService>;

  beforeEach(async () => {
    // ✅ Create spy
    oauthServiceSpy = jasmine.createSpyObj('OAuthService', [
      'getIdentityClaims',
      'logOut'
    ]);

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      providers: [
        { provide: OAuthService, useValue: oauthServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ✅ Basic
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ✅ No claims case
  it('should return empty roles if no claims', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue(null as any);

    const roles = component.getUserRoles();

    expect(roles).toEqual([]);
  });

  // ✅ Roles extraction
  it('should return roles from claims', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['Admin', 'User'] }
    } as any);

    const roles = component.getUserRoles();

    expect(roles).toEqual(['Admin', 'User']);
  });

  // ✅ showAdmin true
  it('should return true if Admin role exists', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['Admin'] }
    } as any);

    expect(component.showAdmin()).toBeTrue();
  });

  // ✅ showAdmin false
  it('should return false if Admin role does not exist', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['User'] }
    } as any);

    expect(component.showAdmin()).toBeFalse();
  });

  // ✅ showUser true
  it('should return true if User role exists', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['User'] }
    } as any);

    expect(component.showUser()).toBeTrue();
  });

  // ✅ showUser false
  it('should return false if User role does not exist', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['Admin'] }
    } as any);

    expect(component.showUser()).toBeFalse();
  });

  // ✅ logout
  it('should call OAuthService.logOut()', () => {
    component.logout();

    expect(oauthServiceSpy.logOut).toHaveBeenCalled();
  });

});