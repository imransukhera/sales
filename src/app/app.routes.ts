import { Routes } from '@angular/router';
import { LoginComponent } from './admin/login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './auth.guard';
import { AppointmentsComponent } from './admin/appointments/appointments.component';
import { ContactDataComponent } from './admin/contact-data/contact-data.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'contact-us-data', component: ContactDataComponent },
      // { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'appointments', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

