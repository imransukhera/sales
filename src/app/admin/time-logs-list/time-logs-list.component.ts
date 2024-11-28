import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';
import { ToastrService } from '@services/toastr.service';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import jsPDF from 'jspdf';
import { CarouselModule } from 'primeng/carousel';
import { RouterLink } from '@angular/router';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-time-logs-list',
  standalone: true,
  imports: [
    TableModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    CarouselModule,
    RouterLink,
    TooltipModule
  ],
  templateUrl: './time-logs-list.component.html',
  styleUrl: './time-logs-list.component.scss'
})
export class TimeLogsListComponent implements OnInit {


  allData: any;
  visible: boolean = false;
  issueName: any;
  issueNameVlaue: any;
  projects$!: Observable<any[]>;
  dateOf: any;
  namehg: any;
  entry: any;
  index: any;
  description: any;
  timeSpent: any;
  startTime: any;
  employeeDropdown: any;
  allProjectName: any;
  filterproject: any;
  rangeDates: any;
  updateBtn = false;
  employeeName: any;
  searchValue = false;
  getAllData: any;
  value: any;
  profileData: any;
  locathostData: any;
  grandTotalTime: any;
filterdata: any;
  userdata: any[] = [];
  responsiveOptions: any[] | undefined;
  innerdata: any;


  constructor(
    private firestoreService: FirestoreService
    , private firestore: Firestore
    , private toaster: ToastrService ,
   
  ) {
    const today = new Date();
    this.dateOf = today;
    const projectsCollection = collection(this.firestore, 'projects');
    this.projects$ = collectionData(projectsCollection);
  }

  ngOnInit(): void {
    this.getAlldata();
    this.getproducts();
    this.getAllUserProfiles();
    this.locathostData = localStorage.getItem('userProfile');
    this.profileData = JSON.parse(this.locathostData);
    this.lastMonthDate();
    this.getAllUserProfilesdata();
    this.carousel();
  }

  lastMonthDate() {
    const today = new Date();
    const lastSunday = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastFriday = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.rangeDates = [lastSunday, lastFriday];

  }

