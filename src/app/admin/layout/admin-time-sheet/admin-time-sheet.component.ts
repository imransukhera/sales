import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FirestoreService } from '@services/firestore.service';
import { Firestore } from '@angular/fire/firestore';
import { ToastrService } from '@services/toastr.service';
import { ProjectSidebarComponent } from '../../../pages/components/project-sidebar/project-sidebar.component';
import jsPDF from 'jspdf';
import { CarouselModule } from 'primeng/carousel';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { retry } from 'rxjs';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

interface Attendance {
  [key: string]: {
    data: {
      checkInTime: string;
      checkOutTime: string;
      date: string;
      name: string;
      location?: string;
    }[];
  } | string;
}

@Component({
  selector: 'app-admin-time-sheet',
  standalone: true,
  imports: [
    TableModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    FormsModule,
    CommonModule,
    ProjectSidebarComponent,
    CarouselModule,
    CalendarModule,
    ReactiveFormsModule,
    RouterLink,
    MenubarModule
  ],
  templateUrl: './admin-time-sheet.component.html',
  styleUrl: './admin-time-sheet.component.scss'
})
export class AdminTimeSheetComponent {
  checking: any[] = [
    { date: 12 - 12 - 24, time: 12 - 50 }
  ];
  loading: boolean = false;
  locathostData: any;
  checkingstatus: boolean = false;
  days: any[] = []
  profileData: any;
  todayDate: any;
  employeeDropdown: any;
  employeeName: any;
  allAttendance: any;
  dateRange: any;

