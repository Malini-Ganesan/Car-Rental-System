import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { DashboardRefreshService } from 'src/app/core/services/dashboard-refresh.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent implements OnInit {

  apiUrl = environment.apiUrl;

  totalCars: number = 0;
  totalBookings: number = 0;
  carNames: string[] = [];
  bookingCounts: number[] = [];

  chart: Chart | null = null;

  constructor(
    private http: HttpClient,
    private refreshService: DashboardRefreshService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();

    this.refreshService.refresh$.subscribe(() => {
      this.loadDashboard();
    });
  }

  loadDashboard() {
    this.http.get<any>(`${this.apiUrl}/Dashboard/summary`)
      .subscribe(res => {

        this.totalCars = res.totalCars;
        this.totalBookings = res.totalBookings;

        this.carNames = res.bookingsPerCar.map((c: any) => c.name);
        this.bookingCounts = res.bookingsPerCar.map((c: any) => c.bookingCount);

        setTimeout(() => this.loadChart());
      });
  }

  loadChart() {
    const canvas = document.getElementById('bookingChart') as HTMLCanvasElement;

    // ✅ FIX: prevents null error in tests
    if (!canvas) return;

    // destroy old chart
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.carNames,
        datasets: [
          {
            label: 'Bookings per Car',
            data: this.bookingCounts
          }
        ]
      }
    });
  }
}