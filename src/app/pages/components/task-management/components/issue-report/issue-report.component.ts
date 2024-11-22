import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FirestoreService } from '@services/firestore.service';
import { ImageServiceService } from '@services/image-service.service';
import { IssueReportService } from '@services/issue/issue-report.service';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Editor, EditorModule } from 'primeng/editor';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-issue-report',
  standalone: true,
  imports: [DialogModule, FormsModule, DropdownModule, EditorModule, HttpClientModule, CommonModule, ReactiveFormsModule],
  providers: [ImageServiceService],
  templateUrl: './issue-report.component.html',
  styleUrl: './issue-report.component.scss'
})
export class IssueReportComponent {
  text!: any;
  images: { url: string; name: string }[] = [];
  projects$!: Observable<any[]>;
  allIssueReported!: Observable<any[]>;
  allProjectName: any;
  allGetAllIssue: any;
  allData: any;
  filterData: any;
  visible: boolean = false;
  selectedBug: any; 

  dropdownProject: any[] = [
    { name: 'Story' , icon: 'pi pi-bullseye text-white bg-red-600 p-1 rounded-sm'},
    { name: 'Task' , icon: 'pi pi-bullseye text-white bg-red-600 p-1 rounded-sm'},
    { name: 'Bug' , icon: 'pi pi-bullseye text-white bg-red-600 p-1 rounded-sm'},
    { name: 'Epic' , icon: 'pi pi-bullseye text-white bg-red-600 p-1 rounded-sm'},
    { name: 'Improvment' , icon: 'pi pi-bullseye text-white bg-red-600 p-1 rounded-sm'},
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
    reporterName: new FormControl(''),
    summary: new FormControl(''),
    description: new FormControl(''),
    imageUrl: new FormControl(''),

  });

  constructor(
    private router: Router
    , private sanitizer: DomSanitizer
    , private imageService: ImageServiceService
    , private firestore: Firestore
    , private issueService: IssueReportService
    , private firestoreService: FirestoreService, private _fb: FormBuilder) {
    this.getProject();
    this.getAllIssue();
    this.getAllIss();

  }

  getProject() {
    const projectsCollection = collection(this.firestore, 'projects');
    this.projects$ = collectionData(projectsCollection);
  }

  getAllIssue() {
    const projectsCollection = collection(this.firestore, 'codeteck_bugsReports');
    this.allIssueReported = collectionData(projectsCollection);
  }

  ngOnInit() {
    this.getAllUserProfiles();
    this.getproducts();
    this.text = "<p>PAkistan</p>"
  }

  pactValue(data: any) {
    this.router.navigate(['task-management/issue', 4]);
    // console.log("Patch Data:", data.description);
    // this.profileForm.patchValue(data);
    // this.visible = true;
    // this.text = data.description
  }


  getAllIss() {

    this.allIssueReported.subscribe(data => {
      this.allGetAllIssue = data;
      console.log(this.allGetAllIssue);
    });


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
    this.images.splice(index, 1);
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
      reporterName: this.profileForm.value.reporterName,
      summary: this.profileForm.value.summary,
      imageUrl: this.images[0]?.url ? this.images[0]?.url : 'null',
      description: this.text,
    };

    console.log("This is issue payload:", date, "Project name:", projectData);
    this.issueService.postIssueData(projectData)
      .then((data) => {
        console.log('Project posted successfully', data);
        this.profileForm.reset();
        this.visible = false;
      })
      .catch((error) => console.error('Error posting project: ', error));
  }
}
