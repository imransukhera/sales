import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  // -----------------------
  // Add Appointment
  // -----------------------
  addAppointment(data: any): Promise<any> {
    const appointCollection = collection(this.firestore, 'appointments');
    return addDoc(appointCollection, data);
  }

  // -----------------------
  // Get All Appointments
  // -----------------------
  getAllAppointments(): Observable<any[]> {
    const appointCollection = collection(this.firestore, 'appointments');
    return collectionData(appointCollection, { idField: 'id' });
  }

  // Update an appointment
  updateAppointment(id: string, data: any): Promise<void> {
    const appointDocRef = doc(this.firestore, `appointments/${id}`);
    return updateDoc(appointDocRef, data);
  }


  // -----------------------
  // Get Appointment by ID
  // -----------------------
  getAppointmentById(id: string): Promise<any> {
    const docRef = doc(this.firestore, `appointments/${id}`);
    return getDoc(docRef);
  }
  // Delete value
  deleteAppointment(id: string): Promise<void> {
    const docRef = doc(this.firestore, `appointments/${id}`);
    return deleteDoc(docRef);
  }

    // -----------------------
  // Get All Appointments
  // -----------------------
  getContactPage(): Observable<any[]> {
    const appointCollection = collection(this.firestore, 'contact-page');
    return collectionData(appointCollection, { idField: 'id' });
  }

   // Delete value
  deleteContact(id: string): Promise<void> {
    const docRef = doc(this.firestore, `contact-page/${id}`);
    return deleteDoc(docRef);
  }


}
