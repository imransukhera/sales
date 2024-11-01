import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TimeLogsSheetComponent } from '../../pages/components/dashboard/time-logs-sheet/time-logs-sheet.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private dailyTotalHorse = signal<any>(0);

dailytime: any;

  constructor() { }
  getDailyTotalHorse() {
    return this.dailyTotalHorse;
  }
  updateDailyTotalHorse(newTotal: any) {
    this.dailyTotalHorse.set(newTotal);
  }

//   time(){
// this.dailytime = this.timelogs.dailyTotalHorse;
// console.log('tiem', this.dailytime)
// return this.dailytime;
//   }
 
}
