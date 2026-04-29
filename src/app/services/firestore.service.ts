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
  limit,
  getDocs,
  Timestamp,
  writeBatch
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

  async batchAddAppointments(records: any[], onProgress?: (done: number, total: number) => void): Promise<void> {
    const appointCollection = collection(this.firestore, 'imports');
    const BATCH_SIZE = 500;
    const total = records.length;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(this.firestore);
      chunk.forEach(record => {
        const ref = doc(appointCollection);
        batch.set(ref, record);
      });
      await batch.commit();
      if (onProgress) onProgress(Math.min(i + BATCH_SIZE, total), total);
    }
  }

   // Update an appointment
  updateImports(id: string, data: any): Promise<void> {
    const appointDocRef = doc(this.firestore, `imports/${id}`);
    return updateDoc(appointDocRef, data);
  }

  // Update an export
  updateExports(id: string, data: any): Promise<void> {
    const appointDocRef = doc(this.firestore, `exports/${id}`);
    return updateDoc(appointDocRef, data);
  }

  // Add Export
  // -----------------------
  addExport(data: any): Promise<any> {
    const appointCollection = collection(this.firestore, 'exports');
    return addDoc(appointCollection, data);
  }

  async batchAddExports(records: any[], onProgress?: (done: number, total: number) => void): Promise<void> {
    const exportCollection = collection(this.firestore, 'exports');
    const BATCH_SIZE = 500;
    const total = records.length;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const chunk = records.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(this.firestore);
      chunk.forEach(record => {
        const ref = doc(exportCollection);
        batch.set(ref, record);
      });
      await batch.commit();
      if (onProgress) onProgress(Math.min(i + BATCH_SIZE, total), total);
    }
  }

  // -----------------------
  getExports(): Observable<any[]> {
    const appointCollection = collection(this.firestore, 'exports');
    return collectionData(appointCollection, { idField: 'id' });
  }

  getExportsPage(pageSize: number = 500): Observable<any[]> {
    const col = collection(this.firestore, 'exports');
    const q = query(col, orderBy('dateOfExport', 'desc'), limit(pageSize));
    return collectionData(q, { idField: 'id' });
  }

  getExportsByDateRange(start: string, end: string): Promise<any[]> {
    const col = collection(this.firestore, 'exports');
    const q = query(col,
      where('dateOfExport', '>=', start),
      where('dateOfExport', '<=', end),
      orderBy('dateOfExport', 'desc')
    );
    return getDocs(q).then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
  }

  // -----------------------
  // Get All Appointments
  // -----------------------
  getAllAppointments(): Observable<any[]> {
    const appointCollection = collection(this.firestore, 'imports');
    return collectionData(appointCollection, { idField: 'id' });
  }

  getAllAppointmentsOnce(): Promise<any[]> {
    const appointCollection = collection(this.firestore, 'imports');
    return getDocs(appointCollection).then(snap =>
      snap.docs.map(d => ({ id: d.id, ...d.data() as any }))
    );
  }

  getImportsPage(pageSize: number = 500): Observable<any[]> {
    const col = collection(this.firestore, 'imports');
    const q = query(col, orderBy('dateOfImport', 'desc'), limit(pageSize));
    return collectionData(q, { idField: 'id' });
  }

  getImportsByDateRange(start: string, end: string): Promise<any[]> {
    const col = collection(this.firestore, 'imports');
    const q = query(col,
      where('dateOfImport', '>=', start),
      where('dateOfImport', '<=', end),
      orderBy('dateOfImport', 'desc')
    );
    return getDocs(q).then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
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
            item.type === 'Parts & Spares' &&
            new Date(item.dateOfImport) >= fourMonthsAgo &&
            new Date(item.dateOfImport) <= now
          )
          .sort((a, b) =>
            new Date(a.dateOfImport).getTime() -
            new Date(b.dateOfImport).getTime()
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
