import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit, OnDestroy {

  logs: any[] = [];
  intervalId: any;

  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLogs();
    // this.intervalId = setInterval(() => {
    //   this.loadLogs();
    // }, 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  loadLogs() {
    this.http.get<any[]>(`${this.apiUrl}/log`)
      .subscribe(res => {
        this.logs = res;
      });
  }
}