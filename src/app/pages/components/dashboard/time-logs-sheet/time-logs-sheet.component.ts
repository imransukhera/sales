import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FirestoreService } from '@services/firestore.service';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import jsPDF from 'jspdf';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { CheckingDetailComponent } from "../checking-detail/checking-detail.component";
import { ToastrService } from '@services/toastr.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { DashboardComponent } from "../dashboard/dashboard.component";

interface TimelogEntry {
  date: any; // Use appropriate type if you know it (e.g., Date or Timestamp)
  issueName: string;
  description: string;
  spentTame: string; // Assuming 'spentTame' is a typo and should be 'spentTime'
  startTime: any; // Use appropriate type if you know it
}

interface TimelogData {
  data: TimelogEntry[];
}

interface WeeklyData {
  [key: string]: TimelogData;
}

@Component({
  selector: 'app-time-logs-sheet',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    FormsModule,
    ProgressSpinnerModule,
    CheckingDetailComponent,
    ProgressBarModule,
    DashboardComponent
],
  templateUrl: './time-logs-sheet.component.html',
  styleUrls: ['./time-logs-sheet.component.scss']
})
export class TimeLogsSheetComponent implements OnInit {
  errorMessage: string = '';
  todayDate: any;
  loading: boolean = false;
  dayName: any;
  daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  weeklyData: { [key: string]: any[] } = {};
  days: string[] = [];
  rangeDates: any;
  @ViewChild('htmlData') el!: ElementRef;
  dateTime = new Date();
  issueName: any;

  visible: boolean = false;
  employeeName: any;
  issueNameVlaue: any;
  timeSpent: any;
  startTime: any;
  description: any;
  dateOf: any;
  locathostData: any;
  profileData: any
  projects$: Observable<any[]>;
  processedData: any[] = [];
  grandTotalTime: any;
  apiData: any;
  updateBtn = false;
  index: any;
  isProcessing: boolean = false;
  employeeDropdown: any;
  totalMonthlyValue: any;
  currentHours: any;
  dailyTotalHorse: any;
  weaklyTotalHorse: any;
  weaklyHours: any;

  constructor(private firestoreService: FirestoreService, private firestore: Firestore, private toaster: ToastrService) {
    this.dateTime.setDate(this.dateTime.getDate() + 0);
    const today = new Date();
    this.dateOf = today;
    this.todayDate = today.toDateString();
    this.dayName = this.daysOfWeek[today.getDay()];

    const projectsCollection = collection(this.firestore, 'projects');
    this.projects$ = collectionData(projectsCollection);
  }

  ngOnInit() {
    this.getAllUserProfiles();
    const today = new Date();
    const lastSunday = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastFriday = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.rangeDates = [lastSunday, lastFriday];

    this.locathostData = localStorage.getItem('userProfile');
    this.profileData = JSON.parse(this.locathostData)
    this.getproducts();
    this.fetchTimelogData(this.profileData.username);
  }

  searchRecord() {
    const start = new Date(this.rangeDates[0]);
    const end = new Date(this.rangeDates[1]);

    type ApiData = { [key: string]: { data: any[] } };

    const apiData = this.apiData as ApiData;

    const filteredData = Object.keys(apiData)
      .map(key => ({
        date: new Date(key),
        data: apiData[key].data
      }))
      .filter(item => item.date >= start && item.date <= end)
      .reduce((acc: ApiData, item) => {
        acc[item.date.toDateString()] = { data: item.data };
        return acc;
      }, {} as ApiData);

    console.log("Total Hours:", filteredData);
    this.filterData();
    // this.monthlyReport();
    // this.WeaklyReport(filteredData);
    this.processTimelogData(filteredData);
    this.processTimelo(filteredData);
  }

  getproducts() {
    this.projects$.subscribe(data => {
      this.issueName = data;
    });
  }

  getAllUserProfiles() {
    this.firestoreService.getAllUser().subscribe(
      (data) => {
        this.employeeDropdown = data;
      });
  }

  showdialog() {
    this.visible = true;
  }

  fetchTimelogData(name: string) {
    this.loading = true;
    this.visible = false;
    this.updateBtn = false;
    this.issueNameVlaue = null;
    this.timeSpent = null;
    this.startTime = null;
    this.description = null;

    this.firestoreService.getTimelog(this.profileData.username)
      .then((data) => {
        this.apiData = data;
        this.loading = false;
        this.processTimelogData(this.apiData);
        this.processTimelo(this.apiData);
        this.filterData();
        this.WeaklyTotalReport()
      })
      .catch((error) => {
        this.loading = false;
        console.error('Error fetching timelog data:', error);
      });
  }

