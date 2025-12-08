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
const firebaseConfig = {
  apiKey: "AIzaSyA7x0IlRGupuH836mnL2c9i39_tRHsxD0A",
  authDomain: "fir-adm-1e34d.firebaseapp.com",
  projectId: "fir-adm-1e34d",
  storageBucket: "fir-adm-1e34d.firebasestorage.app",
  messagingSenderId: "362570340069",
  appId: "1:362570340069:web:4f159b4d00f80f5ac7e60c",
  measurementId: "G-2KYMFF77ZM"
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideRouter(routes),
    provideClientHydration(),
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
