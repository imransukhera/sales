import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from "../../pages/components/dashboard/dashboard/dashboard.component";
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FirestoreService } from '@services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-leaves-logs',
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    DropdownModule,
    CalendarModule,
    FormsModule,
    TableModule,
    DialogModule
  ],
  templateUrl: './leaves-logs.component.html',
  styleUrl: './leaves-logs.component.scss'
})
export class LeavesLogsComponent implements OnInit{
  loading: boolean = false;
  employeeDropdown: any;
  rangeDates: any;
  employeeName: any;
  allData: any;
  getAllData: any;
  visible = false;



constructor(
  private firestoreService: FirestoreService
  , private firestore: Firestore
  , private toaster: ToastrService
){}
  ngOnInit(): void {
    this. lastMonthDate();
      this.getAllUserProfiles();
      this.getuserleave()
  }


  lastMonthDate() {
    const today = new Date();
    const lastSunday = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastFriday = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.rangeDates = [lastSunday, lastFriday];

  }
  getAllUserProfiles() {
    this.firestoreService.getAllUser().subscribe(
      (data) => {
        this.employeeDropdown = data;
      });
  }

  search() {
    const startDate = new Date(this.rangeDates[0]);
    const endDate = new Date(this.rangeDates[1]);
    const filteredData = this.getAllData.filter((data: any) => {
      const recordDate = new Date(data?.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
    if (this.employeeName?.name) {
      this.allData = filteredData.filter((data: any) => data?.name === this.employeeName?.name);
    } else {
      this.allData = filteredData;
    }
  }


  getuserleave() {
    const date = new Date().toDateString();
    this.firestoreService.getleave().subscribe((req) => {
      console.log("date", date)
      console.log("all request data", req)
      // const data = req.filter((item:any) => item.id == this.userdata.username)
      // console.log("date76237167", data)
      this.allData = [];

      for(let key in req){
        if (req[key] && typeof req[key] === 'object') {
        for(let key2 in req[key]){
          console.log("data2", req[key][key2].data)
          if (req[key][key2] && req[key][key2].data && Array.isArray(req[key][key2].data)) {
            this.allData.push(...req[key][key2].data );
            this.allData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            this.getAllData = this.allData
            this.loading = false;

          }
        }
      }
      }
      // this.allData = this.allData.length ;
      console.log("Processed leave data", this.allData);
    });
  }




  cancelFrom() {
    this.visible = false;
  }

  acceptleave(index: any){
    const value = index;
    const date = value.date;
    const username = index.username
    const data = {
     name: value.name,
     leavetype:  value.leavetype,
     date: value.date,
     description: value.description,
     username: index.username,
     status: 'Approved' 
    }
    console.log('data',username,  date,data)
    this.firestoreService.leaveupdate(username, date, data)
    .then(() => {
      this.toaster.success('Successfully Leave Approved');
      this.loading = false;
      this.visible= false;

    })
    .catch(error => {
      this.loading = false;
      console.error('Error adding data: ', error);
    });
  }

  rejectleave(index: any){
    const value = index;
    const date = value.date;
    const username = index.username
    const data = {
     name: value.name,
     leavetype:  value.leavetype,
     date: value.date,
     description: value.description,
     username: index.username,
     status: 'Approved' 
    }
    console.log('data',username,  date,data)
    this.firestoreService.leavedelete(username, date, data)
    .then(() => {
      this.toaster.success('Successfully delete');
      this.loading = false;
      this.visible= false;

    })
    .catch(error => {
      this.loading = false;
      console.error('Error adding data: ', error);
    });
  }




}
