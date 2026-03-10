import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private baseUrl = 'http://localhost:5020/api/Booking';

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  getMyBookings(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
}