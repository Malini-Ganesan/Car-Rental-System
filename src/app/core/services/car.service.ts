import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CarService {

  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  // Car CRUD operations
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Car`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/Car/${id}`);
  }

  create(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Car`, formData);
  }

  update(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/Car/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Car/${id}`);
  }
  checkAvailability(carId: number, startDate: string, endDate: string) {
  return this.http.get<any>(
    `${this.baseUrl}/Booking/check-availability?carId=${carId}&startDate=${startDate}&endDate=${endDate}`
  );
}
 
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/CarCategory`);
  }

  getInsurancePlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/InsurancePlan`);
  }
  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Booking`, data);
  }
}