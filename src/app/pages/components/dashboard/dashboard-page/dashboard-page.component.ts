import { CommonModule } from '@angular/common';
import { Component, Injectable, OnInit } from '@angular/core';
import { DashboardComponent } from "../dashboard/dashboard.component";
import { ProgressBarModule } from 'primeng/progressbar';
import { TimeLogsSheetComponent } from '../time-logs-sheet/time-logs-sheet.component';
import { SharedService } from '@services/shared/shared.service';
import { FirestoreService } from '@services/firestore.service';
import { range } from 'rxjs';
import { push } from 'firebase/database';
import { ChartModule } from 'primeng/chart';
import { AnylogClockComponent } from "./compound/anylog-clock/anylog-clock.component";



@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    ProgressBarModule,
    TimeLogsSheetComponent,
    ChartModule,
    AnylogClockComponent
],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent implements OnInit  {
  loading: boolean = true;
  timelog: any
  username: any;
  date= new Date().toDateString(); 
  timezone : any;
  data: any;
  MonthlyHours: any;
  totalMonthlyValue: any;
  WeeklyHours: any;
  totalWeeklyValue: any;
  TodayHours: any;
  totaltodayValue: any;
  timedata: any;
  ontime: any ;
  ontimecount: any;
  middletime: any;
  middletimecount: any;
  aftertimecount: any;
  userdataleave: any;
  leavedata: any;
  totalleave: any;
  leavesstatus : any;
  livetime: any;
  timer: any;
  timechartdata: any;
  timechartoptions: any;
  leavechartdata: any;
  leavechartoptions: any;

  constructor(private firestoreService: FirestoreService ) {
    
const date = new Date();
    const dateString = date.toString();
    this.timezone = dateString.match(/GMT[+-]\d{4}/)?.[0] || 'Timezone not found';
  }

  ngOnInit() {
    this.getusername();
    this.getlogstime();
    this.checkintimedata();
   this.getuserleave();
   this.timer = setInterval(() => {
    this.timelive();
  }, 1000);

  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer); 
    }
  }

  timechart(ontime: any, alowtimecount: any, aftertimecount:any){
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
   

    this.timechartdata = {
        labels: ['On Time', 'Allow Time', 'Late'],
        datasets: [
            {
                data: [ontime, alowtimecount, aftertimecount],
                backgroundColor: [documentStyle.getPropertyValue('--green-500'), documentStyle.getPropertyValue('--yellow-500'),  documentStyle.getPropertyValue('--red-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--green-400'), documentStyle.getPropertyValue('--yellow-400'), documentStyle.getPropertyValue('--red-400')]
            }
        ]
    };
    this.timechartoptions = {
      plugins: {
          legend: {
              labels: {
                usePointStyle: true,
                color: textColor
              }
          }
      }
  };

  }

  leaveschart(totalleave: any, Remainings: any){
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
   
console.log('apply leaves chart ', Remainings , 'totle', totalleave)
    this.leavechartdata = {
        labels: ['Compensatory Leave', 'Total Leaves'],
        datasets: [
            {
                data: [Remainings, totalleave],
                backgroundColor: [documentStyle.getPropertyValue('--green-500'), documentStyle.getPropertyValue('--blue-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--green-400'), documentStyle.getPropertyValue('--blue-400')]
            }
        ]
    };
    this.leavechartoptions = {
      cutout: '40%',
      plugins: {
          legend: {
              labels: {
                usePointStyle: true,
                color: textColor
              }
          }
      }
  };

  }

  getusername(){
  
    const locathostData = localStorage.getItem('userProfile')
    if(locathostData){
      const profileData =  JSON.parse(locathostData);
      this.username = profileData.username
      this.userdataleave = profileData.leaves;
      console.log('username', this.username)
      console.log('leave', this.userdataleave)

    }
  }

  getlogstime(){


    this.firestoreService.getTimelog(this.username).then((data)=>{
      this.data = []
      for (const key in data) {
        if (data[key]?.data) { // Check if `data[key].data` exists
            const dataarray = data[key].data;
            this.data.push(...dataarray); // Push all elements of `dataarray` into `this.data`
        }
        
    }

      this.gethourtimelog()
    })
  }

  gethourtimelog(){
   this.loading = false
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
  };

    const startDate = new Date();
    startDate.setDate(1); 
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); 
    endDate.setDate(0);

    const today = new Date();
    const currentWeekStartDate = new Date(today);
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    const daysToSubtract = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Adjust for Monday as the start
    currentWeekStartDate.setDate(today.getDate() - daysToSubtract);
    const weeklyDatestart = new Date(currentWeekStartDate);
    weeklyDatestart.setDate(currentWeekStartDate.getDate() );
    weeklyDatestart.setHours(0, 0, 0, 0);
    const weeklyDateend = new Date(currentWeekStartDate);
    weeklyDateend.setDate(currentWeekStartDate.getDate() + 5);
    weeklyDateend.setHours(0, 0, 0, 0);
    const Todaydate = new Date();
    Todaydate.setHours(0, 0, 0, 0);



    const start = startDate.toDateString()
    
    console.log('Start of the month:', startDate);
    console.log('Start of the weekly:', weeklyDatestart);
    console.log('End of the weekly:', weeklyDateend);
    console.log('End of the month:', endDate);
    const formattedStartDate = startDate.toLocaleDateString('en-US', options);
    console.log('formmat Start of the month:', formattedStartDate);

    console.log('data', this.data)
    const monthlyhour = this.data.filter((item: any)=>{
      const itemDate = new Date(item.date); 
      return itemDate >= startDate && itemDate <= endDate  ;
    }).map((item: any) => item.spentTame);
    console.log('monthly start date', startDate)
    console.log('monthly hour', monthlyhour)
    this.monthlyhour(monthlyhour)

    const weeklyhour = this.data.filter((item: any)=>{
      const itemDate2 = new Date(item.date); 
      return itemDate2 >= weeklyDatestart && itemDate2 <= weeklyDateend ;
    }).map((item: any) => item.spentTame);
    console.log('weekly hour', weeklyhour)
    this.weeklyhour(weeklyhour)

    const Todayhour = this.data.filter((item: any)=> {
      const itemDate3 = new Date(item.date); 
      return itemDate3 >= Todaydate && itemDate3 <= Todaydate;
    }).map((item: any) => item.spentTame);
    console.log('today hour', Todayhour)
    this.todayhour(Todayhour)


  }


  monthlyhour(data: any){

    let totalHours = 0;
let totalMinutes = 0;
    data.forEach((spenttime: any)=>{
      const hoursMatch = spenttime.match(/(\d+)h/); // Match hours
    const minutesMatch = spenttime.match(/(\d+)m/); // Match minutes

    if (hoursMatch) {
      totalHours += parseInt(hoursMatch[1]);
  }
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
}
    })
    totalHours += Math.floor(totalMinutes / 60);
