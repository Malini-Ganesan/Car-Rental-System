import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import { environment } from 'src/environments/environment';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule] // ✅ FIX: provides HttpClient
    });
    service  = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('create() should POST to /Booking with the payload', () => {
    const payload = { carId: 1, totalPrice: 150 };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${base}/Booking`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('getMyBookings() should GET /Booking/my-bookings', () => {
    const mockBookings = [{ id: 1 }, { id: 2 }];
    service.getMyBookings().subscribe(res => expect(res).toEqual(mockBookings));
    const req = httpMock.expectOne(`${base}/Booking/my-bookings`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBookings);
  });

  it('getAllBookings() should GET /Booking/all-bookings', () => {
    const mockAll = [{ id: 10 }, { id: 11 }];
    service.getAllBookings().subscribe(res => expect(res).toEqual(mockAll));
    const req = httpMock.expectOne(`${base}/Booking/all-bookings`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAll);
  });

  it('cancelBooking() should PUT to /Booking/cancel/:id', () => {
    service.cancelBooking(5).subscribe();
    const req = httpMock.expectOne(`${base}/Booking/cancel/5`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });
});