  processTimelogData(data: any) {
    this.weeklyData = {};
    const sortedEntries = Object.entries(data).sort(([dayA, valueA], [dayB, valueB]) => {
      const dateA = new Date(dayA);
      const dateB = new Date(dayB);
      return dateA.getTime() - dateB.getTime();
    });

    for (const [day, value] of sortedEntries) {
      this.weeklyData[day] = (value as TimelogData).data || [];
    }

    this.days = Object.keys(this.weeklyData);
  }

  processTimelo(data: any) {
    this.processedData = [];
    let grandTotalHours = 0;
    let grandTotalMinutes = 0;
    console.log("Days:", data);
    for (const date in data) {
      if (data.hasOwnProperty(date)) {
        const entry = data[date];

        let totalHours = 0;
        let totalMinutes = 0;

        entry.data.forEach((log: any) => {
          const timeString = log.spentTame.toLowerCase();
          const hourMatch = timeString.match(/(\d+)h/);
          const minuteMatch = timeString.match(/(\d+)m/);

          if (hourMatch) {
            totalHours += parseFloat(hourMatch[1]);
          }
          if (minuteMatch) {
            totalMinutes += parseFloat(minuteMatch[1]);
          }
        });

        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;
        grandTotalHours += totalHours;
        grandTotalMinutes += totalMinutes;
        const totalSpendTime = `${totalHours}h ${totalMinutes}m`;

        const formattedEntry = {
          date: date,
          totalSpendTime: totalSpendTime.trim(),
          data: entry.data,
        };

        this.processedData.push(formattedEntry);
      }
    }

    grandTotalHours += Math.floor(grandTotalMinutes / 60);
    grandTotalMinutes = grandTotalMinutes % 60;

    const grandTotalTime = `${grandTotalHours}h ${grandTotalMinutes}m`;
    this.totalMonthlyValue = this.tolalhourPercent(grandTotalTime);
    this.grandTotalTime = grandTotalTime;
  }

