import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navigation, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HomePageComponent } from "../../home-page/home-page.component";

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    HomePageComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit {
  open = false;

  constructor(private router: Router) { }

  // Method to check if the current route is "dashboard"
  isDashboardRoute(): boolean {
    return this.router.url === '/dashboard';
  }

  // Method to check if the current route is "checking-time"
  isCheckingDetailRoute(): boolean {
    return this.router.url === '/checking-detail';
  }

  ngOnInit(): void {

  }

}