import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RouteService } from '@services/route.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../auth.service';
import { SharedService } from '@services/shared/shared.service';

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
export class ProjectSidebarComponent implements OnInit{
  sidebarOpen = false;
  open = false;

  constructor(
    public routeService: RouteService,
    private toaster: ToastrService,
    private authService: AuthService, private router: Router,
    private shared: SharedService
  ) { }

ngOnInit(): void {
  this.shared.sidebarState$.subscribe((state) => {
    this.open = state;
  });
}

sidemenu(){
  this.open = false;
}

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
