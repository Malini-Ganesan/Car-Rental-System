import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarCreateComponent } from './car-create.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CarService } from '../../../core/services/car.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { DashboardRefreshService } from 'src/app/core/services/dashboard-refresh.service';
import { of, throwError } from 'rxjs';

describe('CarCreateComponent', () => {
  let component: CarCreateComponent;
  let fixture: ComponentFixture<CarCreateComponent>;
  let carServiceSpy: jasmine.SpyObj<CarService>;
  let oauthServiceSpy: jasmine.SpyObj<OAuthService>;
  let refreshServiceSpy: jasmine.SpyObj<DashboardRefreshService>;

  beforeEach(async () => {
    carServiceSpy = jasmine.createSpyObj('CarService', [
      'getCategories',
      'getInsurancePlans',
      'create'
    ]);

    oauthServiceSpy = jasmine.createSpyObj('OAuthService', ['getAccessToken']);
    refreshServiceSpy = jasmine.createSpyObj('DashboardRefreshService', ['triggerRefresh']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CarCreateComponent],
      providers: [
        FormBuilder,
        { provide: CarService, useValue: carServiceSpy },
        { provide: OAuthService, useValue: oauthServiceSpy },
        { provide: DashboardRefreshService, useValue: refreshServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarCreateComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    carServiceSpy.getCategories.and.returnValue(of([{ id: 1, name: 'SUV' }]));
    carServiceSpy.getInsurancePlans.and.returnValue(of([{ id: 1, name: 'Basic' }]));

    fixture.detectChanges(); // triggers ngOnInit
  });

  // ✅ Basic
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ✅ ngOnInit calls APIs
  it('should load categories and insurance plans on init', () => {
    expect(carServiceSpy.getCategories).toHaveBeenCalled();
    expect(carServiceSpy.getInsurancePlans).toHaveBeenCalled();
    expect(component.categories.length).toBe(1);
    expect(component.insurancePlans.length).toBe(1);
  });

  // ✅ File upload
  it('should set file on file change', () => {
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const event = { target: { files: [mockFile] } };

    component.onFileChange(event);

    expect(component.file).toBe(mockFile);
  });

  // ❌ No token case
  it('should not submit if token is missing', () => {
    spyOn(window, 'alert');
    oauthServiceSpy.getAccessToken.and.returnValue(null as any);

    component.submit();

    expect(window.alert).toHaveBeenCalledWith('User not authenticated!');
    expect(carServiceSpy.create).not.toHaveBeenCalled();
  });

  // ❌ Invalid form
  it('should not submit if form is invalid', () => {
    spyOn(window, 'alert');
    oauthServiceSpy.getAccessToken.and.returnValue('token');

    component.submit();

    expect(window.alert).toHaveBeenCalledWith('Please fill all required fields');
    expect(carServiceSpy.create).not.toHaveBeenCalled();
  });

  // ✅ Successful submit
  it('should submit form successfully', () => {
    spyOn(window, 'alert');

    oauthServiceSpy.getAccessToken.and.returnValue('token');

    component.carForm.setValue({
      name: 'BMW',
      categoryId: '1',
      pricePerHour: 10,
      pricePerDay: 100,
      pricePerWeek: 500,
      insurancePlanId: '1'
    });

    carServiceSpy.create.and.returnValue(of({}));

    component.submit();

    expect(carServiceSpy.create).toHaveBeenCalled();
    expect(refreshServiceSpy.triggerRefresh).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Car added successfully!');
  });

  // ❌ API error case
  it('should handle error on submit', () => {
    spyOn(console, 'error');

    oauthServiceSpy.getAccessToken.and.returnValue('token');

    component.carForm.setValue({
      name: 'BMW',
      categoryId: '1',
      pricePerHour: 10,
      pricePerDay: 100,
      pricePerWeek: 500,
      insurancePlanId: '1'
    });

    carServiceSpy.create.and.returnValue(throwError(() => new Error('API error')));

    component.submit();

    expect(console.error).toHaveBeenCalled();
  });

  // ✅ Form reset after success
  it('should reset form after successful submit', () => {
    oauthServiceSpy.getAccessToken.and.returnValue('token');

    component.carForm.setValue({
      name: 'Audi',
      categoryId: '1',
      pricePerHour: 20,
      pricePerDay: 200,
      pricePerWeek: 800,
      insurancePlanId: '1'
    });

    carServiceSpy.create.and.returnValue(of({}));

    component.submit();

    expect(component.carForm.value.name).toBeNull();
  });

});