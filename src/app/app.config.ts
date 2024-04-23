import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
// import { StoreModule } from '@ngrx/store';
import { provideStore } from '@ngrx/store';
import { reducers, metaReducers } from './ngrx_store/reducers/index'; // Import your reducers and meta-reducers


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
    provideStore(reducers, { metaReducers }),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
      trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
      traceLimit: 75, // maximum stack trace frames to be stored (in case trace option was provided as true)
      connectInZone: true // If set to true, the connection is established within the Angular zone
    })

  ]
};
