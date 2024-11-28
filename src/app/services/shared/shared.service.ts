import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TimeLogsSheetComponent } from '../../pages/components/dashboard/time-logs-sheet/time-logs-sheet.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarState.asObservable();

  private excelData = new BehaviorSubject<any>(null); // Initial data is null
  excelData$ = this.excelData.asObservable();


  constructor() { }




toggleSidebar(): void {
  const currentState = this.sidebarState.getValue();
  this.sidebarState.next(!currentState);
}

setData(data: any): void {
  this.excelData.next(data); // Update the data
}

getData(): any {
  return this.excelData.value; // Retrieve the current data value
}
 
}
