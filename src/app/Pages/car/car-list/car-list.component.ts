import { Component, OnInit } from '@angular/core';
import { CarService } from '../../../core/services/car.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit {

  apiUrl = 'http://localhost:5020/api';
  cars: any[] = [];
  showEditModal = false;
  selectedCar: any = {};

  categories: any[] = [];
  insurances: any[] = [];

  isAdmin: boolean = false;
  isUser: boolean = false;

  booking: any = {
    carId: '',
    startDate: '',
    endDate: '',
    location: '',
    price: 0
  };

  showBookingModal: boolean = false;
  selectedCarForBooking: any = null;

  constructor(private carService: CarService,
              private oauthService: OAuthService) { }

  ngOnInit(): void {
    this.loadCars();
    this.loadCategories();
    this.loadInsurances();
    this.checkUserRole();
  }

  // ===================== LOAD DATA =====================
  loadCars() {
    this.carService.getAll().subscribe(res => this.cars = res);
  }

  loadCategories() {
    this.carService.getCategories().subscribe(res => this.categories = res);
  }

  loadInsurances() {
    this.carService.getInsurancePlans().subscribe(res => this.insurances = res);
  }

  checkUserRole() {
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) return;
    const roles = claims.realm_access?.roles || [];
    this.isAdmin = roles.includes('Admin');
    this.isUser = roles.includes('User');
  }

  // ===================== CAR EDIT =====================
  openEditModal(car: any) {
    this.selectedCar = { ...car };
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
  }

  updateCar() {
    const formData = new FormData();
    formData.append("name", this.selectedCar.name);
    formData.append("categoryId", this.selectedCar.categoryId);
    formData.append("pricePerHour", this.selectedCar.pricePerHour || 0);
    formData.append("pricePerDay", this.selectedCar.pricePerDay);
    formData.append("pricePerWeek", this.selectedCar.pricePerWeek || 0);
    formData.append("insurancePlanId", this.selectedCar.insuranceId);

    this.carService.update(this.selectedCar.id, formData)
      .subscribe(() => {
        alert("Car updated successfully");
        this.showEditModal = false;
        this.loadCars();
      });
  }

  // ===================== BOOKING =====================
  openBookingPopup(car: any) {
    this.selectedCarForBooking = car;
    this.booking = {
      carId: car.id,
      startDate: '',
      endDate: '',
      location: '',
      price: 0
    };
    this.showBookingModal = true;
  }

  calculatePrice() {
    if (!this.booking.startDate || !this.booking.endDate) return;
    const start = new Date(this.booking.startDate);
    const end = new Date(this.booking.endDate);
    const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    if (days > 0) {
      this.booking.price = days * this.selectedCarForBooking.pricePerDay;
    } else {
      this.booking.price = 0;
    }
  }

  confirmBooking() {
    // Validate fields
    if (!this.booking.startDate || !this.booking.endDate || !this.booking.location) {
      alert("Please fill all fields");
      return;
    }

    // Get logged-in user's ID from Keycloak claims
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims || !claims.sub) {
      alert("User not logged in!");
      return;
    }
    const userId = claims.sub;

    // Prepare payload
    const payload = {
      carId: this.booking.carId,
      startDate: new Date(this.booking.startDate + 'T00:00:00Z').toISOString(),
      endDate: new Date(this.booking.endDate + 'T00:00:00Z').toISOString(),
      location: this.booking.location,
      totalPrice: this.booking.price,
      UserId: userId
    };

    // Send booking request
    this.carService.createBooking(payload)
      .subscribe({
        next: () => {
          alert("Booking Successful");
          this.showBookingModal = false;
          this.loadCars(); // optional, reload if needed
        },
        error: (err) => {
          console.error("Booking failed:", err.error);
          alert("Booking failed: " + JSON.stringify(err.error));
        }
      });
  }

  deleteCar(id: number) {
    if (confirm('Are you sure you want to delete this car?')) {
      this.carService.delete(id).subscribe(() => this.loadCars());
    }
  }
}