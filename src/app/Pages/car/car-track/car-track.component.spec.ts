import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarTrackComponent } from './car-track.component';

describe('CarTrackComponent', () => {
  let component: CarTrackComponent;
  let fixture: ComponentFixture<CarTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarTrackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