  // Method to be called on input change
  changeIf() {
    console.log("dbfdb")
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

  getAlldata() {
    this.firestoreService.getallData().then((data) => {
      const reorganizedData: any = [];

      for (const entry of data) {
        Object.keys(entry).forEach(key => {
          if (key !== 'id') {
            reorganizedData.push({
              date: key,
              name: entry[key].data[0]?.name || [],
              data: entry[key].data || []
            });
          }
        });
      }
      const startDate = new Date(this.rangeDates[0]);
      const endDate = new Date(this.rangeDates[1]);
      const filteredData = reorganizedData.filter((data: any) => {
        const recordDate = new Date(data?.date);
        return recordDate >= startDate && recordDate <= endDate;
      });
      const dateDate = reorganizedData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      this.tableData(dateDate);
this.search();
    });
  }

  tableData(data: any) {
    this.allData = data;
    this.getAllData = data;
  }

  getDateKeys(log: any): string[] {
    return Object.keys(log).filter(key => key !== 'id');
  }

  getproducts() {
    this.projects$.subscribe(data => {
      this.issueName = data;
      this.allProjectName = data;
    });
  }

  deleteIndex() {
    const filterName = this.employeeDropdown.filter((data: any) => data.name === this.namehg?.name);

    const day = this.entry.date;
    const name = filterName[0].username;
    const data = {
      date: this.entry.date,
    };
    this.firestoreService.daleteTimelog(name, day, data, this.index)
      .then(() => {
        this.toaster.showSuccess('Deleted successfully');
        this.getAlldata();
        this.visible = false;

      })
      .catch(error => {
        console.error('Error adding data: ', error);
      });
  }

  


  updateUI() {
    const time = this.startTime.toTimeString().split(' ')[0];
    console.log("this is all user data:", this.employeeDropdown);
    const filterName = this.employeeDropdown.filter((data: any) => data.name === this.namehg?.name);
    const projectCode = this.issueName.filter((data: any) => data?.name === this.issueNameVlaue);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
    const formattedDate = this.dateOf.toLocaleDateString('en-US', options);
    const day = formattedDate;
    const name = filterName[0].username;
    const data = {
      date: formattedDate,
      issueName: this.issueNameVlaue,
      spentTame: this.timeSpent,
      startTime: time,
      description: this.description,
      name: this.namehg?.name,
      projectCode: projectCode[0].id
    };

    console.log("this data:", name, "value", day, "value 1", data, "index", this.index, "value:", filterName);

    this.firestoreService.updateTimelog(name, day, data, this.index)
      .then(() => {
        this.toaster.showSuccess('Updated successfully');
        this.visible = false;
        this.getAlldata();
      })
      .catch(error => {
        console.error('Error adding data: ', error);
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

  getAllUserProfiles() {
    this.firestoreService.getAllUser().subscribe(
      (data) => {
        this.employeeDropdown = data;
      });
  }



  processTimelo(data: any) {
    let grandTotalHours = 0;
    let grandTotalMinutes = 0;
    for (const date in data) {
      if (data.hasOwnProperty(date)) {
        const entry = data[date];
        entry.data?.forEach((log: any) => {
          const timeString = log.spentTame.toLowerCase();
          const hourMatch = timeString.match(/(\d+)h/)?.[1] || 0;
          const minuteMatch = timeString.match(/(\d+)m/)?.[1] || 0;
          grandTotalHours += parseInt(hourMatch);
          grandTotalMinutes += parseInt(minuteMatch);
        });
      }
    }
    grandTotalHours += Math.floor(grandTotalMinutes / 60);
    grandTotalMinutes %= 60;
    return `${grandTotalHours}h ${grandTotalMinutes}m`;
  }

  clear(){
    this.employeeName = "";
    this.allProjectName ="";
    this.filterproject = null;
    this.search();
  }

  search() {
    const startDate = new Date(this.rangeDates[0]);
    const endDate = new Date(this.rangeDates[1]);
    const filteredData = this.getAllData.filter((data: any) => {
      const recordDate = new Date(data?.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
    if (this.employeeName?.name) {
      this.filterdata = filteredData.filter((data: any) => data?.name === this.employeeName?.name );
      if(this.allProjectName?.name){
        this.filterdata = this.filterdata.filter((item: any) => 
          item.data?.some((innerData: any) => innerData.issueName === this.allProjectName?.name)
        );
        this.filterproject = this.allProjectName?.name;
      }
      
    } else if(this.allProjectName?.name){
      this.filterdata = filteredData.filter((item: any) => 
        item.data?.some((innerData: any) => innerData.issueName === this.allProjectName?.name)
      );
      if (this.employeeName?.name) {
        this.filterdata = this.filterdata.filter((data: any) => data?.name === this.employeeName?.name );
      }
      this.filterproject = this.allProjectName?.name;
      console.log('all project filterdata', this.allData)
      return
    }
    else {
      this.filterdata = filteredData;
      console.log('alldata', this.allData)
    }

    this.innerdata = this.filterdata.flatMap((item: any) => item.data);
  }

  showingDialog(namehg: any, entry: any, index: any) {
    this.description = entry?.description;
    this.issueNameVlaue = entry?.issueName;
    this.timeSpent = entry?.spentTame;
    const timeString = entry?.startTime;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds);
    this.startTime = date;
    this.dateOf = new Date(entry?.date);
    this.namehg = namehg;
    this.entry = entry;
    this.index = index;
    this.visible = true;
    console.log("this is table value:", namehg, entry, this.index);
  }

  // Helper function to convert time like '7h', '30m' into minutes
  convertToMinutes(time: string): number {
    const hourMatch = time.match(/(\d+)h/);
    const minuteMatch = time.match(/(\d+)m/);

    let hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    let minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    return hours * 60 + minutes;
  }

  filterlogdata(data: any){
    if(this.filterproject){
      const filterdataproject = data.filter((item: any)=> item.issueName === this.allProjectName.name)
      return this.calculateTotalTime(filterdataproject)
    }else{
      return this.calculateTotalTime(data)
    }


  }

  // Function to calculate the total spent time
  calculateTotalTime(logs: any[]): string {
    let totalMinutes = logs.reduce((acc, log) => acc + this.convertToMinutes(log.spentTame), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  generateExcel() {
    // console.log('called');
    //  this.excelService.exportToExcel();
    let data
    console.log('innerdata', this.innerdata)
    console.log('employeeName', this.allProjectName )

if(this.filterproject){
  data = this.innerdata.filter((item: any)=> item.issueName === this.allProjectName.name)
  // console.log('name', data)
}else{
  data = this.innerdata;
}
  
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet1');
      
      // Add header row dynamically
      console.log('outname', data)
      // const columns = Object.keys(this.innerdata[0]).map((key: any) => ({ header: key, key }));
      // worksheet.columns = columns;
      // console.log('name', columns)
      worksheet.columns = [
        {header: 'Date', key: 'date', width: 20},
        {header: 'Project Code', key: 'projectCode', width: 15},
        {header: 'Project Name', key: 'issueName', width: 30, style:{alignment: { horizontal: 'left' }}},
        {header: 'Employee Name', key: 'name', width: 30},
        {header: 'Description', key: 'description', width: 40},
        {header: 'Hours', key: 'spentTame', width: 10, style:{alignment: { horizontal: 'right' }}},
      ];

      worksheet.getRow(1).font = { bold: true };

      let totalMinutes = 0;  // To accumulate the total minutes
        // Function to parse time in "Xh Ym" format and convert to minutes
  function parseTime(time: string): number {
    let minutes = 0;
    if (time) {
      const hourMatch = time.match(/(\d+)h/);
      const minuteMatch = time.match(/(\d+)m/);
      
      if (hourMatch) {
        minutes += parseInt(hourMatch[1], 10) * 60; // Convert hours to minutes
      }
      if (minuteMatch) {
        minutes += parseInt(minuteMatch[1], 10); // Add minutes
      }
    }
    return minutes;
  }

      // Add data rows dynamically
      data.forEach((item: any) => {
        const time = item.spentTame || '0h 0m';  // Default to '0h 0m' if no hours
        const minutes = parseTime(time); // Convert time to minutes
        
        worksheet.addRow({
        date: item.date,
        projectCode: item.projectCode,
        issueName: item.issueName,
        name: item.name,
        description: item.description,
        spentTame: item.spentTame
      })
    
      totalMinutes += minutes;
  });
      
   // Convert total minutes to "Xh Ym" format
   const totalHours = Math.floor(totalMinutes / 60);
   const remainingMinutes = totalMinutes % 60;
   const totalTimeFormatted = `${totalHours}h ${remainingMinutes}m`;
 
   // Add total hours row at the bottom
   const totalRow = worksheet.addRow({
    date: 'Total',
        projectCode: '',
        issueName: '',
        name: '',
        description: '',
        spentTame: totalTimeFormatted
   });

   totalRow.font = { bold: true };
   const date = new Date().toISOString();
      // Write the workbook to a buffer and save as a file
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `TimeLogsExcelsheet${date}.xlsx`);
      });
    

   }

  totalTime(data: any) {
    console.log("this is all data", data);
    return data;
  }

  getAllUserProfilesdata() {
    this.firestoreService.getAllUser().subscribe(
      (data) => {
        this.userdata = data;
      });
  }

  isSelected(data: any): boolean {
    const currentDate = new Date().toDateString(); 
    const filteredData = this.allData.some((selected = this.allData) =>  new Date(selected.date).toDateString() === currentDate );
    if (!filteredData) {
      return this.allData.some((selected = this.allData) =>  selected.name === data.name);
      
    } else{
      return this.allData.some((selected = this.allData) =>  selected.name === data.name && new Date(selected.date).toDateString() === currentDate );

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


  totalHours: number = 0;

  calculateTotalSpentTime(logEntries: any[]): string {
    let totalHours = 0;
    let totalMinutes = 0;

    // Iterate over each top-level log entry
    logEntries?.forEach(log => {
      if (log.data && Array.isArray(log.data)) {
        // Iterate over each item in the 'data' array
        log.data.forEach((item: any) => {

          if (item.issueName === this.filterproject) {
            const time = item.spentTame;

            if (time) {
              // Match and parse hours (e.g., '7h' or '1h')
              const hourMatch = time.match(/(\d+)h/);
              if (hourMatch) {
                const hours = parseInt(hourMatch[1], 10); // Convert to number
                totalHours += hours; // Sum up the hours
              }
  
              // Match and parse minutes (e.g., '30m')
              const minuteMatch = time.match(/(\d+)m/);
              if (minuteMatch) {
                const minutes = parseInt(minuteMatch[1], 10); // Convert to number
                totalMinutes += minutes; // Sum up the minutes
              }
            }
          }else{
            const time = item.spentTame;

            if (time) {
              // Match and parse hours (e.g., '7h' or '1h')
              const hourMatch = time.match(/(\d+)h/);
              if (hourMatch) {
                const hours = parseInt(hourMatch[1], 10); // Convert to number
                totalHours += hours; // Sum up the hours
              }
  
              // Match and parse minutes (e.g., '30m')
              const minuteMatch = time.match(/(\d+)m/);
              if (minuteMatch) {
                const minutes = parseInt(minuteMatch[1], 10); // Convert to number
                totalMinutes += minutes; // Sum up the minutes
              }
            }
          }
        });
      }
    });

    // Convert minutes to hours if totalMinutes >= 60
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60; // Remainder minutes after converting to hours

    return `${totalHours}h ${totalMinutes}m`; // Return the formatted time string
  }



}
