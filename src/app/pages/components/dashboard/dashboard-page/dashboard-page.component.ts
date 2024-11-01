import { CommonModule } from '@angular/common';
import { Component, Injectable, OnInit } from '@angular/core';
import { DashboardComponent } from "../dashboard/dashboard.component";
import { ProgressBarModule } from 'primeng/progressbar';
import { TimeLogsSheetComponent } from '../time-logs-sheet/time-logs-sheet.component';
import { SharedService } from '@services/shared/shared.service';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ProgressBarModule, TimeLogsSheetComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent implements OnInit {
  timelog: any
  // dailyTotalHorse: any;
  // dailyTotalHorse = this.shared.getDailyTotalHorse();

  

  constructor(private shared: SharedService) {

  }

  ngOnInit() {
   
  }
  

}
