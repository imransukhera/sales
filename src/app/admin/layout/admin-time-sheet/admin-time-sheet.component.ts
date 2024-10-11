import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { RouterLink } from '@angular/router';


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
    RouterLink
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

  constructor(private firestoreService: FirestoreService, private firestore: Firestore, private toaster: ToastrService) {

  }
  ngOnInit() {
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
    this.getrequest();
  }

  lastMonthDate() {
    const today = new Date();
    const lastSunday = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastFriday = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dateRange = [lastSunday, lastFriday];

  }

  getAllUserProfiles() {
    this.firestoreService.getAllUser().subscribe(
      (data) => {
        this.employeeDropdown = data;
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

  checkin() {
    this.loading = true;
    const currentDate = new Date();
    const time = currentDate.toTimeString().split(' ')[0];
    const date = currentDate.toDateString();

    this.checkingstatus = true;
    const data = {
      checkInTime: time,
      name: this.profileData.name,
      checkOutTime: '',
      date: date,
    }
    this.firestoreService.checkin(this.profileData.username, date, data)
      .then(() => {
        this.toaster.showSuccess('Successfully Check-In');
        this.loading = false;
        this.fetchTimelogData(this.profileData.username);
      })
      .catch(error => {
        this.loading = false;
        console.error('Error adding data: ', error);
      });
  }

  checkout() {
    this.loading = true;
    const currentDate = new Date();
    const time = currentDate.toTimeString().split(' ')[0];
    const date = currentDate.toDateString();
    const choutTime = this.days.find(product => product.date == date);
    if (choutTime?.checkOutTime) {
      this.toaster.showError('you are already checkout');
      this.loading = false;
      return;
    }
    const data = {
      checkInTime: choutTime?.checkInTime,
      name: this.profileData.name,
      checkOutTime: time,
      date: date,
    }

    this.firestoreService.checkOut(this.profileData.username, date, data)
      .then(() => {
        this.toaster.showSuccess('Successfully Checkout');
        this.loading = false;
        this.fetchTimelogData(this.profileData.username);
      })
      .catch(error => {
        this.loading = false;

        console.error('Error adding data: ', error);
      });
  }

  fetchTimelogData(name: string) {
    this.loading = true;

    this.firestoreService.getAttendance().subscribe(
      (data: any[]) => {

        const allAttendance = data.map((item: any) => {
          return Object.keys(item).map((key: string) => {
            if (key !== 'id') {
              return item[key].data.map((record: any) => ({
                checkInTime: record.checkInTime,
                checkOutTime: record.checkOutTime,
                date: record.date,
                name: record.name,
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
  changeIf() {
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
          pdf.save('timelogssheet.pdf');

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
    this.firestoreService.getAllUser().subscribe(
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
    this.firestoreService.getRequest().subscribe((req) => {
      console.log("request", req)
      this.requestdata = req;
      console.log("request store", this.requestdata)

    })
  }

  cancelFrom() {
    this.visible = false;
  }

}
