import { Component , OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { DashboardRefreshService } from 'src/app/core/services/dashboard-refresh.service';

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent implements OnInit {

  totalCars: number = 0;
  totalBookings: number = 0;
  carNames: string[] = [];
  bookingCounts: number[] = [];

  constructor(private http: HttpClient, private refreshService: DashboardRefreshService) {}

  ngOnInit(): void {
    this.loadDashboard();

    this.refreshService.refresh$.subscribe(() => {
    this.loadDashboard();
  });
  }

  loadDashboard() {
    this.http.get<any>('http://localhost:5020/api/Dashboard/summary')
      .subscribe(res => {
        this.totalCars = res.totalCars;
        this.totalBookings = res.totalBookings;

        this.carNames = res.bookingsPerCar.map((c: any) => c.name);
        this.bookingCounts = res.bookingsPerCar.map((c: any) => c.bookingCount);

        this.loadChart();
      });
  }

  loadChart() {
    new Chart("bookingChart", {
      type: 'bar',
      data: {
        labels: this.carNames,
        datasets: [{
          label: 'Bookings per Car',
          data: this.bookingCounts
        }]
      }
    });
  }
}