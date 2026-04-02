import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserBookingComponent } from './user-booking.component';
import { BookingService } from '../../core/services/booking.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { of, throwError } from 'rxjs';

describe('UserBookingComponent', () => {
  let component: UserBookingComponent;
  let fixture: ComponentFixture<UserBookingComponent>;

  let bookingServiceSpy: jasmine.SpyObj<BookingService>;
  let oauthServiceSpy: jasmine.SpyObj<OAuthService>;

  beforeEach(async () => {
    bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'getAllBookings',
      'getMyBookings',
      'cancelBooking'
    ]);

    oauthServiceSpy = jasmine.createSpyObj('OAuthService', [
      'getIdentityClaims'
    ]);

    await TestBed.configureTestingModule({
      declarations: [UserBookingComponent],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: OAuthService, useValue: oauthServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserBookingComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    bookingServiceSpy.getMyBookings.and.returnValue(of([{ id: 1, status: 'Active' }]));
    bookingServiceSpy.getAllBookings.and.returnValue(of([{ id: 99, status: 'Active' }]));
  });

  // ✅ Basic
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ✅ Admin role
  it('should set isAdmin true and load all bookings', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['Admin'] }
    } as any);

    component.ngOnInit();

    expect(component.isAdmin).toBeTrue();
    expect(bookingServiceSpy.getAllBookings).toHaveBeenCalled();
  });

  // ✅ User role
  it('should set isAdmin false and load user bookings', () => {
    oauthServiceSpy.getIdentityClaims.and.returnValue({
      realm_access: { roles: ['User'] }
    } as any);

    component.ngOnInit();

    expect(component.isAdmin).toBeFalse();
    expect(bookingServiceSpy.getMyBookings).toHaveBeenCalled();
  });

  // ✅ Pagination next
  it('should go to next page', () => {
    component.bookings = Array(20).fill({});
    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage).toBe(2);
  });

  // ✅ Pagination prev
  it('should go to previous page', () => {
    component.currentPage = 2;

    component.prevPage();

    expect(component.currentPage).toBe(1);
  });

  // ✅ Pagination boundary
  it('should not exceed total pages', () => {
    component.bookings = Array(6).fill({});
    component.currentPage = 1;

    component.nextPage();

    expect(component.currentPage).toBe(1);
  });

  // ✅ Cancel booking success
  it('should cancel booking successfully', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    const booking = { id: 1, status: 'Active', isCancelling: false };

    bookingServiceSpy.cancelBooking.and.returnValue(of({ message: 'Cancelled successfully' }));

    spyOn(component, 'loadBookings');

    component.cancelBooking(booking);

    expect(booking.isCancelling).toBeFalse();
    expect(booking.status).toBe('Cancelled');
    expect(window.alert).toHaveBeenCalledWith('Cancelled successfully');
    expect(component.loadBookings).toHaveBeenCalled();
  });

  // ❌ Cancel booking error
  it('should handle cancel booking error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    const booking = { id: 1, status: 'Active', isCancelling: false };

    bookingServiceSpy.cancelBooking.and.returnValue(
      throwError(() => ({ error: { message: 'Cancel failed' } }))
    );

    component.cancelBooking(booking);

    expect(booking.isCancelling).toBeFalse();
    expect(window.alert).toHaveBeenCalledWith('Cancel failed');
  });

  // ❌ Cancel not confirmed
  it('should not cancel booking if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    const booking = { id: 1 };

    component.cancelBooking(booking);

    expect(bookingServiceSpy.cancelBooking).not.toHaveBeenCalled();
  });

  // ✅ Reset page after load
  it('should reset currentPage after loading bookings', () => {
    component.currentPage = 3;
    component.isAdmin = false;

    component.loadBookings();

    expect(component.currentPage).toBe(1);
  });

});