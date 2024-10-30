import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { FirestoreService } from '@services/firestore.service';
import { collection } from 'firebase/firestore';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-projects-detail',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './projects-detail.component.html',
  styleUrl: './projects-detail.component.scss'
})
export class ProjectsDetailComponent implements OnInit {
  loading: boolean = false;
  project: any;
  projects$: Observable<any[]>;


  constructor(private firestoreService: FirestoreService, private firestore: Firestore, private toaster: ToastrService) {
    const projectsCollection = collection(this.firestore, 'projects');
    this.projects$ = collectionData(projectsCollection);

  }
ngOnInit(): void {
    this.getproducts()
}

getproducts() {
  this.projects$.subscribe(data => {
    this.project = data;
  });
}


}
