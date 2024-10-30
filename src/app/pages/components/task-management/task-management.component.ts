import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardComponent } from "../dashboard/dashboard/dashboard.component";
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.scss'
})
export class TaskManagementComponent {
  loading: boolean = false;

}
