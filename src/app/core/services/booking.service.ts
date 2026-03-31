import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  create(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Booking`, data);
  }

  getMyBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Booking/my-bookings`);
  }

  getAllBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Booking/all-bookings`);
  }
  cancelBooking(id: number) {
    return this.http.put(`${this.baseUrl}/Booking/cancel/${id}`, {});
  }
}