import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-car-track',
  templateUrl: './car-track.component.html',
  styleUrls: ['./car-track.component.css']
})
export class CarTrackComponent implements OnInit {

  bookings: any[] = [];
  isAdmin: boolean = false;

  showTrackModal: boolean = false;
  mapUrl!: SafeResourceUrl;

  constructor(
    private bookingService: BookingService,
    private oauthService: OAuthService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.checkUserRole();
    this.loadBookings();
  }

  currentPage: number = 1;
itemsPerPage: number = 6;

get paginatedBookings() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.bookings.slice(start, start + this.itemsPerPage);
}

get totalPages() {
  return Math.ceil(this.bookings.length / this.itemsPerPage);
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

  checkUserRole() {
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) return;

    const roles = claims.realm_access?.roles || [];
    this.isAdmin = roles.includes('Admin');
  }

  loadBookings() {
    if (this.isAdmin) {
      this.bookingService.getAllBookings().subscribe(res => this.bookings = res);
    } else {
      this.bookingService.getMyBookings().subscribe(res => this.bookings = res);
    }
    this.currentPage = 1;
  }

 trackCar(booking: any) {
  const lat = 9.9252;
  const lng = 78.1198;

  // Safe Google Maps embed URL (no user input)
  this.mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  this.showTrackModal = true;
}

closeTrackModal() {
  this.showTrackModal = false;
}
}