totalMinutes = totalMinutes % 60; // Keep the remaining minutes

console.log(`monthly Total time: ${totalHours}h ${totalMinutes}m`);
this.MonthlyHours = `${totalHours}h ${totalMinutes}m`

const timeParts = this.MonthlyHours.match(/(\d+h)?\s*(\d+m)?/);
let totalHourpersent = 0;

    if (timeParts) {
      const hours = timeParts[1] ? parseInt(timeParts[1].replace('h', '')) : 0;
      const minutes = timeParts[2] ? parseInt(timeParts[2].replace('m', '')) : 0;
      totalHourpersent = hours + (minutes / 60);
    }

    let value = (totalHourpersent / 160) * 100;
    this.totalMonthlyValue = Math.round(value);


  }
  

  weeklyhour(data: any){
    let totalHours = 0;
let totalMinutes = 0;
    data.forEach((spenttime: any)=>{
      const hoursMatch = spenttime.match(/(\d+)h/); // Match hours
    const minutesMatch = spenttime.match(/(\d+)m/); // Match minutes

    if (hoursMatch) {
      totalHours += parseInt(hoursMatch[1]);
  }
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
}
    })
    totalHours += Math.floor(totalMinutes / 60);
totalMinutes = totalMinutes % 60; // Keep the remaining minutes

console.log(`weekly Total time: ${totalHours}h ${totalMinutes}m`);
this.WeeklyHours = `${totalHours}h ${totalMinutes}m`

