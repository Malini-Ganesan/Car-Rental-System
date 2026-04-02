import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardOverviewComponent } from './dashboard-overview.component';
import { DashboardRefreshService } from 'src/app/core/services/dashboard-refresh.service';

describe('DashboardOverviewComponent', () => {
  let component: DashboardOverviewComponent;
  let fixture: ComponentFixture<DashboardOverviewComponent>;
  let httpMock: HttpTestingController;
  let refreshService: DashboardRefreshService;

  // ✅ FIX: The component calls `new Chart("bookingChart", ...)` which looks for
  // a real <canvas> element. In jsdom (the test environment) canvas has no 2D context,
  // causing Chart.js to throw and break beforeAll/beforeEach.
  //
  // Solution: stub getContext on HTMLCanvasElement BEFORE any test runs so Chart.js
  // gets a fake context and constructs silently. No need to patch chart.js/auto at all.
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = jasmine.createSpy('getContext').and.returnValue({
      // Minimal CanvasRenderingContext2D surface Chart.js needs
      canvas: { width: 300, height: 150 },
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      rect: () => {},
      save: () => {},
      restore: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      transform: () => {},
      setTransform: () => {},
      drawImage: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} } as any),
      createRadialGradient: () => ({ addColorStop: () => {} } as any),
      createPattern: () => null,
      measureText: () => ({ width: 0 } as any),
      fillText: () => {},
      strokeText: () => {},
      setLineDash: () => {},
      getLineDash: () => [],
      isPointInPath: () => false,
      clip: () => {},
    } as any);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardOverviewComponent],
      imports: [HttpClientTestingModule],
      providers: [DashboardRefreshService]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOverviewComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    refreshService = TestBed.inject(DashboardRefreshService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── Basic creation ────────────────────────────────────────────────────────

  it('should create component', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/Dashboard/summary`);
    req.flush({ totalCars: 0, totalBookings: 0, bookingsPerCar: [] });

    expect(component).toBeTruthy();
  });

  // ── Load dashboard data ───────────────────────────────────────────────────

  it('should load dashboard data and update values', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/Dashboard/summary`);
    expect(req.request.method).toBe('GET');
    req.flush({
      totalCars: 5,
      totalBookings: 10,
      bookingsPerCar: [
        { name: 'BMW',  bookingCount: 3 },
        { name: 'Audi', bookingCount: 7 }
      ]
    });

    tick(); // flush the setTimeout(() => loadChart()) inside loadDashboard

    expect(component.totalCars).toBe(5);
    expect(component.totalBookings).toBe(10);
    expect(component.carNames).toEqual(['BMW', 'Audi']);
    expect(component.bookingCounts).toEqual([3, 7]);
  }));

  // ── loadChart is called after data loads ──────────────────────────────────

  it('should call loadChart after data load', fakeAsync(() => {
    spyOn(component, 'loadChart');

    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/Dashboard/summary`);
    req.flush({
      totalCars: 1,
      totalBookings: 1,
      bookingsPerCar: [{ name: 'Car1', bookingCount: 1 }]
    });

    tick();

    expect(component.loadChart).toHaveBeenCalled();
  }));

  // ── Refresh triggers a new API call ──────────────────────────────────────

  it('should reload dashboard when refresh is triggered', fakeAsync(() => {
    fixture.detectChanges();

    const req1 = httpMock.expectOne(`${component.apiUrl}/Dashboard/summary`);
    req1.flush({ totalCars: 1, totalBookings: 1, bookingsPerCar: [] });
    tick();

    refreshService.triggerRefresh();

    const req2 = httpMock.expectOne(`${component.apiUrl}/Dashboard/summary`);
    req2.flush({ totalCars: 2, totalBookings: 3, bookingsPerCar: [] });
    tick();

    expect(component.totalCars).toBe(2);
    expect(component.totalBookings).toBe(3);
  }));

  // ── Chart.destroy() called before creating a new instance ─────────────────

  it('should destroy existing chart before creating new one', () => {
    const mockChart = { destroy: jasmine.createSpy('destroy') } as any;
    component.chart = mockChart;
    component.carNames = ['BMW'];
    component.bookingCounts = [2];

    component.loadChart();

    expect(mockChart.destroy).toHaveBeenCalled();
  });

});