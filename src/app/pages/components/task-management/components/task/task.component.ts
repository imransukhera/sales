import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageServiceService } from '@services/image-service.service';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    TableModule,
    DropdownModule,
    FormsModule,
    ProgressBarModule,
    DialogModule
  ],
  providers: [ImageServiceService],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent implements OnInit {
  imageUrl: string | null = null;
  loading: boolean = false;
  taskstatus: any;
  visible: boolean = false;
  detail: any = {};
  constructor(private imageService: ImageServiceService) { }
  ngOnInit(): void {
    this.taskstatus = [
      { name: '20%' },
      { name: '50%' },
      { name: '80%' },
      { name: '100%' },
    ];
  }

  item = [
    { project: 'Tecklogs', task: 'checking time', date: 'Thu 23, 2024', status: 'Pending...', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjs lakjdljaljsdkaljsdl klksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdka ljsdlklksjdlajd lkajkldjal jdlajklajlkdjsl akjdljaljsdkaljsdlklksjdlajd lkajkldjaljdla jklajlkdjslakjdljaljsd kaljsdlk lksjdlajdlkajkldjaljdlajklajlkdjslakjd ljaljsdkal jsdlklksjdlajdl kajkldjaljdl ajklajlkdj slakjdljaljsdkal jsdlklksjdlajdlka jkldjaljdlajklajlkdjslakjdlj aljsdkaljsdlklksjdlajd lkajkldjaljdlajklaj lkdjslakjdljaljsdkaljsd lklksjdlajdlkajkldjaljdlajkl ajlkdjslakjdljaljsdkaljsdlklksjd lajdlkajkldjaljdlajklajlk djslakjdljaljsdkaljsdlk lksjdlajdlkajkl djaljdlajklajlkdjslakjdlja ljsdkaljsdlklksjdlajdlkaj kldjaljdlajklajlkdjsl akjdljaljsdkaljsdlk' },
    { project: 'Flash security', task: 'checking time', date: 'Thu 22, 2024', status: 'Pending...', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk' },
    { project: 'Tecklogs', task: 'checking time', date: 'Thu 21, 2024', status: 'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk' },
    { project: 'Flash security', task: 'checking time', date: 'Thu 20, 2024', status: 'Pending...', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk' },
    { project: 'Flash security', task: 'checking time', date: 'Thu 1, 2024', status: 'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk' },
    { project: 'Flash security', task: 'checking time', date: 'Thu 2, 2024', status: 'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk' },
    { project: 'Flash security', task: 'checking time', date: 'Thu 22, 2024', status: 'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk' },
    { project: 'Flash security', task: 'checking time', date: 'Thu 22, 2024', status: 'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk' },
    { project: 'Flash security', task: 'checking time', date: 'Thu 22, 2024', status: 'Complete', description: 'aksdhkajskjalksjdlajdlkajkldjaljdlajklajlkdjslakjdljaljsdkaljsdlk' },


  ]

  action(index: any) {
    console.log("index", index)
  }

  taskdetail(data: any) {
    this.visible = true;
    console.log("data", JSON.stringify(data))
    this.detail = data;
    console.log("data", this.detail)

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imageService.uploadImage(file).subscribe(
        (response) => {
          this.imageUrl = response.data.url;
          console.log('Image URL:', this.imageUrl);
        },
        (error) => {
          console.error('Image upload failed', error);
        }
      );
    }
  }
}
