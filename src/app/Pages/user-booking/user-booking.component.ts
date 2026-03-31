import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../core/services/booking.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-user-booking',
  templateUrl: './user-booking.component.html',
  styleUrls: ['./user-booking.component.css']
})
export class UserBookingComponent implements OnInit {

  bookings: any[] = [];
  isAdmin: boolean = false;
 currentPage: number = 1;
itemsPerPage: number = 6;
  constructor(
    private bookingService: BookingService,
    private oauthService: OAuthService
  ) { }

  ngOnInit(): void {
    this.checkUserRole();
  }

   checkUserRole() {
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) return;

    const roles = claims.realm_access?.roles || [];
    this.isAdmin = roles.includes('Admin');
    this.loadBookings();
    console.log("Is Admin:", this.isAdmin);
  }

    loadBookings() {
    if (this.isAdmin) {
      this.bookingService.getAllBookings().subscribe(res => {this.bookings = res, this.currentPage = 1;});
    } else {
      this.bookingService.getMyBookings().subscribe(res => {this.bookings = res, this.currentPage = 1;});
    }
    
  }

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





  cancelBooking(booking: any) {

  if (confirm("Are you sure to cancel?")) {

    booking.isCancelling = true;

    this.bookingService.cancelBooking(booking.id).subscribe({
      next: (res: any) => {
        const message =
          typeof res === 'string'
            ? res
            : res?.message || "Booking cancelled successfully";

        alert(message);

        booking.status = "Cancelled";
        booking.isCancelling = false;

        this.loadBookings();
      },

      error: (err) => {
        booking.isCancelling = false;

        const message =
          err.error?.message ||
          err.error ||
          "Cancel failed";

        alert(message);
      }
    });
  }
}
}