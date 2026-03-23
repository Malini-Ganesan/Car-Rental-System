import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CarService {

  private baseUrl = 'http://localhost:5020/api/Car';
  private categoryUrl = 'http://localhost:5020/api/CarCategory';
  private insuranceUrl = 'http://localhost:5020/api/InsurancePlan';

  constructor(private http: HttpClient) { }

  // Car CRUD operations
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  create(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl, formData);
  }

  update(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Supporting data
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.categoryUrl);
  }

  getInsurancePlans(): Observable<any[]> {
    return this.http.get<any[]>(this.insuranceUrl);
  }
  createBooking(data: any) {
    return this.http.post(
      'http://localhost:5020/api/booking',
      data
    );
  }
}