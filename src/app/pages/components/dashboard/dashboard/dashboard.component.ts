import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NpsProgressbarComponent } from '../gadgets/nps-progressbar/nps-progressbar.component';
import { NpsStatisticsComponent } from '../gadgets/nps-statistics/nps-statistics.component';
import { TeamStatisticsComponent } from '../gadgets/team-statistics/team-statistics.component';
import { SharedService } from '@services/shared/shared.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NpsProgressbarComponent,
    NpsStatisticsComponent,
    TeamStatisticsComponent,
],

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit { 

  profileData: any;

  constructor( private shared: SharedService ){}

ngOnInit(): void {
   const userProfile = localStorage.getItem('userProfile');
   if (userProfile) {
    const parsedProfile = JSON.parse(userProfile); // Parse the JSON string
    this.profileData = parsedProfile; // Access the name property
  }
}

toggleSidebar(){
  this.shared.toggleSidebar();
}

}