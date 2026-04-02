import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CarListComponent } from './car-list.component';
import { CarService } from '../../../core/services/car.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { DashboardRefreshService } from 'src/app/core/services/dashboard-refresh.service';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockCars = [
  { id: 1, name: 'Toyota Camry', categoryName: 'Sedan', pricePerHour: 10, pricePerDay: 50, pricePerWeek: 300, insuranceName: 'Basic', insuranceCost: 5, imageUrl: '/img/camry.jpg' },
  { id: 2, name: 'BMW X5', categoryName: 'SUV', pricePerHour: 20, pricePerDay: 100, pricePerWeek: 600, insuranceName: 'Premium', insuranceCost: 10, imageUrl: '/img/bmw.jpg' },
  { id: 3, name: 'Honda Civic', categoryName: 'Sedan', pricePerHour: 8, pricePerDay: 40, pricePerWeek: 240, insuranceName: 'Basic', insuranceCost: 4, imageUrl: '/img/civic.jpg' },
  { id: 4, name: 'Ford Mustang', categoryName: 'Sports', pricePerHour: 25, pricePerDay: 120, pricePerWeek: 700, insuranceName: 'Premium', insuranceCost: 12, imageUrl: null },
  { id: 5, name: 'Audi A4', categoryName: 'Sedan', pricePerHour: 15, pricePerDay: 70, pricePerWeek: 420, insuranceName: 'Standard', insuranceCost: 7, imageUrl: '/img/audi.jpg' },
  { id: 6, name: 'Hyundai Tucson', categoryName: 'SUV', pricePerHour: 12, pricePerDay: 55, pricePerWeek: 330, insuranceName: 'Basic', insuranceCost: 5, imageUrl: '/img/tucson.jpg' },
  { id: 7, name: 'Kia Sportage', categoryName: 'SUV', pricePerHour: 11, pricePerDay: 48, pricePerWeek: 290, insuranceName: 'Basic', insuranceCost: 4, imageUrl: '/img/kia.jpg' },
];

const mockCategories = [
  { id: 1, name: 'Sedan' },
  { id: 2, name: 'SUV' },
  { id: 3, name: 'Sports' },
];

