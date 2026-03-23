import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CarListComponent } from './Pages/car/car-list/car-list.component';
import { CarCreateComponent } from './Pages/car/car-create/car-create.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { UserBookingComponent } from './Pages/user-booking/user-booking.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LandingComponent } from './Pages/landing/landing.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: ['Admin', 'User'] },
    children: [
      { 
        path: 'car-list', 
        component: CarListComponent, 
        canActivate: [AuthGuard],
        data: { roles: ['User', 'Admin'] } 
      },
      { 
        path: 'car-create', 
        component: CarCreateComponent, 
        data: { roles: ['Admin'] } 
      },
      {
        path: 'user-booking', 
        component: UserBookingComponent, 
        data: { roles: ['User'] } 
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    initialNavigation: 'disabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { } 
