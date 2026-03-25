import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
const firebaseConfig = {
  apiKey: "AIzaSyDLDOpUaLpaMSB8HWXwRg1Rcjnj9gW8l24",
  authDomain: "system-84f69.firebaseapp.com",
  projectId: "system-84f69",
  storageBucket: "system-84f69.firebasestorage.app",
  messagingSenderId: "501170209988",
  appId: "1:501170209988:web:810d254041327f59a33591",
  measurementId: "G-GKFKFF3M8N"
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    MessageService,
    provideToastr({
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      disableTimeOut: 'extendedTimeOut',
      tapToDismiss: false,
      timeOut: 3000,
      easeTime: 400,
      positionClass: 'toast-top-right',
    }), provideAnimationsAsync(), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideStorage(() => getStorage())
  ]
};
