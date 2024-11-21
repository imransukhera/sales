import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, deleteDoc, runTransaction } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class IssueReportService {
  private collectionName = 'codeteck_bugsReports';  // Collection name

  constructor(private firestore: Firestore) { }

  async generateNumericId(): Promise<number> {
    const counterDocRef = doc(this.firestore, 'counters/issues');
    try {

      const newId = await runTransaction(this.firestore, async (transaction) => {
        const counterDoc = await transaction.get(counterDocRef);
        let currentId = counterDoc.exists() ? counterDoc.data()?.['currentId'] : 0;

        const updatedId = currentId + 1;
        transaction.set(counterDocRef, { currentId: updatedId });
        return updatedId;
      });
      return newId;
    } catch (error) {
      console.error('Error generating numeric ID:', error);
      throw new Error('Failed to generate ID');
    }
  }

  async postIssueData(data: any): Promise<void> {
    try {
      const id = await this.generateNumericId();
      const projectDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
      await setDoc(projectDocRef, { ...data, id });
      console.log(`Document with ID ${id} created successfully!`);
    } catch (error) {
      console.error('Error posting project data: ', error);
    }
  }


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