  userdata: any[] = [];
  responsiveOptions: any[] | undefined;
  visible = false;
  requestdata: any;
  editmode: boolean = true;
  editmodeout: boolean = true;
  edittime: any;
  edittimeout: any;
  time: Date[] | undefined;
  profileForm!: FormGroup;
  requestdataid: any;
  ontime: any;
  middletime: any;
  accept: boolean = false;
  items: MenuItem[] | undefined;
  companyID: any;
  constructor(private firestoreService: FirestoreService, private route: ActivatedRoute, private toaster: ToastrService, private fb: FormBuilder) {
    this.route.parent?.paramMap.subscribe(params => {
      this.companyID = params.get('companyId');
      console.log('Company ID:', this.companyID);
    });
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const id = currentRoute.snapshot.paramMap.get('companyId');
      if (id) {
        this.companyID = id;
        console.log('Company ID:', this.companyID);
        break;
      }
      currentRoute = currentRoute.parent;
    }

  }
  ngOnInit() {
    this.items = [
      {
        label: 'Attendance Report',
        styleClass: 'rounded-md',

        items: [
          {
            label: 'Download Report',
            command: () => {
              this.changeIf2();
            }

          }
        ]
      },
    ];
    this.locathostData = localStorage.getItem('userProfile');
    this.profileData = JSON.parse(this.locathostData);
    this.checking;
    const currentDate = new Date();
    const time = currentDate.toTimeString().split(' ')[0];
    this.todayDate = currentDate.toDateString();
    this.fetchTimelogData(this.profileData.username);
    this.getAllUserProfiles();
    this.lastMonthDate();
    this.getAllUserProfilesdata();
    this.carousel();
    this.createForm();
    this.getrequest();
    this.checkCheckInTime();
  }

  lastMonthDate() {
    const today = new Date();
    const lastSunday = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastFriday = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dateRange = [lastSunday, lastFriday];

  }

  checkCheckInTime() {
    const currentTime = new Date();

    const ontime = new Date();
    const middletime = new Date();


    ontime.setHours(10, 40, 0); // Set cutoff time to 10:30 am
    middletime.setHours(11, 0, 59); // Set cutoff time to 10:30 am
    this.ontime = ontime.toLocaleTimeString();
    this.middletime = middletime.toLocaleTimeString();


  }

  createForm() {
    this.profileForm = this.fb.group({
      check_in: [undefined],
      check_out: [undefined],
    });
  }
  getAllUserProfiles() {
    this.firestoreService.getAllUser(this.companyID).subscribe(
      (data) => {
        this.employeeDropdown = data;
        console.log("dhfgsjhagdh data usr", this.employeeDropdown)
      });
  }


  getlocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition): void => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
          fetch(url).then(response => response.json()).then(data => {
            if (data && data.address) {
              const locationName = `${data.address.city || ''}, ${data.address.country || ''}`;
              console.log("Location Name:", data.display_name);
            } else {
              console.error("Unable to find location.");
            }
          })
        },
        (error: GeolocationPositionError): void => {
          console.error("Error getting location:", error.message);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }



  checkin(index: any) {
    this.loading = true;
    const currentDate = new Date();
    const time = currentDate.toTimeString().split(' ')[0];

    const date = index.date
    console.log("index", index)
    let name = this.userdata.filter((data: any) => data.name === index.name)

    this.checkingstatus = true;
    const data = {
      employeeid: index.employeeid,
      checkInTime: this.profileForm.value.check_in.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      checkOutTime: index.checkOutTime,
      date: index.date,
      name: index.name,
      location: index.location
    }
    console.log("checkout time check:", data, "user name:", name[0].username, date, "Valuegg", name);

    this.firestoreService.checkOut(this.companyID, name[0].username, date, data)
      .then(() => {
        this.toaster.showSuccess('Successfully Check-In');
        this.loading = false;
        this.closeedit();
        this.fetchTimelogData(this.profileData.username);
      })
      .catch(error => {
        this.loading = false;
        console.error('Error adding data: ', error);
      });
  }
  checkout(index: any) {
    this.loading = true;
    const currentDate = new Date();
    const time = currentDate.toTimeString().split(' ')[0];

    const date = index.date

    let name = this.userdata.filter((data: any) => data.name === index.name)

    this.checkingstatus = true;
    const data = {
      employeeid: index.employeeid,
      checkInTime: index.checkInTime,
      checkOutTime: this.profileForm.value.check_out.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: index.date,
      name: index.name,
      location: index.location
    }
    console.log("checkout time check:", data, "user name:", name[0].username, date, "Valuegg", name);

    this.firestoreService.checkOut(this.companyID, name[0].username, date, data)
      .then(() => {
        this.toaster.showSuccess('Successfully Check-In');
        this.loading = false;
        this.closeedit();
        this.fetchTimelogData(this.profileData.username);
      })
      .catch(error => {
        this.loading = false;
        console.error('Error adding data: ', error);
      });
  }

  fetchTimelogData(name: string) {
    this.loading = true;

    this.firestoreService.getAttendance(this.companyID).subscribe(
      (data: any[]) => {

        const allAttendance = data.map((item: any) => {
          return Object.keys(item).map((key: string) => {
            if (key !== 'id') {
              return item[key].data.map((record: any) => ({
                employeeid: record.employeeid,
                checkInTime: record.checkInTime,
                checkOutTime: record.checkOutTime,
                date: record.date,
                name: record.name,
                qrCodeValue: record.qrCodeValue,
                location: record.location || '',
                id: item.id
              }));
            }
            return null;
          }).filter(entry => entry !== null).flat();
        }).flat();
        this.loading = false;
        const currentDate = new Date().toDateString();
        this.allAttendance = allAttendance;
        console.log("this is all data :", allAttendance);
        const startDate = new Date(this.dateRange[0]);
        const endDate = new Date(this.dateRange[1]);
        const filteredData = allAttendance.filter((data: any) => {
          const recordDate = new Date(data?.date);
          return recordDate >= startDate && recordDate <= endDate;
        });
        const dateDate = filteredData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.days = dateDate;
        console.log("Formatted All Attendance:", this.days, "today", currentDate);
      }
    );
  }

  transformTimelogData(data: any): any[] {
    const result: any[] = [];
    Object.keys(data).forEach((date) => {
      const dayData = data[date].data;

      dayData.forEach((entry: any) => {
        result.push({
          employeeid: entry.employeeid,
          name: entry.name,
          date: entry.date,
          checkInTime: entry.checkInTime,
          checkOutTime: entry.checkOutTime,
          location: entry.location,
        });
      });
    });

    console.log("Check in detail:", result);
    return result;
  }

  // Method to be called on input change

  //without location pdf report
  changeIf() {
    const date = new Date();
    this.loading = true;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a3',
    });
    const htmlData = document.getElementById('htmlData');
    // console.log("Pdf Image:", htmlData);
    if (htmlData) {
      pdf.html(htmlData, {
        margin: [23, 0, 50, 0],
        callback: (pdf: any) => {
          pdf.save(`Attendancereport${date.toISOString()}.pdf`);
          this.loading = false;
        }
      });
    }

  }

  //with location pdf report

  changeIf2() {
    const date = new Date();
    this.loading = true;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a3',
    });
    const htmlData = document.getElementById('htmlData2');
    // console.log("Pdf Image:", htmlData);
    if (htmlData) {
      pdf.html(htmlData, {
        margin: [23, 0, 50, 0],
        callback: (pdf: any) => {
          pdf.save(`Attendancereport${date.toISOString()}.pdf`);
          this.loading = false;
        }
      });
    }
  }

  searchRecord() {
    const startDate = new Date(this.dateRange[0]);
    const endDate = new Date(this.dateRange[1]);

    // Filter by date range
    const filteredData = this.allAttendance.filter((data: any) => {
      const recordDate = new Date(data?.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Further filter by employee name if provided
    let finalData;
    if (this.employeeName?.name) {
      finalData = filteredData.filter((data: any) => data?.name === this.employeeName?.name);
    } else {
      finalData = filteredData;
    }

    // Sort the final data by date (ascending)
    this.days = finalData.sort((a: any, b: any) => {
      const dateA = new Date(a?.date).getTime();
      const dateB = new Date(b?.date).getTime();
      return dateA - dateB;  // Ascending order (for descending, reverse the comparison)
    });

    console.log("Sorted Filtered Data:", this.days, "Selected Date Range:", this.dateRange);
  }

  getAllUserProfilesdata() {
    this.firestoreService.getAllUser(this.companyID).subscribe(
      (data) => {
        console.log("all data profiles:", data);
        this.userdata = data;
      });
  }

  isSelected(data: any): boolean {
    // return this.days.some((selected = this.days) => selected.name === data.name);
    const currentDate = new Date().toDateString();
    const filteredData = this.days.some((selected = this.days) => new Date(selected.date).toDateString() === currentDate);
    if (!filteredData) {
      return this.days.some((selected = this.days) => selected.name === data.name);

    } else {
      return this.days.some((selected = this.days) => selected.name === data.name && new Date(selected.date).toDateString() === currentDate);

    }
  }

  carousel() {
    this.responsiveOptions = [
      {
        breakpoint: '1199px',
        numVisible: 4,
        numScroll: 1
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }


  search(name: any) {
    const startDate = new Date(this.dateRange[0]);
    const endDate = new Date(this.dateRange[1]);

    // Filter by date range
    const filteredData = this.allAttendance.filter((data: any) => {
      const recordDate = new Date(data?.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // Further filter by employee name if provided
    let finalData;
    if (name) {
      finalData = filteredData.filter((data: any) => data?.name === name);
    } else {
      finalData = filteredData;
    }

    // Sort the final data by date (ascending)
    this.days = finalData.sort((a: any, b: any) => {
      const dateA = new Date(a?.date).getTime();
      const dateB = new Date(b?.date).getTime();
      return dateA - dateB;  // Ascending order (for descending, reverse the comparison)
    });

    console.log("Sorted Filtered Data:", this.days, "Selected Date Range:", this.dateRange);
  }

  getrequest() {
    const date = new Date().toDateString();
    this.firestoreService.getRequest(this.companyID).subscribe((req) => {
      console.log("date", date)
      console.log("all request data", req)
      const data = req.map((item: any[]) => item)
      console.log("date", data)
      this.requestdata = [];

      for (let key in req) {
        if (req[key] && typeof req[key] === 'object') {

          for (let key2 in req[key]) {
            console.log("in which", key2)
            if (req[key][key2] && req[key][key2].data && Array.isArray(req[key][key2].data)) {
              this.requestdata.push(...req[key][key2].data);
            }
          }
        }

      }
      console.log("Processed request data", this.requestdata);
    });
  }

  requestaccept(index: any) {
    console.log("accept", index)
    const date = index.date
    const name = index.username
    console.log("username", name)
    this.checkingstatus = true;
    const data = {
      employeeid: index.employeeid,
      checkInTime: index.checkInTime,
      checkOutTime: index.checkOutTime,
      date: index.date,
      name: index.name,
      location: index.location ? index.location : ''
    }
    console.log("checkout time check:", name, data);

    if (index.status == 'Check In' || index.status == 'Both') {
      this.firestoreService.AcceptRequest(this.companyID,name, date, data)
        .then(() => {
          this.toaster.showSuccess('Successfully Accept Request');
          this.loading = false;
          this.accept = true;
          this.closeedit();
          this.requestdelete(index);
          this.fetchTimelogData(this.profileData.username);
          return
        })
        .catch(error => {
          this.loading = false;
          console.error('Error adding data: ', error);
          return
        });
    } else if (index.status == 'Check Out') {
      this.firestoreService.checkOut(this.companyID, name, date, data)
        .then(() => {
          this.toaster.showSuccess('Successfully Accept Request');
          this.loading = false;
          this.accept = true;
          this.closeedit();
          this.requestdelete(index);
          this.fetchTimelogData(this.profileData.username);
        })
        .catch(error => {
          this.loading = false;
          console.error('Error adding data: ', error);
        });
    }

  }
  requestdelete(index: any) {
    console.log("accept", index)
    const date = index.date
    const name = index.username;
    let requestindex = this.requestdata.findIndex((data: any) => data.name === index.name)

    this.checkingstatus = true;
    const data = {
      employeeid: index.employeeid,
      checkInTime: index.checkInTime,
      checkOutTime: index.checkOutTime,
      date: index.date,
      name: index.name,
      location: index.location
    }

    console.log("delete", name, date, data, requestindex)

    this.firestoreService.daleterequest(this.companyID, name, date, data, requestindex).then(() => {
      this.loading = false;
      if (!this.accept) {
        this.toaster.showError('Successfully Delete Request');
      }
      this.fetchTimelogData(this.profileData.username);
    }).catch((error) => {
      console.error('Error Request Delete:', error);
    });
  }


  timeedit(index: any) {
    if (this.editmode == true) {
      this.edittime = index;
      this.editmode = false
      console.log("status:", this.editmode)
    }
  }
  timeeditout(index: any) {
    if (this.editmodeout == true) {
      this.edittimeout = index;
      this.editmodeout = false
      console.log("status:", this.editmode)
    } else {
      this.toaster.showError('Any Edit Field Open , First Close It');
    }
  }

  closeedit() {

    this.edittime = null;
    this.edittimeout = null;
    this.editmode = true
    this.editmodeout = true
    console.log("status close:", this.editmode)

  }


  cancelFrom() {
    this.visible = false;
  }

}
