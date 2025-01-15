import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ProjectSidebarComponent } from "../../project-sidebar/project-sidebar.component";
import { FirestoreService } from '@services/firestore.service';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { ToastrService } from '@services/toastr.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';
import { DashboardComponent } from "../dashboard/dashboard.component";
declare var google: any;
@Component({
  selector: 'app-checking-detail',
  standalone: true,
  imports: [
    TableModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    FormsModule,
    CommonModule,
    ProjectSidebarComponent,
    ProgressBarModule,
    HttpClientModule,
    ReactiveFormsModule,
    DashboardComponent
],
  templateUrl: './checking-detail.component.html',
  styleUrl: './checking-detail.component.scss'
})
export class CheckingDetailComponent implements OnInit {
  visible = false;
  submitted = false;
  profileForm!: FormGroup
  apiKey = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDrY9pu8WvYAe78IxlHB4nG7QbHZzM8bMU&libraries=places&language=en'
  checking: any[] = [
    { date: 12 - 12 - 24, time: 12 - 50 }
  ];
  loading: boolean = false;
  locathostData: any;
  checkingstatus: boolean = false;
  days: any[] = [];
  datarecord: any[]=[]
  rangeDates: any;

  profileData: any;
  todayDate: any;
  locationName: any;
  apiLoaded: any;
  requestselected: any
  currentAddress: any;
  dateTime = new Date();
  canCheckIn: boolean = true;
  ontime: any;
  ontimecount: any;
  middletime: any;
  middletimecount: any;
  aftertimecount: any;
  dateRange: any;
  employeeName: any;
  issueName: any[] = [
    {
      name: 'Check In' , valuename: 'checkInTime'
    },
    {
      name: 'Check Out' , valuename: 'checkOutTime'
    },
    {
      name: 'Both' , valuename: 'Both'
    }
  ]
  requestdata: any;

  constructor(
    private http: HttpClient,
    private firestoreService: FirestoreService,
    private firestore: Firestore,
    private fb: FormBuilder,
    private toaster: ToastrService
  ) {

  }
  ngOnInit() {
    this.locathostData = localStorage.getItem('userProfile');
    this.profileData = JSON.parse(this.locathostData);
    this.checking;
    const currentDate = new Date();
    const time = currentDate.toTimeString().split(' ')[0];
    const lastSunday = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastFriday = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.rangeDates = [lastSunday, lastFriday];
    this.todayDate = currentDate.toDateString();
    this.fetchTimelogData(this.profileData.username);
    this.getCurrentLocationAndAddressd();
    // this.getLocation();
    this.createForm();
    this.getrequest();
    this. checkCheckInTime();
    this.searchRecord()
  }
  onchange(type: any) {
    console.log('request type', type)
    this.requestselected = type;

  }

  checkCheckInTime() {
    const currentTime = new Date();
    const cutoffTime = new Date();
    const ontime = new Date();
    const middletime = new Date();

    cutoffTime.setHours(12, 50, 59); // Set cutoff time to 10:30 am
   ontime.setHours(10, 40, 0); // Set cutoff time to 10:30 am
   middletime.setHours(11, 0, 59); // Set cutoff time to 10:30 am
   this.ontime = ontime.toLocaleTimeString();
   this.middletime= middletime.toLocaleTimeString();
    this.canCheckIn = currentTime < cutoffTime;
console.log('ontime', this.ontime);
console.log("middle time ", this.middletime)
  }

  createForm() {
    this.profileForm = this.fb.group({
      name: [undefined, [Validators.required]],
      date: [undefined, [Validators.required]],
      checkInTime: [undefined],
      checkOutTime: [undefined],
      location: [undefined],
    });
  }

