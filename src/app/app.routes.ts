import { Routes } from '@angular/router';

// import {SecondComponent} from './second/second.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: AuthComponent },
  { path: 'patient/:id', component: PatientDetailsComponent },
  // { path: 'second-component', component: SecondComponent },
];
