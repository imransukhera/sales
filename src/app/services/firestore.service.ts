import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, DocumentSnapshot, collection, collectionData, QuerySnapshot, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private collectionName = 'timelog';
  private userCollectionName = 'users'
  userproducts = 'projects'

  constructor(private firestore: Firestore) { }

  async addTimelog(name: string, day: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      let existingData = docSnapshot.exists() ? docSnapshot.data() : {};
      if (!existingData[day]) {
        existingData[day] = {};
      }
      if (!existingData[day]['data']) {
        existingData[day]['data'] = [];
      }

      existingData[day]['data'].push(data);

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  async daleteTimelog(name: string, day: string, data: any, indexToRemove?: number): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      let existingData = docSnapshot.exists() ? docSnapshot.data() : {};

      if (!existingData[day]) {
        existingData[day] = {};
      }
      if (!existingData[day]['data']) {
        existingData[day]['data'] = [];
      }

      if (typeof indexToRemove === 'number') {
        existingData[day]['data'].splice(indexToRemove, 1);
      } else {
        existingData[day]['data'].push(data);
      }

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
    }
  }


  async updateTimelog(
    name: string,
    day: string,
    data: any,
    indexToUpdate?: number
  ): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      let existingData = docSnapshot.exists() ? docSnapshot.data() : {};
      if (!existingData[day]) {
        existingData[day] = {};
      }
      if (!existingData[day]['data']) {
        existingData[day]['data'] = [];
      }

      if (typeof indexToUpdate === 'number') {

        existingData[day]['data'][indexToUpdate] = data;
      } else {

        existingData[day]['data'].push(data);
      }

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
      console.error('Error adding or updating document: ', error);
    }
  }

  async getTimelog(name: string): Promise<any> {
    const docRef = doc(this.firestore, this.collectionName, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return docSnapshot.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      return null;
    }
  }

  async getallTimelog(): Promise<any> {
    const docRef = doc(this.firestore, this.collectionName);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return docSnapshot.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      return null;
    }
  }

  async getuserProfile(name: string): Promise<any> {
    const docRef = doc(this.firestore, this.userCollectionName, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return docSnapshot.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      return null;
    }
  }

  async getProducts(name: string): Promise<any> {
    const docRef = doc(this.firestore, this.userproducts, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return docSnapshot.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      return null;
    }
  }

  getAllUserProfiles(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'products');
    console.log(usersCollection)
    return collectionData(usersCollection, { idField: 'id' });
  }


  async checkin(name: string, day: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, "attendancePortal", name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      let existingData = docSnapshot.exists() ? docSnapshot.data() : {};
      let dataName = 'data'
      if (!existingData[day]) {
        existingData[day] = {};
      }
      if (!existingData[day]['data']) {
        existingData[day]['data'] = [];
      }

      existingData[day]['data'].push(data);

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
      console.error('Error adding document: ', error);
    }

  }

  async checkOut(name: string, day: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, "attendancePortal", name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      let existingData = docSnapshot.exists() ? docSnapshot.data() : {};

      if (!existingData[day]) {
        existingData[day] = {};
      }
      if (!existingData[day]['data']) {
        existingData[day]['data'] = [];
      }

      const existingIndex = existingData[day]['data'].findIndex((entry: any) => entry.id === data.id);

      if (existingIndex !== -1) {
        existingData[day]['data'][existingIndex] = data;
      } else {
        existingData[day]['data'].push(data);
      }

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  async SendRequest(name: any, data: any): Promise<void> {
    const projectDocRef = doc(this.firestore, `attendance_request/${name}`);
    try {
      await setDoc(projectDocRef, { ...data }, { merge: true });
      console.log(`Document with ID ${name} successfully written!`);
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  }

  // async SendRequest(name: any, data: any): Promise<void> {
  //   const docRef = doc(this.firestore, "attendance_request", name);
  //   try {
  //     const docSnapshot: DocumentSnapshot = await getDoc(docRef);
  //     let existingData = docSnapshot.exists() ? docSnapshot.data() : {};

  //     if (!Array.isArray(existingData['data'])) {
  //       existingData['data'] = [];
  //     }

  //     existingData['data'].push(data);
  //     console.error('Adding document:', existingData);

  //     await setDoc(docRef, existingData);
  //   } catch (error) {
  //     console.error('Error adding document: ', error);
  //   }

  // }

  getRequest(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'attendance_request');
    return collectionData(usersCollection, { idField: 'id' });
  }


  async getAttendanceRecord(name: string): Promise<any> {
    const docRef = doc(this.firestore, 'attendancePortal', name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        return docSnapshot.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      return null;
    }
  }

  async getallData(): Promise<any> {
    const colRef = collection(this.firestore, this.collectionName);

    try {
      const querySnapshot: QuerySnapshot = await getDocs(colRef);
      const allData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return allData;
    } catch (error) {
      console.error('Error getting documents: ', error);
      return null;
    }
  }

  getAllUser(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' });
  }

  getAttendance(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'attendancePortal');
    return collectionData(usersCollection, { idField: 'id' });
  }


}
