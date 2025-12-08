import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc
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

  // -----------------------
  // Get Appointment by ID
  // -----------------------
  getAppointmentById(id: string): Promise<any> {
    const docRef = doc(this.firestore, `appointments/${id}`);
    return getDoc(docRef);
  }
}
