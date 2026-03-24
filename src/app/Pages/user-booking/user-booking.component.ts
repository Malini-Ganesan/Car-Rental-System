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

  constructor(
    private bookingService: BookingService,
    private oauthService: OAuthService
  ) { }

  ngOnInit(): void {
    this.checkUserRole();
    this.loadBookings();
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