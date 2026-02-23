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
  apiKey: "AIzaSyBsENm1L1na-N7WJxE1IN2XaHiFqwEnHOk",
  authDomain: "system-c3c5e.firebaseapp.com",
  projectId: "system-c3c5e",
  storageBucket: "system-c3c5e.firebasestorage.app",
  messagingSenderId: "230173558668",
  appId: "1:230173558668:web:690bfc13afce202e47b8a9",
  measurementId: "G-JD0NXTPEPS"
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
