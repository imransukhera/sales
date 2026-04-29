import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirestoreService } from '@services/firestore.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  recentImports: any[] = [];
  recentExports: any[] = [];
  nocPending: any[] = [];

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.firestoreService.getAllAppointments().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any[]) => {
        const sorted = [...data].sort((a, b) =>
          new Date(b.dateOfImport || 0).getTime() - new Date(a.dateOfImport || 0).getTime()
        );
        this.recentImports = sorted.slice(0, 5);
        this.nocPending = data
          .filter(item => item.type === 'Parts & Spares' && (!item.status || item.status === 'Pending'))
          .slice(0, 5);
      }
    });

    this.firestoreService.getExports().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any[]) => {
        const sorted = [...data].sort((a, b) =>
          new Date(b.dateOfExport || 0).getTime() - new Date(a.dateOfExport || 0).getTime()
        );
        this.recentExports = sorted.slice(0, 5);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
