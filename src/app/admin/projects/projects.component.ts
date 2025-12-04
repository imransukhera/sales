import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectServiceService } from '@services/project-service/project-service.service';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { DialogModule } from 'primeng/dialog';
import { Observable } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FirestoreService } from '@services/firestore.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    TableModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    CommonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  profileData: any;
  locathostData: any;
  visible = false;
  projectId: any;
  projectName: any;
  description: any;
  projects$: Observable<any[]>;
  allProjectName: any;
  filterData: any;
  projectfilter: any;
  employeeDropdown: any;
  employeeName: any;
  update = false;
  companyID: any;
  constructor(
    private projectService: ProjectServiceService
    , private firestore: Firestore,
    private route: ActivatedRoute
    , private firestoreService: FirestoreService,
  ) {
    this.route.parent?.paramMap.subscribe(params => {
      this.companyID = params.get('companyId');
      console.log('Company ID:', this.companyID);
    });

    const projectsCollection = collection(this.firestore, `${this.companyID}projects`);
    this.projects$ = collectionData(projectsCollection);
  }

  ngOnInit() {
    this.locathostData = localStorage.getItem('userProfile');
    this.profileData = JSON.parse(this.locathostData);
    this.getproducts();
    this.getAllUserProfiles();
  }

  postProjectData() {
    const projectId = this.projectId;
    const projectData = {
      id: this.projectId,
      name: this.projectName,
      description: this.description,
    };

    this.projectService.postProjectData(this.companyID, projectId, projectData)
      .then((data) => {
        console.log('Project posted successfully', data);
        this.visible = false;
      })
      .catch((error) => console.error('Error posting project: ', error));
  }

  getproducts() {
    this.projects$.subscribe(data => {
      this.allProjectName = data;
      this.filterData = data;
      console.log("All Data:", this.allProjectName);
    });
  }

  searchRecord() {
    console.log("Search");
    const value = this.filterData.filter((data: any) => data.name === this.projectfilter);
    this.allProjectName = value;

  }

  getAllUserProfiles() {
    this.firestoreService.getAllUser(this.companyID).subscribe(
      (data) => {
        this.employeeDropdown = data;
      });
  }

  deleteField(projectCode: any) {
    this.projectService.deleteProjectData(this.companyID, projectCode)
      .then(() => console.log('Project deleted successfully'))
      .catch((error) => console.error('Error deleting project: ', error));
  }

  updateProjectData() {
    const projectId = this.projectId;
    const projectData = {
      id: this.projectId,
      name: this.projectName,
      description: this.description,
    };

    this.projectService.updateProjectData(this.companyID, projectId, projectData)
      .then(() => {
        console.log('Project posted or updated successfully');
        this.visible = false;
      })
      .catch((error) => console.error('Error posting or updating project: ', error));
  }

  edit(project: any) {
    console.log("this is project Id:", project);
    this.projectId = project?.id;
    this.projectName = project?.name;
    this.description = project?.description;
    this.visible = true;
    this.update = true;
  }



}
