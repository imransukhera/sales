import { Component, OnInit } from '@angular/core';
import { ProjectSidebarComponent } from '../../project-sidebar/project-sidebar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HeaderComponent } from '../../public/header/header.component';
import { CheckingDetailComponent } from "../checking-detail/checking-detail.component";
import { CommonModule } from '@angular/common';
import { Navigation, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RouteService } from '@services/route.service';
import { TimeLogsSheetComponent } from "../time-logs-sheet/time-logs-sheet.component";
import { SharedService } from '@services/shared/shared.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    ProjectSidebarComponent,
    DashboardComponent,
    HeaderComponent,
    CheckingDetailComponent,
    TimeLogsSheetComponent,
    RouterOutlet
],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit { 
  open = false;

  constructor(private router: Router,  private shared: SharedService) {}

  // Method to check if the current route is "dashboard"
  isDashboardRoute(): boolean {
    return this.router.url === '/dashboard';
  }

  // Method to check if the current route is "checking-time"
  isCheckingDetailRoute(): boolean {
    return this.router.url === '/checking-detail';
  }

  ngOnInit(): void {
    this.shared.sidebarState$.subscribe((state) => {
      this.open = state;
    });
        // Check if the page has already been reloaded once
if (!sessionStorage.getItem("reloadedAfterLogin")) {
  // Perform the reload
  window.location.reload();
  // Set a flag in sessionStorage to prevent further reloads
  sessionStorage.setItem("reloadedAfterLogin", "true");
}
  }

  sidemenu(){
    this.shared.toggleSidebar();
  }
}