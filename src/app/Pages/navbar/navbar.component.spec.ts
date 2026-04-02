import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'login', 'logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ✅ FIX: component has no ngOnDestroy, so wrap in fakeAsync
  // and use discardPeriodicTasks() to clear the setInterval
  it('should set isLoggedIn on init', fakeAsync(() => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    component.ngOnInit();

    expect(component.isLoggedIn).toBeTrue();

    discardPeriodicTasks(); // clears the interval started by ngOnInit
  }));

  it('should update login status correctly', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    component.updateLoginStatus();

    expect(component.isLoggedIn).toBeTrue();
  });

  it('should call authService.login()', () => {
    component.login();

    expect(authServiceSpy.login).toHaveBeenCalled();
  });

  it('should call logout and navigate to home', () => {
    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should toggle sidebar-open class on body', () => {
    const classListSpy = spyOn(document.body.classList, 'toggle');
    component.toggleMenu();

    expect(classListSpy).toHaveBeenCalledWith('sidebar-open');
  });

  it('should close menu', () => {
    component.menuOpen = true;
    component.closeMenu();

    expect(component.menuOpen).toBeFalse();
  });

  // ✅ FIX: discardPeriodicTasks() tells fakeAsync to discard the
  // still-running setInterval so the zone drains cleanly without error.
  it('should call updateLoginStatus periodically', fakeAsync(() => {
    spyOn(component, 'updateLoginStatus');

    component.ngOnInit();

    tick(1000); // simulate 1 interval tick

    expect(component.updateLoginStatus).toHaveBeenCalled();

    discardPeriodicTasks(); // ✅ clears the pending setInterval from the fake clock
  }));

  // Bonus: verify the interval fires multiple times
  it('should call updateLoginStatus on every interval tick', fakeAsync(() => {
    spyOn(component, 'updateLoginStatus');

    component.ngOnInit();

    tick(3000); // simulate 3 ticks (assuming 1000ms interval)

    // ngOnInit calls updateLoginStatus() once immediately,
    // then setInterval fires it 3 more times → total 4 calls
    expect(component.updateLoginStatus).toHaveBeenCalledTimes(4);

    discardPeriodicTasks(); // ✅ required to drain the zone
  }));

});