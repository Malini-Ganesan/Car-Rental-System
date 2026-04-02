import { Component, OnInit } from '@angular/core';
import { CarService } from '../../../core/services/car.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { DashboardRefreshService } from 'src/app/core/services/dashboard-refresh.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit {

  apiUrl = environment.apiUrl;
  cars: any[] = [];
  showEditModal = false;
  selectedCar: any = {};

  categories: any[] = [];
  insurances: any[] = [];

  isAdmin: boolean = false;
  isUser: boolean = false;

  booking: any = {
    carId: '',
    type: 'hour',
    hours: null,
    location: '',
    startDate: '',
    endDate: '',
    basePrice: 0,
    insurancePrice: 0,
    price: 0
  };

  showBookingModal: boolean = false;
  selectedCarForBooking: any = null;

  constructor(private carService: CarService,
    private oauthService: OAuthService,
    private refreshService: DashboardRefreshService) { }

  ngOnInit(): void {
    this.loadCars();
    this.loadCategories();
    this.loadInsurances();
    this.checkUserRole();
  }
  //pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;

  get paginatedCars() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.cars.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.cars.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ===================== LOAD DATA =====================
  loadCars() {
    this.carService.getAll().subscribe(res => this.cars = res);
    this.currentPage = 1;
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

    if (
      !this.selectedCar.name ||
      !this.selectedCar.categoryId ||
      !this.selectedCar.pricePerHour ||
      !this.selectedCar.pricePerDay ||
      !this.selectedCar.pricePerWeek ||
      !this.selectedCar.insuranceId
    ) {
      alert("Please fill all required fields");
      return;
    }

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
      type: 'hour',
      hours: null,
      startDate: '',
      endDate: '',
      location: '',
      basePrice: 0,
      insurancePrice: 0,
      price: 0
    };
    this.showBookingModal = true;
  }
  onTypeChange() {
    this.booking.price = 0;

    if (this.booking.type === 'hour') {
      this.booking.startDate = '';
      this.booking.endDate = '';
    } else {
      this.booking.hours = null;
    }
  }

  //======================Calculate Price=================
calculatePrice() {
  const car = this.selectedCarForBooking;
  if (!car) return;

  // ✅ HOUR booking → no API call
  if (this.booking.type === 'hour') {
    this.calculateHourlyPrice(car);
    return;
  }

  // ❗ For day/week → validate dates first
  if (!this.booking.startDate || !this.booking.endDate) {
    this.booking.price = 0;
    return;
  }

  // ✅ Call API FIRST
  this.carService
    .checkAvailability(
      this.booking.carId,
      this.booking.startDate,
      this.booking.endDate
    )
    .subscribe(res => {

      if (res.isBooked) {
        alert("Car already booked for selected dates");
        this.booking.price = 0;
        return; // 🚫 STOP — do NOT calculate price
      }

      // ✅ ONLY calculate if available
      this.calculateDatePrice(car);
    });
}


  calculateHourlyPrice(car: any) {
    const hours = Number(this.booking.hours);

    if (!hours || hours <= 0) {
      this.booking.price = 0;
      return;
    }

    const basePrice = hours * Number(car.pricePerHour);

    this.booking.price = basePrice;
  }

  calculateDatePrice(car: any) {
    if (!this.booking.startDate || !this.booking.endDate) {
      this.booking.price = 0;
      return;
    }

    const start = new Date(this.booking.startDate);
    const end = new Date(this.booking.endDate);

    const diffDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    if (diffDays <= 0) {
      this.booking.price = 0;
      return;
    }

    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    const basePrice =
      weeks * Number(car.pricePerWeek) +
      remainingDays * Number(car.pricePerDay);

    const insurance = diffDays * Number(car.insuranceCost);

    this.booking.price = basePrice + insurance;
  }
  confirmBooking() {

    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims || !claims.sub) {
      alert("User not logged in!");
      return;
    }

    if (!this.booking.location) {
      alert("Enter location");
      return;
    }

    let startDate: string;
    let endDate: string;

    // HOUR BOOKING
    if (this.booking.type === 'hour') {

      if (!this.booking.hours || this.booking.hours <= 0) {
        alert("Enter valid hours");
        return;
      }

      const today = new Date();
      startDate = today.toISOString();
      endDate = today.toISOString();
    }

    // DAY / WEEK BOOKING
    else {

      if (!this.booking.startDate || !this.booking.endDate) {
        alert("Select start and end date");
        return;
      }

      startDate = new Date(this.booking.startDate).toISOString();
      endDate = new Date(this.booking.endDate).toISOString();
    }

    const payload = {
      carId: this.booking.carId,
      startDate: startDate,
      endDate: endDate,
      location: this.booking.location,
      totalPrice: this.booking.price
    };

    console.log("Payload:", payload);

    this.carService.createBooking(payload).subscribe({
      next: () => {
        alert("Booking Successful");
        this.refreshService.triggerRefresh();
        this.showBookingModal = false;
        this.loadCars();
      },
      error: (err) => {
        console.error(err);

        let message = "Booking failed";

        if (typeof err.error === 'string') {
          message = err.error;
        } else if (err.error?.message) {
          message = err.error.message;
        }

        alert(message);
      }
    });
  }

  deleteCar(id: number) {
    if (confirm('Are you sure you want to delete this car?')) {
      this.carService.delete(id).subscribe(() => this.loadCars());
    }
  }
}