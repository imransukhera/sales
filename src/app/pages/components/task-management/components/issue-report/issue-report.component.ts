import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '@services/firestore.service';
import { ImageServiceService } from '@services/image-service.service';
import { IssueReportService } from '@services/issue/issue-report.service';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-issue-report',
  standalone: true,
  imports: [DialogModule, DropdownModule, EditorModule, HttpClientModule, CommonModule, ReactiveFormsModule],
  providers: [ImageServiceService],
  templateUrl: './issue-report.component.html',
  styleUrl: './issue-report.component.scss'
})
export class IssueReportComponent {
  images: { url: string; name: string }[] = [];
  projects$!: Observable<any[]>;
  allProjectName: any;
  allData: any;
  filterData: any;
  visible: boolean = true;

  dropdownProject: any[] = [
    { name: 'Story' },
    { name: 'Task' },
    { name: 'Bug' },
    { name: 'Epic' },
    { name: 'Improvment' },
  ];

  bugStatus: any[] = [
    { name: 'Deployment Ready' },
    { name: 'Backlog' },
    { name: 'In Progress' },
    { name: 'In Review' },
    { name: 'Qa In Progress' },
    { name: 'Qa Ready' },
    { name: 'Reopen' },
    { name: 'Done' },
    { name: 'Wont,Do' },
  ];

  showDialog() {
    this.visible = true;
  }

  profileForm = new FormGroup({
    projectName: new FormControl(''),
    issueName: new FormControl(''),
    bugStatus: new FormControl(''),
    assigneeName: new FormControl(''),
    summary: new FormControl(''),
    description: new FormControl(''),
    imageUrl: new FormControl(''),

  });

  constructor(
    private imageService: ImageServiceService
    , private firestore: Firestore
    , private issueService: IssueReportService
    , private firestoreService: FirestoreService) {
    const projectsCollection = collection(this.firestore, 'projects');
    this.projects$ = collectionData(projectsCollection);
  }

  ngOnInit() {
    this.getproducts();
    this.getAllUserProfiles();
  }

  getproducts() {
    this.projects$.subscribe(data => {
      this.allProjectName = data;
      this.filterData = data;
      console.log("All Data:", this.allProjectName);
    });
  }

  getAllUserProfiles() {
    this.firestoreService.getAllUser().subscribe(
      (data) => {
        this.filterData = data;
        this.allData = data;
        console.log("this value:", this.allData);
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        this.imageService.uploadImage(file).subscribe(
          (response) => {
            this.images.push({ url: response.data.url, name: file.name });
            console.log('Uploaded:', response.data.url);
          },
          (error) => {
            console.error('Image upload failed:', error);
          }
        );
      });
    }
  }

  removeImage(index: number): void {
    this.images.splice(index, 1); // Remove the image from the array
  }

  onSumbit() {
    let valu2 = this.images[0]?.url;
    this.profileForm.controls['imageUrl'].setValue(valu2);
    let value = this.profileForm.value;
    console.log("This is value:", value);
    this.postProjectData()
  }

  postProjectData() {
    const date = new Date().toDateString();
    const projectData = {
      date: new Date().toDateString(),
      projectName: this.profileForm.value.projectName,
      issueName: this.profileForm.value.issueName,
      bugStatus: this.profileForm.value.bugStatus,
      assigneeName: this.profileForm.value.assigneeName,
      summary: this.profileForm.value.summary,
      imageUrl: this.images[0]?.url,
      description: this.profileForm.value.description,
    };

    console.log("This is issue payload:", date, "Project name:", projectData);
    this.issueService.postIssueData(date, projectData)
      .then((data) => {
        console.log('Project posted successfully', data);
        this.visible = false;
      })
      .catch((error) => console.error('Error posting project: ', error));
  }
}
