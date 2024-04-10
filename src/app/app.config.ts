import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(
      [
        // provideFirebaseApp(() => initializeApp({
        //   "projectId": "clinicapp-edaa7",
        //   "appId": "1:141256004330:web:05a7231b43a51aecf27d93",
        //   "storageBucket": "clinicapp-edaa7.appspot.com",
        //   "apiKey": "AIzaSyALAtjfwHuANcFocBxVxk-S_yQAM7c7k7E",
        //   "authDomain": "clinicapp-edaa7.firebaseapp.com",
        //   "messagingSenderId": "141256004330", "measurementId": "G-R4D690QHYF"
        // })),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        // provideFirestore(() => getFirestore()),
      ]
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideAnalytics(() => getAnalytics())),
    ScreenTrackingService,
    UserTrackingService,
    importProvidersFrom(provideFirestore(() => getFirestore())),
  ]
};
