import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DropdownModule,
    FormsModule,
    ProgressBarModule,
    DialogModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent implements OnInit {
  loading: boolean = false;
  taskstatus: any;
  visible: boolean = false;
  detail: any={};

  ngOnInit(): void {
    this.taskstatus =[
      {name: '20%'},
      {name: '50%'},
      {name: '80%'},
      {name: '100%'},
    ];
  }

  item = [
    {project:'Tecklogs' , task:'checking time', date:'Thu 23, 2024', status:'Pending...' , description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjs lakjdljaljsdkaljsdl klksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdka ljsdlklksjdlajd lkajkldjal jdlajklajlkdjsl akjdljaljsdkaljsdlklksjdlajd lkajkldjaljdla jklajlkdjslakjdljaljsd kaljsdlk lksjdlajdlkajkldjaljdlajklajlkdjslakjd ljaljsdkal jsdlklksjdlajdl kajkldjaljdl ajklajlkdj slakjdljaljsdkal jsdlklksjdlajdlka jkldjaljdlajklajlkdjslakjdlj aljsdkaljsdlklksjdlajd lkajkldjaljdlajklaj lkdjslakjdljaljsdkaljsd lklksjdlajdlkajkldjaljdlajkl ajlkdjslakjdljaljsdkaljsdlklksjd lajdlkajkldjaljdlajklajlk djslakjdljaljsdkaljsdlk lksjdlajdlkajkl djaljdlajklajlkdjslakjdlja ljsdkaljsdlklksjdlajdlkaj kldjaljdlajklajlkdjsl akjdljaljsdkaljsdlk'},
    {project:'Flash security' ,task:'checking time', date:'Thu 22, 2024', status:'Pending...', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk'},
    {project:'Tecklogs' , task:'checking time', date:'Thu 21, 2024', status:'Complete' , description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk'},
    {project:'Flash security' ,task:'checking time', date:'Thu 20, 2024', status:'Pending...', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk'},
    {project:'Flash security' ,task:'checking time', date:'Thu 1, 2024', status:'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk'},
    {project:'Flash security' ,task:'checking time', date:'Thu 2, 2024', status:'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk'},
    {project:'Flash security' ,task:'checking time', date:'Thu 22, 2024', status:'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk'},
    {project:'Flash security' ,task:'checking time', date:'Thu 22, 2024', status:'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk'},
    {project:'Flash security' ,task:'checking time', date:'Thu 22, 2024', status:'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk'},


  ]

  action(index: any){
    console.log("index",index)
  }

  taskdetail(data: any){
    this.visible = true;
    console.log("data", JSON.stringify(data))
    this.detail = data;
    console.log("data", this.detail)
    
  }
}
