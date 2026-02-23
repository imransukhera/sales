import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  apiURL = 'https://lkk9rhor38.execute-api.us-east-1.amazonaws.com/prod';
  constructor(private firestore: Firestore, private http: HttpClient) { }

  // -----------------------
  // Add Appointment
  // -----------------------
  addAppointment(data: any): Promise<any> {
    const appointCollection = collection(this.firestore, 'imports');
    return addDoc(appointCollection, data);
  }

   // Update an appointment
  updateImports(id: string, data: any): Promise<void> {
    const appointDocRef = doc(this.firestore, `imports/${id}`);
    return updateDoc(appointDocRef, data);
  }

  // Add a single export
addExposrt(data: any): Promise<any> {
  const exportCollection = collection(this.firestore, 'exports');
  return addDoc(exportCollection, data);
}

  // Update an appointment
  updateEports(id: string, data: any): Promise<void> {
    const appointDocRef = doc(this.firestore, `exports/${id}`);
    return updateDoc(appointDocRef, data);
  }
  // Add Export
  // -----------------------
  addExport(data: any): Promise<any> {
    const appointCollection = collection(this.firestore, 'exports');
    return addDoc(appointCollection, data);
  }

  // -----------------------
  getExports(): Observable<any[]> {
    const appointCollection = collection(this.firestore, 'exports');
    return collectionData(appointCollection, { idField: 'id' });
  }

  // -----------------------
  // Get All Appointments
  // -----------------------
  getAllAppointments(): Observable<any[]> {
    const appointCollection = collection(this.firestore, 'imports');
    return collectionData(appointCollection, { idField: 'id' });
  }

  getFilteredImports(): Observable<any[]> {
  return collectionData(collection(this.firestore, 'imports'), { idField: 'id' })
    .pipe(
      map((data: any[]) => {
        const now = new Date();
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(now.getMonth() - 4);

        return data
          .filter(item =>
            item.type === 'Machinery Parts' &&
            new Date(item.dateOfExport) >= fourMonthsAgo &&
            new Date(item.dateOfExport) <= now
          )
          .sort((a, b) =>
            new Date(a.dateOfExport).getTime() -
            new Date(b.dateOfExport).getTime()
          );
      })
    );
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
  deleteExports(id: string): Promise<void> {
    const docRef = doc(this.firestore, `exports/${id}`);
    return deleteDoc(docRef);
  }

  // Delete value
  deleteImport(id: string): Promise<void> {
    const docRef = doc(this.firestore, `imports/${id}`);
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

  sendEmail(data: any) {
    return this.http.post('https://flashbiometricscentre.com/api/wp-json/email/v1/send', data);
  }

  uploadFile(obj: any) {
    return this.http.post(this.apiURL + '/Upload-Image-to-s3', obj);
  }


  getReportsFromS3(data: any) {
    return this.http.post(this.apiURL + '/Upload-Image-to-s3', data);
  }

  putReportsFromS3(obj: any): Observable<any> {
    const file = obj.file;
    const uploadUrl = obj.uploadUrl;

    return from(
      fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type // e.g., application/pdf or image/png
        },
        body: file // <-- raw binary data
      }).then(response => {
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        return { message: 'Upload successful' };
      })
    );
  }

  // Add Reciept 
  addReciept(data: any): Promise<any> {
    const appointCollection = collection(this.firestore, 'Receipt');
    return addDoc(appointCollection, data);
  }

  // ✅ Get all receipts (returns Observable)
  getReceipts(): Observable<any[]> {
    const appointCollection = collection(this.firestore, 'Receipt');
    return collectionData(appointCollection, { idField: 'id' });
  }

}
