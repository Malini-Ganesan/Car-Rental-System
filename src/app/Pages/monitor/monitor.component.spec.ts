import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MonitorComponent } from './monitor.component';

describe('MonitorComponent', () => {
  let component: MonitorComponent;
  let fixture: ComponentFixture<MonitorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MonitorComponent],
      imports: [HttpClientTestingModule] // ✅ FIX: provides HttpClient for testing
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no unexpected pending HTTP requests
  });

  it('should create', () => {
    fixture.detectChanges(); // triggers ngOnInit → loadLogs()

    const req = httpMock.expectOne(`${component.apiUrl}/log`);
    expect(req.request.method).toBe('GET');
    req.flush([]); // flush with empty array to satisfy the subscription

    expect(component).toBeTruthy();
  });

  it('should load logs on init', () => {
    const mockLogs = [
      { id: 1, message: 'Car booked', timestamp: '2024-01-01' },
      { id: 2, message: 'Car returned', timestamp: '2024-01-02' }
    ];

    fixture.detectChanges(); // triggers ngOnInit

    const req = httpMock.expectOne(`${component.apiUrl}/log`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLogs);

    expect(component.logs).toEqual(mockLogs);
    expect(component.logs.length).toBe(2);
  });

  it('should clear interval on destroy', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/log`);
    req.flush([]);

    spyOn(window, 'clearInterval');
    component.intervalId = 99; // simulate an active interval

    component.ngOnDestroy();

    expect(clearInterval).toHaveBeenCalledWith(99);
  });
});