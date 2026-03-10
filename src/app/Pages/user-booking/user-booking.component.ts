import { Component, OnInit } from '@angular/core';
import { CarService } from '../../core/services/car.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-user-booking',
  templateUrl: './user-booking.component.html',
  styleUrls: ['./user-booking.component.css']
})
export class UserBookingComponent implements OnInit {

  cars: any[] = [];
  selectedCarId!: number;
  startDate!: string;
  endDate!: string;
  totalPrice: number = 0;

  constructor(
    private carService: CarService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars() {
    this.carService.getAll().subscribe(res => {
      this.cars = res;
    });
  }

  calculatePrice() {
    const car = this.cars.find(c => c.id == this.selectedCarId);
    if (!car || !this.startDate || !this.endDate) return;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (days > 0) {
      this.totalPrice = days * car.pricePerDay;
    }
  }

  book() {

    if (!this.selectedCarId || !this.startDate || !this.endDate) {
      alert("Please fill all fields");
      return;
    }

    const booking = {
      carId: this.selectedCarId,
      startDate: this.startDate,
      endDate: this.endDate,
      totalPrice: this.totalPrice
    };

    this.bookingService.create(booking).subscribe({
      next: () => {
        alert("Booking successful!");
        this.selectedCarId = 0;
        this.startDate = '';
        this.endDate = '';
        this.totalPrice = 0;
      },
      error: err => {
        alert(err.error);
      }
    });
  }
}