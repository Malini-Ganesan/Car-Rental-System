import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CarService } from '../../../core/services/car.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { DashboardRefreshService } from 'src/app/core/services/dashboard-refresh.service';

@Component({
  selector: 'app-car-create',
  templateUrl: './car-create.component.html',
  styleUrls: ['./car-create.component.css']
})
export class CarCreateComponent implements OnInit {

  categories: any[] = [];
  insurancePlans: any[] = [];
  file?: File;

  carForm = this.fb.group({
    name: ['', Validators.required],
    categoryId: ['', Validators.required],
    pricePerHour: [0, Validators.required],
    pricePerDay: [0, Validators.required],
    pricePerWeek: [0, Validators.required],
    insurancePlanId: ['', Validators.required]
  });

  // Inject OAuthService here directly
  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private oauthService: OAuthService,
    private refreshService: DashboardRefreshService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadInsurancePlans();
  }

  loadCategories() {
    this.carService.getCategories().subscribe({
      next: (data) => { this.categories = data; },
      error: (err) => { console.error('Error loading categories', err); }
    });
  }

  loadInsurancePlans() {
    this.carService.getInsurancePlans().subscribe({
      next: (data) => { this.insurancePlans = data; },
      error: (err) => { console.error('Error loading insurance plans', err); }
    });
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

submit() {

  const token = this.oauthService.getAccessToken();
  console.log("TOKEN:", token);

  if (!token) {
    alert("User not authenticated!");
    return;
  }

  if (this.carForm.invalid) {
    alert('Please fill all required fields');
    return;
  }

  const formData = new FormData();
  formData.append('name', this.carForm.value.name!);
  formData.append('categoryId', this.carForm.value.categoryId!.toString());
  formData.append('pricePerHour', this.carForm.value.pricePerHour!.toString());
  formData.append('pricePerDay', this.carForm.value.pricePerDay!.toString());
  formData.append('pricePerWeek', this.carForm.value.pricePerWeek!.toString());
  formData.append('insurancePlanId', this.carForm.value.insurancePlanId!.toString());

  if (this.file) {
    formData.append('image', this.file);
  }

  this.carService.create(formData).subscribe({
    next: () => {
      alert('Car added successfully!');
      this.refreshService.triggerRefresh();
      this.carForm.reset();
    },
    error: (err) => {
      console.error('Error creating car', err);
    }
  });
}
}