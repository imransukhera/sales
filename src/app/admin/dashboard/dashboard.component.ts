import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirestoreService } from '@services/firestore.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  recentImports: any[] = [];
  recentExports: any[] = [];
  nocPending: any[] = [];

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.firestoreService.getAllAppointments().subscribe({
      next: (data: any[]) => {
        const sorted = [...data].sort((a, b) => {
          return new Date(b.dateOfImport || 0).getTime() - new Date(a.dateOfImport || 0).getTime();
        });
        this.recentImports = sorted.slice(0, 5);
        this.nocPending = data
          .filter(item => item.type === 'Machinery Parts' && (item.status || 'Pending') === 'Pending')
          .slice(0, 5);
      }
    });

    this.firestoreService.getExports().subscribe({
      next: (data: any[]) => {
        const sorted = [...data].sort((a, b) => {
          return new Date(b.dateOfExport || 0).getTime() - new Date(a.dateOfExport || 0).getTime();
        });
        this.recentExports = sorted.slice(0, 5);
      }
    });
  }
}