  addTimelog() {
    if (!this.validateTimeSpent()) {
      return;
    }
    const projectCode = this.issueName.filter((data: any) => data?.name === this.issueNameVlaue);

    this.loading = true;
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
    const formattedDate = this.dateOf.toLocaleDateString('en-US', options);
    const time = this.startTime?.toTimeString()?.split(' ')[0];
    const day = formattedDate;
    const name = this.profileData.username;
    const data = {
      date: formattedDate,
      issueName: this.issueNameVlaue,
      spentTame: this.timeSpent,
      startTime: time,
      description: this.description,
      name: this.profileData.name,
      projectCode: projectCode[0].id
    };
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined || value.toString().trim() === '') {
        this.toaster.showError('Please enter the values in the required fields.');
        return;
      }
    }

    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.firestoreService.addTimelog(name, day, data)
      .then(() => {
        this.toaster.showSuccess('Data added successfully');
        this.visible = false;
        this.isProcessing = false;
        this.loading = false;
        this.fetchTimelogData(this.profileData.username);
      })
      .catch(error => {
        console.error('Error adding data: ', error);
        this.isProcessing = false;
        this.loading = false;

      });
  }

  validateTimeSpent(): boolean {

    const timeRegex = /^((1[01]|[0-8])h\s*)?([0-5]?[0-8]m)?$/;

    if (!this.timeSpent) {
      this.toaster.showError('Please fill out all asterisk fields');
      this.loading = false;
      return false;
    } else if (!timeRegex.test(this.timeSpent.trim())) {
      this.toaster.showError('Invalid format. Please enter time like "12h 30m", "2h", or "30m".');
      this.loading = false;
      return false;
    } else {
      const hours = this.timeSpent.match(/(\d+)h/);
      if (hours && +hours[1] > 8) {
        this.toaster.showError('Time cannot exceed 12 hours.');
        this.loading = false;
        return false;
      }
    }
    return true; // Valid input
  }


  onSelectionChange() {
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

  // DeleteIndexValue
  deleteIndex(entry: any, index: any) {
    this.loading = true;
    const day = entry.date;
    const name = this.profileData.username;
    const data = {
      date: entry.date
    };
    this.firestoreService.daleteTimelog(name, day, data, index)
      .then(() => {
        this.toaster.showSuccess('Deleted successfully');
        this.visible = false;
        this.loading = false;
        this.fetchTimelogData(this.profileData.username);
      })
      .catch(error => {
        this.loading = false;
        console.error('Error adding data: ', error);
      });

  }

  updateUI() {
    this.loading = true;
    const time = this.startTime.toTimeString().split(' ')[0];
    const projectCode = this.issueName.filter((data: any) => data?.name === this.issueNameVlaue);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
    const formattedDate = this.dateOf.toLocaleDateString('en-US', options);
    const day = formattedDate;
    const name = this.profileData.username;
    const data = {
      date: formattedDate,
      issueName: this.issueNameVlaue,
      spentTame: this.timeSpent,
      startTime: time,
      description: this.description,
      name: this.profileData.name,
      projectCode: projectCode[0].id
    };
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    this.firestoreService.updateTimelog(name, day, data, this.index)
      .then(() => {
        this.toaster.showSuccess('Updated successfully');

        this.visible = false;
        this.isProcessing = false;
        this.loading = false;
        this.fetchTimelogData(this.profileData.username);
      })
      .catch(error => {
        console.error('Error adding data: ', error);
        this.isProcessing = false;
        this.loading = false;
      });



  }

  update(data: any, index: any) {
    const timeString = data?.startTime;
    this.index = index;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    const dateof = new Date(data.date);
    this.startTime = date;
    this.issueNameVlaue = data.issueName;
    this.timeSpent = data.spentTame;
    this.description = data.description;
    this.dateOf = dateof;
    this.visible = true;
    this.updateBtn = true;
  }

  calculateTotalSpentTimeForDay(entries: any[]): string {
    let totalHours = 0;
    let totalMinutes = 0;

    entries?.forEach(entry => {
      const timeString = entry?.spentTame.toLowerCase();
      const hoursMatch = timeString.match(/(\d+)h/)?.[1] || '0';
      const minutesMatch = timeString.match(/(\d+)m/)?.[1] || '0';

      totalHours += parseInt(hoursMatch);
      totalMinutes += parseInt(minutesMatch);
    });

    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    return `${totalHours}h ${totalMinutes}m`;
  }

  tolalhourPercent(grandTotalTime: any) {
    let totalHoursRequired = 160;
    let workedHours = this.convertTimeToHours(grandTotalTime);
    let value = (workedHours / totalHoursRequired) * 100;
    this.totalMonthlyValue = Math.round(value);
    return this.totalMonthlyValue;
    // console.log("This is total percentage of hours worked:", this.totalMonthlyValue);
  }

  convertTimeToHours(timeString: string): number {
    const timeParts = timeString.match(/(\d+h)?\s*(\d+m)?/);
    let totalHours = 0;

    if (timeParts) {
      const hours = timeParts[1] ? parseInt(timeParts[1].replace('h', '')) : 0;
      const minutes = timeParts[2] ? parseInt(timeParts[2].replace('m', '')) : 0;
      totalHours = hours + (minutes / 60);
    }

    return totalHours;
  }




  filterData() {
    let dateRange = [new Date(), new Date()];
    const start = new Date(dateRange[0].toDateString());
    const end = new Date(dateRange[1].toDateString());

    console.log("this is firstDate:", dateRange, "This is last:", start, end);

    type ApiData = { [key: string]: { data: any[] } };

    const apiData = this.apiData as ApiData;

    const filteredData = Object.keys(apiData)
      .map(key => ({
        date: new Date(key),
        data: apiData[key].data
      }))
      .filter(item => item.date >= start && item.date <= end)
      .reduce((acc: ApiData, item) => {
        acc[item.date.toDateString()] = { data: item.data };
        return acc;
      }, {} as ApiData);

    console.log("Total Hours:", filteredData);
    this.dailyReport(filteredData);
    // this.processTimelogData(filteredData);
    // this.processTimelo(filteredData);
  }




  dailyReport(data: any) {
    this.processedData = [];
    let grandTotalHours = 0;
    let grandTotalMinutes = 0;
    console.log("Days:", data);
    for (const date in data) {
      if (data.hasOwnProperty(date)) {
        const entry = data[date];

        let totalHours = 0;
        let totalMinutes = 0;

        entry.data.forEach((log: any) => {
          const timeString = log.spentTame.toLowerCase();
          const hourMatch = timeString.match(/(\d+)h/);
          const minuteMatch = timeString.match(/(\d+)m/);

          if (hourMatch) {
            totalHours += parseFloat(hourMatch[1]);
          }
          if (minuteMatch) {
            totalMinutes += parseFloat(minuteMatch[1]);
          }
        });

        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;
        grandTotalHours += totalHours;
        grandTotalMinutes += totalMinutes;
        const totalSpendTime = `${totalHours}h ${totalMinutes}m`;

        const formattedEntry = {
          date: date,
          totalSpendTime: totalSpendTime.trim(),
          data: entry.data,
        };

        this.processedData.push(formattedEntry);
      }
    }

    grandTotalHours += Math.floor(grandTotalMinutes / 60);
    grandTotalMinutes = grandTotalMinutes % 60;

    this.dailyTotalHorse = `${grandTotalHours}h ${grandTotalMinutes}m`;
    this.currentHours = this.dailyPercent(this.dailyTotalHorse,);
    console.log("daily Hours:", this.currentHours, "Hors:", this.dailyTotalHorse);
    // this.grandTotalTime = grandTotalTime;

  }

  dailyPercent(grandTotalTime: any) {
    let totalHoursRequired = 9;
    let workedHours = this.convertTimeToHours(grandTotalTime);
    let value = (workedHours / totalHoursRequired) * 100;
    this.currentHours = Math.round(value);
    return this.currentHours;
    // console.log("This is total percentage of hours worked:", this.totalMonthlyValue);
  }


  WeaklyTotalReport() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4);
    const start = new Date(startOfWeek.toDateString());
    const end = new Date(endOfWeek.toDateString());
    type ApiData = { [key: string]: { data: any[] } };
    const apiData = this.apiData as ApiData;
    const filteredData = Object.keys(apiData)
      .map(key => ({
        date: new Date(key),
        data: apiData[key].data
      }))
      .filter(item => item.date >= start && item.date <= end)
      .reduce((acc: ApiData, item) => {
        acc[item.date.toDateString()] = { data: item.data };
        return acc;
      }, {} as ApiData);

    console.log("Filtered data for the week (Monday to Friday):", filteredData);
    this.weaklyReport(filteredData);
  }

  weaklyReport(data: any) {
    this.processedData = [];
    let grandTotalHours = 0;
    let grandTotalMinutes = 0;
    console.log("Days:", data);
    for (const date in data) {
      if (data.hasOwnProperty(date)) {
        const entry = data[date];

        let totalHours = 0;
        let totalMinutes = 0;

        entry.data.forEach((log: any) => {
          const timeString = log.spentTame.toLowerCase();
          const hourMatch = timeString.match(/(\d+)h/);
          const minuteMatch = timeString.match(/(\d+)m/);

          if (hourMatch) {
            totalHours += parseFloat(hourMatch[1]);
          }
          if (minuteMatch) {
            totalMinutes += parseFloat(minuteMatch[1]);
          }
        });

        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;
        grandTotalHours += totalHours;
        grandTotalMinutes += totalMinutes;
        const totalSpendTime = `${totalHours}h ${totalMinutes}m`;

        const formattedEntry = {
          date: date,
          totalSpendTime: totalSpendTime.trim(),
          data: entry.data,
        };

        this.processedData.push(formattedEntry);
      }
    }

    grandTotalHours += Math.floor(grandTotalMinutes / 60);
    grandTotalMinutes = grandTotalMinutes % 60;

    this.weaklyTotalHorse = `${grandTotalHours}h ${grandTotalMinutes}m`;
    this.weaklyHours = this.weaklyPercent(this.dailyTotalHorse,);
    console.log("daily Hours:", this.currentHours, "Hors:", this.dailyTotalHorse);
    // this.grandTotalTime = grandTotalTime;

  }

  weaklyPercent(grandTotalTime: any) {
    let totalHoursRequired = 40;
    let workedHours = this.convertTimeToHours(grandTotalTime);
    let value = (workedHours / totalHoursRequired) * 100;
    this.weaklyHours = Math.round(value);
    return this.weaklyHours;
    // console.log("This is total percentage of hours worked:", this.totalMonthlyValue);
  }


}