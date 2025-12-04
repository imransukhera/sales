import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, DocumentSnapshot, collection, collectionData, QuerySnapshot, getDocs, deleteDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProjectServiceService {
  private collectionName = 'projects';  // Collection name
  companyID: any;
  constructor(private firestore: Firestore, private route: ActivatedRoute) {
  }

  async postProjectData(companyID: any, id: any, data: any): Promise<void> {
    console.log("DJASD", this.companyID)
    const projectDocRef = doc(this.firestore, `${companyID}${this.collectionName}/${id}`);
    try {
      await setDoc(projectDocRef, { ...data });
      console.log(`Document with ID ${id} psoted written or updated!`);
    } catch (error) {
      console.error('Error writing or post document: ', error);
    }
  }

  // Function to post data to Firestore
  async updateProjectData(companyID: any, id: string, data: any): Promise<void> {
    const projectDocRef = doc(this.firestore, `${companyID}${this.collectionName}/${id}`);
    try {
      await setDoc(projectDocRef, { id, ...data }, { merge: true });
      console.log(`Document with ID ${id} successfully written!`);
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }

  async deleteProjectData(companyID: any, id: string): Promise<void> {
    const projectDocRef = doc(this.firestore, `${companyID}${this.collectionName}/${id}`);
    try {
      await deleteDoc(projectDocRef);
      console.log(`Document with ID ${id} successfully deleted!`);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  }

}
