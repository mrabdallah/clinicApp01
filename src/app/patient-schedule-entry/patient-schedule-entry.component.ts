import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

import { Observable, catchError, finalize, take, tap, throwError } from 'rxjs';
import { Store } from '@ngrx/store';

import { Appointment } from '../types';
import { AppState } from '../store/app.reducer';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';
import * as ScheduleActions from '../store/schedule.actions';


@Component({
  selector: 'patient-schedule-entry',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  templateUrl: './patient-schedule-entry.component.html',
  styleUrl: './patient-schedule-entry.component.css'
})
export class PatientScheduleEntryComponent {
  @Input({ required: true }) appointment!: Appointment;
  panelOpenState = false;
  private router = inject(Router);
  private loggerService = inject(LoggerService);
  private databaseService = inject(DatabaseService);
  updateOnSiteIsInProgress = false;
  updatePaidIsInProgress = false;
  updateUrgencyInProgress = false;

  constructor(private _store: Store<AppState>) { }

  toggleOnSite() {
    this.updateOnSiteIsInProgress = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.toggleOnSite(
      this.appointment.patient.id,
      schedulePath,
      !this.appointment.patientInClinic,
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updateOnSiteIsInProgress = false),
      ).subscribe(() => {
        console.log('toggling onsite');
      });
  }

  togglePaid() {
    this.updatePaidIsInProgress = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.togglePaid(
      this.appointment.patient.id,
      schedulePath,
      !this.appointment.paid
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updatePaidIsInProgress = false),
      ).subscribe(() => {
        console.log('toggling Paid');
      });
  }

  toggleUrgent() {
    this.updateUrgencyInProgress = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.toggleUrgent(
      this.appointment.patient.id,
      schedulePath,
      !this.appointment.isUrgent
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updateUrgencyInProgress = false),
      ).subscribe(() => {
        console.log('toggling Urgent');
      });
  }

  navigateToPatientDetails() {
    this.router.navigate([`patient/${this.appointment.patient.id}`]);
  }
}
