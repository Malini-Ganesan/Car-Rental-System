import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../../core/services/car.service';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.component.html',
  styleUrls: ['./car-edit.component.css']
})
export class CarEditComponent implements OnInit {
  carId!: number;
  file?: File;
  categories: any[] = [];       // fetch from API
  insurancePlans: any[] = [];   // fetch from API

  carForm = this.fb.group({
    name: ['', Validators.required],
    categoryId: [0, Validators.required],
    pricePerHour: [0, Validators.required],
    pricePerDay: [0, Validators.required],
    pricePerWeek: [0, Validators.required],
    insurancePlanId: [0, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carId = +this.route.snapshot.paramMap.get('id')!;
    this.carService.getById(this.carId).subscribe(car => {
      this.carForm.patchValue({
        name: car.name,
        categoryId: car.categoryId,
        pricePerHour: car.pricePerHour,
        pricePerDay: car.pricePerDay,
        pricePerWeek: car.pricePerWeek,
        insurancePlanId: car.insurancePlanId
      });
    });
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

  submit() {
  const formData = new FormData();

  // Type-safe manual append
  formData.append('name', this.carForm.value.name!);
  formData.append('categoryId', this.carForm.value.categoryId!.toString());
  formData.append('pricePerHour', this.carForm.value.pricePerHour!.toString());
  formData.append('pricePerDay', this.carForm.value.pricePerDay!.toString());
  formData.append('pricePerWeek', this.carForm.value.pricePerWeek!.toString());
  formData.append('insurancePlanId', this.carForm.value.insurancePlanId!.toString());

  if (this.file) formData.append('image', this.file);

  this.carService.update(this.carId, formData).subscribe(() => {
    alert('Car updated successfully!');
    this.router.navigate(['/dashboard/car-list']);
  });
}
  
}