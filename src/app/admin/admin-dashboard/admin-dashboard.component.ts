import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet,SidebarModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {

   menuActive = false;
  sidebarVisible2: boolean = false;
  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  profileData: any;
  locathostData: any;
  pdfdownload: any;

  constructor(private router: Router) {}


  ngOnInit() {
    this.locathostData = localStorage.getItem('userProfile');
    this.profileData = JSON.parse(this.locathostData);
  }
  changeValue() {
    this.pdfdownload = "imran"
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  value() {
    localStorage.clear();
    this.router.navigate(['/admin/imports']);
  }
  value1() {
    localStorage.clear();
    this.router.navigate(['/admin/exports']);
  }
   value2() {
    localStorage.clear();
    this.router.navigate(['/admin/dashboard']);
  }

}
