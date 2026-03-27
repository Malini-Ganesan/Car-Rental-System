import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit, OnDestroy {

  logs: any[] = [];
  intervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLogs();

    // // 🔥 Auto refresh every 3 seconds
    // this.intervalId = setInterval(() => {
    //   this.loadLogs();
    // }, 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  loadLogs() {
    this.http.get<any[]>('http://localhost:5020/api/log')
      .subscribe(res => {
        this.logs = res;
      });
  }
}