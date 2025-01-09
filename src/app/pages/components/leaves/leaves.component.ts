import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardComponent } from "../dashboard/dashboard/dashboard.component";
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '@services/firestore.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [
    CommonModule, 
    DashboardComponent,     
    DialogModule,
    CalendarModule,
    FormsModule,
    DropdownModule,
    TableModule,
    ReactiveFormsModule
  ],
  templateUrl: './leaves.component.html',
  styleUrl: './leaves.component.scss'
})
export class LeavesComponent implements OnInit {
  loading: boolean = false;
  visible: boolean = false;
  userdata: any;
  leavedata: any;
  leaveForm!: FormGroup;
  recent: any;
  startDate: Date[] | undefined;
  endDate: Date[] | undefined;

  
  leaveduration: any;
  totalleave: any;
  remainingleaves: any
  totalapprovedleave: any;

  constructor(    
    private fb: FormBuilder, 
    private firestoreService: FirestoreService,
    private firestore: Firestore,
    private toaster: ToastrService

  ){}

  ngOnInit(): void {

    this.leaveduration =[
      {name: 'Full Leave'},
      {name: 'Half Leave'},
  
    ];
    this.getuserdata();
    this.createForm();
    this.getleaves();
    this.getuserleave();
  }

  showdialog() {
    this.visible = true;
  }

  getuserdata(){
const profile = localStorage.getItem('userProfile')
if(profile){
  this.userdata = JSON.parse(profile)
}
  }

  createForm() {
    this.leaveForm = this.fb.group({
      leavetype: [undefined, [Validators.required]],
      Date: [undefined, [Validators.required]],
      description: [undefined]
    });
  }

  item = [
    {applyleave:'Half' , date:'Thu 23, 2024', status:'Pending'},
    {applyleave:'Full' , date:'Thu 22, 2024', status:'Cancel'},
    {applyleave:'Half' , date:'Thu 21, 2024', status:'Accept'},
    {applyleave:'Full' , date:'Thu 20, 2024', status:'Cancel'},
    {applyleave:'Full' , date:'Thu 1, 2024', status:'Accept'},
    {applyleave:'Full' , date:'Thu 2, 2024', status:'Accept'},
    {applyleave:'Full' , date:'Thu 22, 2024', status:'Accept'},
    {applyleave:'Full' , date:'Thu 22, 2024', status:'Accept'},
    {applyleave:'Full' , date:'Thu 22, 2024', status:'Accept'},


  ]

  getleaves() {
    this.firestoreService.getleave().subscribe((req) => {
      console.log("request leave", req)

    })
  }

 
  getuserleave() {
    const date = new Date().toDateString();
    this.firestoreService.getleave().subscribe((req) => {
      console.log("date", date)
      console.log("all request data", req)
      const data = req.filter((item:any) => item.id == this.userdata.username)
      console.log("date76237167", data)
      this.leavedata = [];

      for(let key in data){
        // console.log("leavessss", data[key])
        if (data[key] && typeof data[key] === 'object') {
        for(let key2 in data[key]){
          if (data[key][key2] && data[key][key2].data && Array.isArray(data[key][key2].data)) {
            this.leavedata.push(...data[key][key2].data );
            this.leavedata.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            this.loading = false;

          }
        }
      }
      }

      // for (let key in req) {
        // console.log("leavessss", req[key])
        // if(req[key].id == this.userdata.username){
        //   // console.log("leavessss", req[key])
        //   for(let key2 in req[key]) {
        //     console.log("leavessss", req[key][key2].data)
        //   }


        // }
      //   if (req[key] && typeof req[key] === 'object') {
        
      //   for(let key2 in req[key]){
      //     console.log("in which", key2)
      //     if (req[key][key2] && req[key][key2].data && Array.isArray(req[key][key2].data)) {
      //       this.leavedata.push(...req[key][key2].data );
      //     }
      //   }
      // }
             
      // }
      const filter= this.leavedata.filter((item: any) => item.status === 'Approved');
      const total = filter.length;
     

      console.log('total approved leaves count', this.totalapprovedleave)
      this.firestoreService.getuserProfile(this.userdata.username)
      .then((data) => {
        console.log('usr data leave leaves ' , data)
        this.totalleave = data.totalLeaves; 
        this.remainingleaves = data.remainingLeaves;
      });

    
    });
  }

  leavesubmit(){
    const value = this.leaveForm.value;
    console.log('data',value)
    const date = value.Date.toDateString();
    const username = this.userdata.username
    let leavescount = 0;
    if(value.leavetype == 'Half Leave'){
      leavescount = 0.5;
    }if(value.leavetype == 'Full Leave'){
      leavescount = 1;
    }
    const data = {
     name: this.userdata.name,
     leavetype:  value.leavetype,
     Date: value.Date.toDateString(),
     totalLeaveCount: leavescount,
     description: value.description,
     username: this.userdata.username,
     status: 'Pending...' 
    }
    console.log('data',username,  date,data)
    this.firestoreService.submitleave(username, date, data)
    .then(() => {
      this.toaster.success('Successfully Checkout');
      this.loading = false;
      this.visible= false;

    })
    .catch(error => {
      this.loading = false;
      console.error('Error adding data: ', error);
    });
  }

}