const mockInsurances = [
  { id: 1, name: 'Basic' },
  { id: 2, name: 'Standard' },
  { id: 3, name: 'Premium' },
];

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('CarListComponent', () => {
  let component: CarListComponent;
  let fixture: ComponentFixture<CarListComponent>;

  let mockCarService: jasmine.SpyObj<CarService>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;
  let mockRefreshService: jasmine.SpyObj<DashboardRefreshService>;

  beforeEach(async () => {
    mockCarService = jasmine.createSpyObj('CarService', [
      'getAll', 'getCategories', 'getInsurancePlans',
      'update', 'delete', 'createBooking', 'checkAvailability'
    ]);
    mockOAuthService = jasmine.createSpyObj('OAuthService', ['getIdentityClaims']);
    mockRefreshService = jasmine.createSpyObj('DashboardRefreshService', ['triggerRefresh']);

    mockCarService.getAll.and.returnValue(of(mockCars));
    mockCarService.getCategories.and.returnValue(of(mockCategories));
    mockCarService.getInsurancePlans.and.returnValue(of(mockInsurances));
    mockOAuthService.getIdentityClaims.and.returnValue(null as any);

    await TestBed.configureTestingModule({
      declarations: [CarListComponent],
      imports: [FormsModule],
      providers: [
        { provide: CarService,              useValue: mockCarService },
        { provide: OAuthService,            useValue: mockOAuthService },
        { provide: DashboardRefreshService, useValue: mockRefreshService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture   = TestBed.createComponent(CarListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── 1. COMPONENT CREATION ──────────────────────────────────────────────────

  describe('Component Creation', () => {

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default booking object on init', () => {
      expect(component.booking.type).toBe('hour');
      expect(component.booking.price).toBe(0);
      expect(component.booking.location).toBe('');
    });

    it('should start with showEditModal as false', () => {
      expect(component.showEditModal).toBeFalse();
    });

    it('should start with showBookingModal as false', () => {
      expect(component.showBookingModal).toBeFalse();
    });

  });

  // ── 2. LOAD DATA (ngOnInit) ────────────────────────────────────────────────

  describe('ngOnInit — loadCars, loadCategories, loadInsurances', () => {

    it('should call getAll() on init and populate cars array', () => {
      expect(mockCarService.getAll).toHaveBeenCalled();
      expect(component.cars.length).toBe(7);
      expect(component.cars[0].name).toBe('Toyota Camry');
    });

    it('should call getCategories() on init and populate categories', () => {
      expect(mockCarService.getCategories).toHaveBeenCalled();
      expect(component.categories.length).toBe(3);
      expect(component.categories[0].name).toBe('Sedan');
    });

    it('should call getInsurancePlans() on init and populate insurances', () => {
      expect(mockCarService.getInsurancePlans).toHaveBeenCalled();
      expect(component.insurances.length).toBe(3);
    });

    it('should reset currentPage to 1 after loadCars()', () => {
      component.currentPage = 3;
      component.loadCars();
      expect(component.currentPage).toBe(1);
    });

  });

  // ── 3. ROLE CHECKING ──────────────────────────────────────────────────────

  describe('checkUserRole()', () => {

    it('should set isAdmin = true when claims have Admin role', () => {
      mockOAuthService.getIdentityClaims.and.returnValue({ sub: 'user-123', realm_access: { roles: ['Admin'] } });
      component.checkUserRole();
      expect(component.isAdmin).toBeTrue();
      expect(component.isUser).toBeFalse();
    });

    it('should set isUser = true when claims have User role', () => {
      mockOAuthService.getIdentityClaims.and.returnValue({ sub: 'user-456', realm_access: { roles: ['User'] } });
      component.checkUserRole();
      expect(component.isUser).toBeTrue();
      expect(component.isAdmin).toBeFalse();
    });

    it('should set both isAdmin and isUser false when claims is null', () => {
      mockOAuthService.getIdentityClaims.and.returnValue(null as any);
      component.checkUserRole();
      expect(component.isAdmin).toBeFalse();
      expect(component.isUser).toBeFalse();
    });

    it('should handle missing realm_access gracefully', () => {
      mockOAuthService.getIdentityClaims.and.returnValue({ sub: 'user-789' });
      expect(() => component.checkUserRole()).not.toThrow();
      expect(component.isAdmin).toBeFalse();
    });

  });

  // ── 4. PAGINATION ─────────────────────────────────────────────────────────

  describe('Pagination', () => {

    it('should show 6 cars on first page (itemsPerPage = 6)', () => {
      expect(component.paginatedCars.length).toBe(6);
    });

    it('should show remaining cars on second page', () => {
      component.currentPage = 2;
      expect(component.paginatedCars.length).toBe(1);
    });

    it('should calculate totalPages correctly', () => {
      expect(component.totalPages).toBe(2);
    });

    it('nextPage() should increase currentPage by 1', () => {
      component.currentPage = 1;
      component.nextPage();
      expect(component.currentPage).toBe(2);
    });

    it('nextPage() should NOT go beyond totalPages', () => {
      component.currentPage = component.totalPages;
      component.nextPage();
      expect(component.currentPage).toBe(component.totalPages);
    });

    it('prevPage() should decrease currentPage by 1', () => {
      component.currentPage = 2;
      component.prevPage();
      expect(component.currentPage).toBe(1);
    });

    it('prevPage() should NOT go below 1', () => {
      component.currentPage = 1;
      component.prevPage();
      expect(component.currentPage).toBe(1);
    });

    it('should show all cars on one page when total <= itemsPerPage', () => {
      component.cars = mockCars.slice(0, 4);
      expect(component.paginatedCars.length).toBe(4);
      expect(component.totalPages).toBe(1);
    });

  });

  // ── 5. EDIT MODAL ─────────────────────────────────────────────────────────

  describe('Edit Modal — openEditModal() and closeModal()', () => {

    it('should open edit modal and copy car data into selectedCar', () => {
      component.openEditModal(mockCars[0]);
      expect(component.showEditModal).toBeTrue();
      expect(component.selectedCar.name).toBe('Toyota Camry');
      expect(component.selectedCar.id).toBe(1);
    });

    it('should copy the car (not the same reference) into selectedCar', () => {
      component.openEditModal(mockCars[0]);
      component.selectedCar.name = 'Modified Name';
      expect(mockCars[0].name).toBe('Toyota Camry');
    });

    it('closeModal() should set showEditModal to false', () => {
      component.showEditModal = true;
      component.closeModal();
      expect(component.showEditModal).toBeFalse();
    });

  });

  // ── 6. UPDATE CAR ─────────────────────────────────────────────────────────

  describe('updateCar()', () => {

    beforeEach(() => {
      component.selectedCar = {
        id: 1, name: 'Toyota Camry', categoryId: 1,
        pricePerHour: 10, pricePerDay: 50, pricePerWeek: 300, insuranceId: 1
      };
      component.showEditModal = true;
    });

    it('should call carService.update() with correct id when all fields are valid', () => {
      mockCarService.update.and.returnValue(of({}));
      component.updateCar();
      expect(mockCarService.update).toHaveBeenCalledWith(1, jasmine.any(FormData));
    });

    it('should close the modal after successful update', () => {
      mockCarService.update.and.returnValue(of({}));
      component.updateCar();
      expect(component.showEditModal).toBeFalse();
    });

    it('should reload cars after successful update', () => {
      mockCarService.update.and.returnValue(of({}));
      component.updateCar();
      expect(mockCarService.getAll).toHaveBeenCalledTimes(2);
    });

    it('should NOT call update() when name is missing', () => {
      spyOn(window, 'alert');
      component.selectedCar.name = '';
      component.updateCar();
      expect(mockCarService.update).not.toHaveBeenCalled();
    });

    it('should NOT call update() when categoryId is missing', () => {
      spyOn(window, 'alert');
      component.selectedCar.categoryId = '';
      component.updateCar();
      expect(mockCarService.update).not.toHaveBeenCalled();
    });

    it('should NOT call update() when pricePerDay is missing', () => {
      spyOn(window, 'alert');
      component.selectedCar.pricePerDay = null;
      component.updateCar();
      expect(mockCarService.update).not.toHaveBeenCalled();
    });

  });

  // ── 7. BOOKING MODAL ──────────────────────────────────────────────────────

  describe('openBookingPopup()', () => {

    it('should open booking modal', () => {
      component.openBookingPopup(mockCars[0]);
      expect(component.showBookingModal).toBeTrue();
    });

    it('should set selectedCarForBooking to the clicked car', () => {
      component.openBookingPopup(mockCars[1]);
      expect(component.selectedCarForBooking.name).toBe('BMW X5');
      expect(component.selectedCarForBooking.id).toBe(2);
    });

    it('should set booking.carId to the selected car id', () => {
      component.openBookingPopup(mockCars[0]);
      expect(component.booking.carId).toBe(1);
    });

    it('should reset booking price to 0 when opening popup', () => {
      component.booking.price = 999;
      component.openBookingPopup(mockCars[0]);
      expect(component.booking.price).toBe(0);
    });

    it('should reset booking type to "hour" when opening popup', () => {
      component.booking.type = 'day';
      component.openBookingPopup(mockCars[0]);
      expect(component.booking.type).toBe('hour');
    });

  });

  // ── 8. onTypeChange ───────────────────────────────────────────────────────

  describe('onTypeChange()', () => {

    it('should reset price to 0 on type change', () => {
      component.booking.price = 500;
      component.booking.type = 'day';
      component.onTypeChange();
      expect(component.booking.price).toBe(0);
    });

    it('should clear startDate and endDate when switching to hour', () => {
      component.booking.startDate = '2025-06-01';
      component.booking.endDate   = '2025-06-05';
      component.booking.type = 'hour';
      component.onTypeChange();
      expect(component.booking.startDate).toBe('');
      expect(component.booking.endDate).toBe('');
    });

    it('should clear hours when switching to day/week', () => {
      component.booking.hours = 5;
      component.booking.type = 'day';
      component.onTypeChange();
      expect(component.booking.hours).toBeNull();
    });

  });

  // ── 9. calculatePrice ────────────────────────────────────────────────────

  describe('calculatePrice()', () => {

    beforeEach(() => {
      component.selectedCarForBooking = {
        id: 1, name: 'Toyota Camry',
        pricePerHour: 10, pricePerDay: 50,
        pricePerWeek: 300, insuranceCost: 5
      };

      // ✅ FIX: calculatePrice() calls checkAvailability() for non-hour bookings,
      // which internally calls carService.checkAvailability().subscribe(...).
      // Without this mock the spy returns undefined → TypeError: cannot read 'subscribe'.
      mockCarService.checkAvailability.and.returnValue(of({ isBooked: false }));
    });

    it('should calculate hourly price correctly (3 hours × 10 = 30)', () => {
      component.booking.type  = 'hour';
      component.booking.hours = 3;
      component.calculatePrice();
      expect(component.booking.price).toBe(30);
    });

    it('should set price to 0 when hours is 0', () => {
      component.booking.type  = 'hour';
      component.booking.hours = 0;
      component.calculatePrice();
      expect(component.booking.price).toBe(0);
    });

    it('should set price to 0 when hours is null', () => {
      component.booking.type  = 'hour';
      component.booking.hours = null;
      component.calculatePrice();
      expect(component.booking.price).toBe(0);
    });

    it('should calculate day/week price: 3 days = 3 × 50/day + 3 × 5 insurance = 165', () => {
      component.booking.type      = 'day';
      component.booking.startDate = '2025-06-01';
      component.booking.endDate   = '2025-06-03'; // 3 days inclusive
      component.booking.hours     = null;
      component.calculatePrice();
      // 3 days → 0 weeks + 3 remaining days
      // basePrice = 0×300 + 3×50 = 150
      // insurance = 3×5 = 15
      // total = 165
      expect(component.booking.price).toBe(165);
    });

    it('should calculate weekly price: 7 days = 1 week × 300 + 7×5 insurance = 335', () => {
      component.booking.type      = 'week';
      component.booking.startDate = '2025-06-01';
      component.booking.endDate   = '2025-06-07'; // 7 days inclusive
      component.calculatePrice();
      // 7 days → 1 full week, 0 remaining days
      // basePrice = 1×300 + 0×50 = 300
      // insurance = 7×5 = 35
      // total = 335
      expect(component.booking.price).toBe(335);
    });

    it('should set price to 0 when endDate is missing for day booking', () => {
      component.booking.type      = 'day';
      component.booking.startDate = '2025-06-01';
      component.booking.endDate   = '';
      component.calculatePrice();
      expect(component.booking.price).toBe(0);
    });

    it('should return early without error if selectedCarForBooking is null', () => {
      component.selectedCarForBooking = null;
      component.booking.type  = 'hour';
      component.booking.hours = 3;
      expect(() => component.calculatePrice()).not.toThrow();
    });

    // ✅ FIX: checkAvailability() is async (Observable subscription).
    // calculateDatePrice() runs synchronously FIRST setting price to 165,
    // then the subscription callback fires and resets it to 0.
    // We must use fakeAsync + tick() to flush the Observable before asserting.
    it('should alert and reset price when car is already booked', fakeAsync(() => {
      mockCarService.checkAvailability.and.returnValue(of({ isBooked: true }));
      spyOn(window, 'alert');

      component.booking.type      = 'day';
      component.booking.startDate = '2025-06-01';
      component.booking.endDate   = '2025-06-03';
      component.calculatePrice();

      tick(); // flush the Observable subscription callback

      expect(window.alert).toHaveBeenCalledWith('Car already booked for selected dates');
      expect(component.booking.price).toBe(0);
    }));

  });

  // ── 10. DELETE CAR ────────────────────────────────────────────────────────

  describe('deleteCar()', () => {

    it('should call carService.delete() with correct id when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockCarService.delete.and.returnValue(of({}));
      component.deleteCar(1);
      expect(mockCarService.delete).toHaveBeenCalledWith(1);
    });

    it('should reload cars after successful deletion', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockCarService.delete.and.returnValue(of({}));
      component.deleteCar(1);
      expect(mockCarService.getAll).toHaveBeenCalledTimes(2);
    });

    it('should NOT call carService.delete() when user cancels confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteCar(1);
      expect(mockCarService.delete).not.toHaveBeenCalled();
    });

  });

  // ── 11. CONFIRM BOOKING ───────────────────────────────────────────────────

  describe('confirmBooking()', () => {

    beforeEach(() => {
      mockOAuthService.getIdentityClaims.and.returnValue({
        sub: 'user-abc-123',
        realm_access: { roles: ['User'] }
      });
      component.selectedCarForBooking = mockCars[0];
      component.booking = {
        carId: 1, type: 'hour', hours: 3,
        location: 'Chennai', startDate: '', endDate: '',
        basePrice: 0, insurancePrice: 0, price: 30
      };
    });

    it('should call createBooking() for a valid hour booking', () => {
      mockCarService.createBooking.and.returnValue(of({}));
      component.confirmBooking();
      expect(mockCarService.createBooking).toHaveBeenCalled();
    });

    it('should close booking modal after successful booking', () => {
      mockCarService.createBooking.and.returnValue(of({}));
      component.showBookingModal = true;
      component.confirmBooking();
      expect(component.showBookingModal).toBeFalse();
    });

    it('should trigger dashboard refresh after successful booking', () => {
      mockCarService.createBooking.and.returnValue(of({}));
      component.confirmBooking();
      expect(mockRefreshService.triggerRefresh).toHaveBeenCalled();
    });

    it('should NOT call createBooking() when user is not logged in', () => {
      spyOn(window, 'alert');
      mockOAuthService.getIdentityClaims.and.returnValue(null as any);
      component.confirmBooking();
      expect(mockCarService.createBooking).not.toHaveBeenCalled();
    });

    it('should NOT call createBooking() when location is empty', () => {
      spyOn(window, 'alert');
      component.booking.location = '';
      component.confirmBooking();
      expect(mockCarService.createBooking).not.toHaveBeenCalled();
    });

    it('should NOT call createBooking() when hours is 0 for hour booking', () => {
      spyOn(window, 'alert');
      component.booking.hours = 0;
      component.confirmBooking();
      expect(mockCarService.createBooking).not.toHaveBeenCalled();
    });

    it('should NOT call createBooking() when startDate is missing for day booking', () => {
      spyOn(window, 'alert');
      component.booking.type      = 'day';
      component.booking.startDate = '';
      component.booking.endDate   = '2025-06-05';
      component.confirmBooking();
      expect(mockCarService.createBooking).not.toHaveBeenCalled();
    });

    it('should handle booking API error gracefully', () => {
      spyOn(window, 'alert');
      mockCarService.createBooking.and.returnValue(
        throwError(() => ({ error: 'Car not available' }))
      );
      expect(() => component.confirmBooking()).not.toThrow();
    });

  });

});