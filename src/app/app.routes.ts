import { Routes } from '@angular/router';
import { LoginComponent } from './admin/login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './auth.guard';
import { AppointmentsComponent } from './admin/appointments/appointments.component';
import { ContactDataComponent } from './admin/contact-data/contact-data.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'imports', component: AppointmentsComponent },
      { path: 'exports', component: ContactDataComponent },
      { path: 'dashboard', component: DashboardComponent },
      // { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

