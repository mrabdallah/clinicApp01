import { Routes } from '@angular/router';

import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { ClinicComponent } from './clinic/clinic.component';
import { MyClinicsComponent } from './my-clinics/my-clinics.component';
import { EditClinicComponent } from './edit-clinic/edit-clinic.component';
import { ClinicsComponent } from './clinics/clinics.component';
//import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'patient/:id', component: PatientDetailsComponent },
  { path: 'myclinics', component: MyClinicsComponent },
  { path: 'clinic/:id', component: ClinicComponent },
  { path: 'clinics', component: ClinicsComponent },
  { path: 'clinics/edit/:id', component: EditClinicComponent },
  //{ path: 'edit_schedule', component: EditScheduleComponent },
];
