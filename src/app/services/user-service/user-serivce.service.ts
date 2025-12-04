import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, DocumentSnapshot, collection, collectionData, QuerySnapshot, getDocs, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSerivceService {
  private collectionName = 'users';  // Collection name

  constructor(private firestore: Firestore) { }

  // Function to post data to Firestore
  async addUserData(id: any, data: any): Promise<void> {
    const projectDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    try {
      await setDoc(projectDocRef, { ...data }, { merge: true });
      console.log(`Document with ID ${id} successfully written!`);
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }
  // Function to post data to Firestore
  async addUserCompany(comapnyID: any, id: any, data: any): Promise<void> {
    const projectDocRef = doc(this.firestore, `${comapnyID}${this.collectionName}/${id}`);
    try {
      await setDoc(projectDocRef, { ...data }, { merge: true });
      console.log(`Document with ID ${id} successfully written!`);
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }

  // Function to post data to Firestore
  async updateProjectData(id: any, data: any): Promise<void> {
    const projectDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    try {
      // Using { merge: true } will merge the new data with the existing document
      await setDoc(projectDocRef, { ...data }, { merge: true });
      console.log(`Document with ID ${id} successfully written or updated!`);
    } catch (error) {
      console.error('Error writing or updating document: ', error);
    }
  }



  async deleteProjectData(id: any): Promise<void> {
    const projectDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    try {
      await deleteDoc(projectDocRef);
      console.log(`Document with ID ${id} successfully deleted!`);
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  }

}