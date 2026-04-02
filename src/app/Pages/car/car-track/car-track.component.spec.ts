import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarTrackComponent } from './car-track.component';
import { BookingService } from '../../../core/services/booking.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('CarTrackComponent', () => {
  let component: CarTrackComponent;
  let fixture: ComponentFixture<CarTrackComponent>;

  let bookingServiceSpy: jasmine.SpyObj<BookingService>;
  let oauthServiceSpy: jasmine.SpyObj<OAuthService>;

  beforeEach(async () => {
    bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'getAllBookings',
      'getMyBookings'
    ]);

    oauthServiceSpy = jasmine.createSpyObj('OAuthService', [
      'getIdentityClaims'
    ]);

    await TestBed.configureTestingModule({
      declarations: [CarTrackComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: OAuthService, useValue: oauthServiceSpy },
        DomSanitizer
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarTrackComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    // Default mock (non-admin)
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['User'] }
    } as any);

    bookingServiceSpy.getMyBookings.and.returnValue(of([{ id: 1 }]));
    bookingServiceSpy.getAllBookings.and.returnValue(of([{ id: 99 }]));

    fixture.detectChanges(); // triggers ngOnInit
  });

  // ✅ Basic
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ✅ Role check - Admin
  it('should set isAdmin true if user has Admin role', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['Admin'] }
    } as any);

    component.checkUserRole();

    expect(component.isAdmin).toBeTrue();
  });

  // ✅ Role check - Non Admin
  it('should set isAdmin false if user is not Admin', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['User'] }
    } as any);

    component.checkUserRole();

    expect(component.isAdmin).toBeFalse();
  });

  // ✅ Load bookings for Admin
  it('should load all bookings for admin', () => {
    component.isAdmin = true;

    component.loadBookings();

    expect(bookingServiceSpy.getAllBookings).toHaveBeenCalled();
    expect(component.bookings.length).toBe(1);
  });

  // ✅ Load bookings for User
  it('should load user bookings for non-admin', () => {
    component.isAdmin = false;

    component.loadBookings();

    expect(bookingServiceSpy.getMyBookings).toHaveBeenCalled();
    expect(component.bookings.length).toBe(1);
  });

  // ✅ Pagination - next page
  it('should go to next page', () => {
    component.bookings = Array(20).fill({});
    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  // ✅ Pagination - prev page
  it('should go to previous page', () => {
    component.currentPage = 2;

    component.prevPage();

    expect(component.currentPage).toBe(1);
  });

  // ✅ Pagination - boundary (next)
  it('should not exceed total pages', () => {
    component.bookings = Array(6).fill({});
    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage).toBe(1);
  });

  // ✅ Pagination - boundary (prev)
  it('should not go below page 1', () => {
    component.currentPage = 1;

    component.prevPage();

    expect(component.currentPage).toBe(1);
  });

  // ✅ Track car (modal + map)
  it('should open tracking modal and set map URL', () => {
    component.trackCar({});

    expect(component.showTrackModal).toBeTrue();
    expect(component.mapUrl).toContain('google.com');
  });

  // ✅ Close modal
  it('should close tracking modal', () => {
    component.showTrackModal = true;

    component.closeTrackModal();

    expect(component.showTrackModal).toBeFalse();
  });

  // ✅ Reset page on loadBookings
  it('should reset currentPage to 1 when loading bookings', () => {
    component.currentPage = 3;

    component.loadBookings();

    expect(component.currentPage).toBe(1);
  });

});