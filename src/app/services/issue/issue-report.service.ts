import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, deleteDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class IssueReportService {
  private collectionName = 'codeteck_bugsReports';  // Collection name

  constructor(private firestore: Firestore) { }

  async postIssueData(id: any, data: any): Promise<void> {
    const projectDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    try {
      await setDoc(projectDocRef, { ...data });
      console.log(`Document with ID ${id} psoted written or updated!`);
    } catch (error) {
      console.error('Error writing or post document: ', error);
    }
  }

  // Function to post data to Firestore
  async updateProjectData(id: string, data: any): Promise<void> {
    const projectDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    try {
      await setDoc(projectDocRef, { id, ...data }, { merge: true });
      console.log(`Document with ID ${id} successfully written!`);
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }

  async deleteProjectData(id: string): Promise<void> {
    const projectDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    try {
      await deleteDoc(projectDocRef);
      console.log(`Document with ID ${id} successfully deleted!`);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  }

}

