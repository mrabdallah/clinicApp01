import { Routes } from '@angular/router';

import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { EditScheduleComponent } from './edit-schedule/edit-schedule.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'patient/:id', component: PatientDetailsComponent },
  { path: 'edit_schedule', component: EditScheduleComponent },
];
