import { Component, OnInit } from '@angular/core';
import { CarService } from '../../../core/services/car.service';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit {
  apiUrl = 'http://localhost:5020';
  cars: any[] = [];

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars() {
    this.carService.getAll().subscribe(res => {
      this.cars = res;
    });
  }

  deleteCar(id: number) {
    if (confirm('Are you sure you want to delete this car?')) {
      this.carService.delete(id).subscribe(() => this.loadCars());
    }
  }
}