  getCurrentLocationAndAddressd(): void {
    const officeLatitude = 31.4185261;
    const officeLongitude = 74.2666856;
    const radius = 1600;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const distance = this.getDistanceFromLatLonInMeters(
            latitude,
            longitude,
            officeLatitude,
            officeLongitude
          );
          if (distance <= radius) {
            this.currentAddress = '106 3rd Avenue Northwest NFC Society Lahore';
          }

          // Call the method to get the address from latitude and longitude
          // this.getLocation(latitude, longitude)
          //   .then(locationName => {
          //     this.locationName = this.locationName;
          //     console.log("Current Location Address:", locationName);
          //     // You can set this address to a variable if needed
          //     this.currentAddress = locationName;
          //   })
          //   .catch(error => {
          //     console.error("Error getting address:", error);
          //   });
        },
        (error: GeolocationPositionError) => {
          console.error("Error getting location:", error.message);
        },
        {
          enableHighAccuracy: true, // Request high accuracy
          maximumAge: 0,  // Optional: Force the device to not use cached positions
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }


  getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius of the earth in meters
    const dLat = this.deg2rad(lat2 - lat1); // deg2rad below
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }


  getLocation(latitude: number, longitude: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(31.4185261, 74.2666856);

      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            const locationName = results[0].formatted_address;
            resolve(locationName);
            console.log('Location Name:', results[0]);
          } else {
            reject('No results found');
          }
        } else {
          reject('Geocoding failed: ' + status);
        }
      });
    });
  }



  getAddressFromLatLng(latitude: number, longitude: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(latitude, longitude);
      geocoder.geocode({ 'location': latlng }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            const formattedAddress = results[0].formatted_address;
            resolve(formattedAddress);
            console.log("Formatted Address:", formattedAddress);
          } else {
            reject('No results found');
          }
        } else {
          reject('Geocoder failed due to: ' + status);
        }
      });
    });
  }



  checkin() {
    this.loading = true;
    const currentDate = new Date();
    // const time = currentDate.toTimeString().split(' ')[0];
    const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = currentDate.toDateString();

    const data = {
      employeeid: this.profileData.employeeid,
      checkInTime: time,
      name: this.profileData.name,
      checkOutTime: '',
      location: this.currentAddress,
      date: date,
    }

    console.log("HYT:", this.currentAddress);
    console.log('data check attendance hansdga', data)
    // return
    if (this.currentAddress) {
      this.firestoreService.checkin(this.profileData.username, date, data)
        .then(() => {
          this.toaster.showSuccess('Successfully Check-In');
          this.loading = false;
          this.checkingstatus = true;
          this.fetchTimelogData(this.profileData.username);
        })
        .catch(error => {
          this.loading = false;
          console.error('Error adding data: ', error);
        });
    } else {
      this.loading = false;
      this.toaster.showError('You are not in office so use moblie App for Checkin');
    }

  }

  checkout() {
    this.loading = true;
    const currentDate = new Date();
    // const time = currentDate.toTimeString().split(' ')[0];
    const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    console.log("this is location name:", this.locationName, "nd", time);

    const date = currentDate.toDateString();
    const choutTime = this.days.find(product => product.date == date);


    if (choutTime?.checkOutTime) {
      this.toaster.showError('you are already checkout');
      this.loading = false;
      return;
    }
    const data = {
      employeeid: this.profileData.employeeid,
      checkInTime: choutTime?.checkInTime,
      name: this.profileData.name,
      checkOutTime: time,
      date: date,
      location: choutTime?.location,
    }

    this.firestoreService.checkOut(this.profileData.username, date, data)
      .then(() => {
        this.toaster.showSuccess('Successfully Checkout');
        this.checkingstatus = false;
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

    this.firestoreService.getAttendanceRecord(name)
      .then((data) => {
        const transformedData = this.transformTimelogData(data);
        const transformedDatainsort = transformedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        this.days = transformedDatainsort;
        const choutTime = this.days.find(product => product.date == this.todayDate);
        

    
        if (choutTime) {
          this.checkingstatus = true;
        }
        else {
          this.checkingstatus = false;
        }
        this.loading = false;
        this.searchRecord()
        
      })
      .catch((error) => {
        this.loading = false;

        console.error('Error fetching timelog data:', error);
      });

      
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

    return result;
  }

  onsubmit() {
    this.submitted = true;
    if (this.profileForm.invalid) {
      this.toaster.showError('Please fill out all asterisk fields');
      return;
    }

    let value = this.profileForm.value;
    const date = value.date.toDateString()
    const index = this.days.findIndex(product => product.date == value.date.toDateString());
    const choutTime = this.days[index];

   
    let data: any;
    if (value.name == 'Check In') {
      if(!choutTime?.checkInTime){
      data = {
        employeeid: this.profileData.employeeid,
        checkInTime: value.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        name: this.profileData.name,
        checkOutTime:  choutTime?.checkOutTime ? choutTime?.checkOutTime: '' ,
        location: this.profileForm.value.location ,
        date: value.date.toDateString(),
        username: this.profileData.username,
        status: value.name
      }}else{
        return this.toaster.showError('You are Already checkIn if any issue in checkIn connect HR');
       }
    } 
     if (value.name == 'Check Out') {
      if(choutTime?.checkInTime){
      data = {
        employeeid: this.profileData.employeeid,
        checkInTime: choutTime?.checkInTime,
        name: this.profileData.name,
        checkOutTime: value.checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        location: choutTime?.location ,
        date: value.date.toDateString(),
        username: this.profileData.username,
        status: value.name
      }}else{
        return this.toaster.showError('You are not CheckIn , first CheckIn then Apply CheckOut');
      }
    }
    if (value.name == 'Both'){
      if(!choutTime?.checkInTime){
      data = {
        employeeid: this.profileData.employeeid,
        checkInTime: value.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        name: this.profileData.name,
        checkOutTime: value.checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        location: this.profileForm.value.location ,
        date: value.date.toDateString(),
        username: this.profileData.username,
        status: value.name
      }
    }else{
      return this.toaster.showError('You are Already checkIn Apply checkout if any issue then contact to HR');    }
    }
    console.log("this is value:", this.profileData.username, value.date.toDateString(),  data);
    
    this.firestoreService.SendRequest(this.profileData.username, value.date.toDateString(), data).then(() => {
      this.toaster.showSuccess('Successfully Submit Request');
      this.cancelFrom();
      this.fetchTimelogData(this.profileData.username);
    }).catch((error) => {
      console.error('Error Request submit:', error);
    });

  }



  getrequest() {
    this.firestoreService.getRequest().subscribe((req) => {
      console.log("request", req)
      this.requestdata = req;

    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.profileForm.controls;
  }

  cancelFrom() {
    this.visible = false;
    this.profileForm.reset();
  }

  searchRecord() {
    const startDate = new Date(this.rangeDates[0]);
    const endDate = new Date(this.rangeDates[1]);
    console.log("finaldatatajhgjjkmhkhkkjh:", startDate, endDate)

    console.log("filteredData:", this.days)
    // Filter by date range
    const filteredData = this.days.filter((data: any) => {
      const recordDate = new Date(data?.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
    console.log("filteredData:", filteredData)

    // Further filter by employee name if provided
    let finalData;
    if (this.employeeName?.name) {
      finalData = filteredData.filter((data: any) => data?.name === this.employeeName?.name);
    } else {
      finalData = filteredData;
    }
console.log("finaldatata:", finalData)
    // Sort the final data by date (ascending)
    this.datarecord = finalData.sort((a: any, b: any) => {
      const dateA = new Date(a?.date).getTime();
      const dateB = new Date(b?.date).getTime();
      return dateB - dateA;  // Ascending order (for descending, reverse the comparison)
    });
    
    this.ontimecount = this.datarecord.filter(product => product.checkInTime < this.ontime).length;
        this.middletimecount = this.datarecord.filter(product => product.checkInTime < this.middletime && product.checkInTime > this.ontime ).length;
        this.aftertimecount = this.datarecord.filter(product => product.checkInTime > this.middletime  ).length;
        console.log("ontimehhhh", this.ontimecount)
    console.log("Sorted Filtered Data:", this.datarecord, "Selected Date Range:", this.rangeDates);
  }


}
