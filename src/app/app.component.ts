import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'workasio';
  data!: any;
  loading: boolean = false;

  constructor(private firestore: Firestore, private toaster: ToastrService,) { }

  ngOnInit(): void {
    this.loadData();

    setInterval(() => {
      if (!navigator.onLine) {
        this.toaster.error('No Internet Connection')
        this.loading = true;

      }else{
        this.loading = false;
      }
    }, 5000); 
  }

  async loadData(): Promise<void> {
    const dataCollection = collection(this.firestore, 'your-collection');
    const dataSnapshot = await getDocs(dataCollection);
    this.data = dataSnapshot.docs.map(doc => doc.data());
  }
}