const timeParts = this.WeeklyHours.match(/(\d+h)?\s*(\d+m)?/);
let totalHourpersent = 0;

    if (timeParts) {
      const hours = timeParts[1] ? parseInt(timeParts[1].replace('h', '')) : 0;
      const minutes = timeParts[2] ? parseInt(timeParts[2].replace('m', '')) : 0;
      totalHourpersent = hours + (minutes / 60);
    }

    let value = (totalHourpersent / 40) * 100;
    this.totalWeeklyValue = Math.round(value);

  }

  todayhour(data: any){
    let totalHours = 0;
let totalMinutes = 0;
    data.forEach((spenttime: any)=>{
      const hoursMatch = spenttime.match(/(\d+)h/); // Match hours
    const minutesMatch = spenttime.match(/(\d+)m/); // Match minutes

    if (hoursMatch) {
      totalHours += parseInt(hoursMatch[1]);
  }
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
}
    })
    totalHours += Math.floor(totalMinutes / 60);
totalMinutes = totalMinutes % 60; // Keep the remaining minutes

console.log(`today Total time: ${totalHours}h ${totalMinutes}m`);
this.TodayHours = `${totalHours}h ${totalMinutes}m`

const timeParts = this.TodayHours.match(/(\d+h)?\s*(\d+m)?/);
let totalHourpersent = 0;

    if (timeParts) {
      const hours = timeParts[1] ? parseInt(timeParts[1].replace('h', '')) : 0;
      const minutes = timeParts[2] ? parseInt(timeParts[2].replace('m', '')) : 0;
      totalHourpersent = hours + (minutes / 60);
    }

    let value = (totalHourpersent / 9) * 100;
    this.totaltodayValue = Math.round(value);
    console.log("todaypresentvalue",  this.totaltodayValue )

  }
  
  checkintimedata(){
this.loading = true;
    this.firestoreService.getAttendanceRecord(this.username).then((data2)=>{
      this.timedata = []
      for (const key in data2) {
        if (data2[key]?.data) { // Check if `data[key].data` exists
            const dataarray = data2[key].data;
            this.timedata.push(...dataarray); // Push all elements of `dataarray` into `this.data`
            this.loading = false;
        }
    }
    console.log('timedata????', this.timedata)
    this.timeconut()
      // this.gethourtimelog()
    })
  }

  timeconut(){
    const startDate = new Date();
    startDate.setDate(1); 
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); 
    endDate.setDate(0);
    const monthydata = this.timedata.filter((item: any)=>{
      const itemDate = new Date(item.date); 
      return itemDate >= startDate && itemDate <= endDate   ;
    });
    console.log('time ka data', monthydata)
    const ontime = new Date();
    const middletime = new Date();
   ontime.setHours(10, 20, 0); // Set cutoff time to 10:30 am
   middletime.setHours(10, 30, 59); // Set cutoff time to 10:30 am
   this.ontime = ontime.toLocaleTimeString();
   this.middletime= middletime.toLocaleTimeString();
      this.ontimecount = monthydata.filter((product: any) => product.checkInTime < this.ontime).length;
        this.middletimecount = monthydata.filter((product: any) => product.checkInTime < this.middletime && product.checkInTime > this.ontime ).length;
        this.aftertimecount = monthydata.filter((product: any) => product.checkInTime > this.middletime  ).length;
        
this.timechart(this.ontimecount,this.middletimecount, this.aftertimecount)
console.log('timechart', this.ontimecount,this.middletimecount, this.aftertimecount)

  }
  

  getuserleave() {

    const date = new Date().toDateString();
    this.firestoreService.getleave().subscribe((req) => {
      console.log("date", date)
      console.log("all request data", req)
      const data = req.filter((item:any) => item.id == this.username)
      console.log("date76237167", data)
      this.leavedata = [];

      for(let key in data){
        // console.log("leavessss", data[key])
        if (data[key] && typeof data[key] === 'object') {
        for(let key2 in data[key]){
          if (data[key][key2] && data[key][key2].data && Array.isArray(data[key][key2].data)) {
            this.leavedata.push(...data[key][key2].data );
            this.leavedata.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

          }
        }
      }
      }

      this.leavesstatus = this.leavedata[0].status;

      const filter= this.leavedata.filter((item: any) => item.status === 'Approved');
      const total = filter.length;
      console.log("filter ", filter);

    this.totalleave = 0;  // Initialize the leave counter

    filter.forEach((item: any) => {
      if (item.leavetype === 'Half Leave') {
        this.totalleave =  this.totalleave + 0.5;
      } else if (item.leavetype === 'Full Leave') {
        this.totalleave =  this.totalleave + 1;
      }
    });
      console.log("Processed leave data", this.leavedata);
      this.leaveschart(this.userdataleave, this.totalleave )

    });
  }



  timelive(){
    this.livetime = new Date().toLocaleTimeString();
  }

}
