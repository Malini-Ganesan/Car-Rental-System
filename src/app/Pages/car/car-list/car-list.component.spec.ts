import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarListComponent } from './car-list.component';
import { CommonModule } from '@angular/common'; // Fixes 'currency' pipe error in tests
import { RouterTestingModule } from '@angular/router/testing'; // Fixes 'routerLink' error in tests
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Prevents CarService provider errors
import { CarService } from '../../../core/services/car.service';
import { of } from 'rxjs';

describe('CarListComponent', () => {
  let component: CarListComponent;
  let fixture: ComponentFixture<CarListComponent>;
  let carService: CarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarListComponent ],
      imports: [ 
        CommonModule, 
        RouterTestingModule, 
        HttpClientTestingModule 
      ],
      providers: [ CarService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarListComponent);
    component = fixture.componentInstance;
    carService = TestBed.inject(CarService);
    
    // Mock the getAll call to prevent null errors during initialization
    spyOn(carService, 'getAll').and.returnValue(of([]));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});