import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RouteService } from '@services/route.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-project-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './project-sidebar.component.html',
  styleUrls: ['./project-sidebar.component.scss']
})
export class ProjectSidebarComponent {
  sidebarOpen = false;

  constructor(
    public routeService: RouteService,
    private toaster: ToastrService,
    private authService: AuthService, private router: Router
  ) { }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    // Add your logout logic here
    this.authService.logout(); // Call the logout method
    this.router.navigate(['']); // Navigate to the login page or home
    this.toaster.success('Successfully Logout');
    console.log('Logged out');
  }
}
