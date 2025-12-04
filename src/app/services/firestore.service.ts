import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, DocumentSnapshot, collection, collectionData, QuerySnapshot, getDocs } from '@angular/fire/firestore';
import { query, updateDoc, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  collectionName: any;
  userCollectionName: any;
  userproducts: any

  constructor(private firestore: Firestore) { }

  async addTimelog(companyID: any, name: string, day: string, data: any): Promise<void> {
    this.collectionName = `${companyID}timelog`
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

  async daleteTimelog(companyID: any, name: string, day: string, data: any, indexToRemove?: number): Promise<void> {
    this.collectionName = `${companyID}timelog`

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
    companyID: any,
    name: string,
    day: string,
    data: any,
    indexToUpdate?: number
  ): Promise<void> {
    this.collectionName = `${companyID}timelog`

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

  async getTimelog(companyID: any, name: string): Promise<any> {
    this.collectionName = `${companyID}timelog`

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

  async getallTimelog(companyID: any): Promise<any> {
    this.collectionName = `${companyID}timelog`

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

  async getuserProfile(companyID: any, name: string): Promise<any> {
    this.userCollectionName = `${companyID}users`
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

  async getuserProfil(companyID: any, name: string): Promise<any> {
    this.userCollectionName = 'users'
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

  async getProducts(companyID: any, name: string): Promise<any> {
    this.userproducts = `${companyID}projects`
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

  getAllUserProfiles(companyID: any): Observable<any[]> {
    const usersCollection = collection(this.firestore, `${companyID}products`);
    console.log(usersCollection)
    return collectionData(usersCollection, { idField: 'id' });
  }


  async checkin(companyID: any, name: string, day: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${companyID}attendancePortal`, name);

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


  async checkOut(companyID: any, name: string, day: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${companyID}attendancePortal`, name);

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
        // existingData[day]['data'].push(data);
        console.log("no fonud existing data ")
      }

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  async AcceptRequest(companyID: any, name: string, day: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${companyID}attendancePortal`, name);

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
        console.log("no fonud existing data ")
      }

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  // async SendRequest(name: any, data: any): Promise<void> {
  //   const projectDocRef = doc(this.firestore, `attendance_request/${name}`);
  //   try {
  //     await setDoc(projectDocRef, { ...data }, { merge: true });
  //     console.log(`Document with ID ${name} successfully written!`);
  //   } catch (error) {
  //     console.error('Error writing document: ', error);
  //   }
  // }

  async SendRequest(companyID: any, name: any, day: any, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${companyID}attendance_request`, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      let existingData = docSnapshot.exists() ? docSnapshot.data() : {};

      if (!existingData[day]) {
        existingData[day] = {};
      }
      if (!existingData[day]['data']) {
        existingData[day]['data'] = [];
      }
      console.log("Final Data to Set:", JSON.stringify(existingData, null, 2));

      const existingIndex = existingData[day]['data'].findIndex((entry: any) => entry.id === data.id);

      if (existingIndex !== -1) {
        existingData[day]['data'][existingIndex] = data;
        console.log("update")
      } else {
        existingData[day]['data'].push(data);
        console.log("push")
      }

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
      console.error('Error adding document: ', error);
    }

  }
  async daleterequest(companyID: any, name: string, day: string, data: any, indexToRemove?: number): Promise<void> {
    const docRef = doc(this.firestore, `${companyID}attendance_request`, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      let existingData = docSnapshot.exists() ? docSnapshot.data() : {};


      console.log("Available keys:", Object.keys(existingData));

      const foundKey = Object.keys(existingData).find(key => key.includes(day));

      if (foundKey) {

        delete existingData[foundKey];
        await setDoc(docRef, existingData);
        console.log(`Successfully updated document after deleting ${foundKey}`);
      } else {
        console.log(`Day ${day} not found in the document`);
      }


      // await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
    }
  }


  getRequest(companyID: any): Observable<any[]> {
    const usersCollection = collection(this.firestore, `${companyID}attendance_request`);
    return collectionData(usersCollection, { idField: 'id' });
  }



  async getAttendanceRecord(companyID: any, name: string): Promise<any> {
    const docRef = doc(this.firestore, `${companyID}attendancePortal`, name);

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

  async getallData(companyID: any): Promise<any> {
    this.collectionName = `${companyID}timelog`

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

  getAllUser(companyID: any): Observable<any[]> {
    const usersCollection = collection(this.firestore, `${companyID}users`);
    return collectionData(usersCollection, { idField: 'id' });
  }

  getAttendance(companyID: any): Observable<any[]> {
    const usersCollection = collection(this.firestore, `${companyID}attendancePortal`);
    return collectionData(usersCollection, { idField: 'id' });
  }



  async submitleave(companyID: any, name: any, day: any, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${companyID}leave_request`, name);
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

  async leaveupdate(companyID: any, name: string, day: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${companyID}leave_request`, name);

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
        // existingData[day]['data'].push(data);
        console.log("no fonud existing data ")
      }

      await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  async leavedelete(companyID: any, name: string, day: string, data: any, indexToRemove?: number): Promise<void> {
    const docRef = doc(this.firestore, `${companyID}leave_request`, name);

    try {
      const docSnapshot: DocumentSnapshot = await getDoc(docRef);
      let existingData = docSnapshot.exists() ? docSnapshot.data() : {};


      console.log("Available keys:", Object.keys(existingData));

      const foundKey = Object.keys(existingData).find(key => key.includes(day));

      if (foundKey) {

        delete existingData[foundKey];
        await setDoc(docRef, existingData);
        console.log(`Successfully updated document after deleting ${foundKey}`);
      } else {
        console.log(`Day ${day} not found in the document`);
      }


      // await setDoc(docRef, existingData, { merge: true });
    } catch (error) {
    }
  }

  getleave(companyID: any): Observable<any[]> {
    const usersCollection = collection(this.firestore, `${companyID}leave_request`);
    return collectionData(usersCollection, { idField: 'id' });
  }

}
