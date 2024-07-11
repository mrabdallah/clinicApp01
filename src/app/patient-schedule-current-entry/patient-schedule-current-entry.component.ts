import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
// import { MatIconButtonModule } from '@angular/material';
// import '@material/web/button/filled-button.js';

import { Subscription, takeLast, timer, Subject, interval, takeUntil, take, catchError, tap, throwError, finalize, } from 'rxjs';

import { Appointment } from '../types';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';


@Component({
  selector: 'patient-schedule-current-entry',
  standalone: true,
  imports: [MatIconModule,
    MatButtonModule,
    MatExpansionModule
  ],
  templateUrl: './patient-schedule-current-entry.component.html',
  styleUrl: './patient-schedule-current-entry.component.css',
})
//export class PatientScheduleCurrentEntryComponent implements AfterViewInit {
export class PatientScheduleCurrentEntryComponent {
  @Output() appointmentDone = new EventEmitter<void>();
  @Input({ required: true }) appointment!: Appointment;
  private databaseService = inject(DatabaseService);
  private loggerService = inject(LoggerService);
  private router = inject(Router);
  private tmpSub?: Subscription;
  panelOpenState = false;
  updateAppointmentState = false;
  updateOnSiteIsInProgress = false;
  updatePaidIsInProgress = false;
  updateUrgencyInProgress = false;
  stopwatchIsActive: boolean = false;
  intervalSubscription: any;
  startTime: number = 0;
  totalMiliSeconds: number = 0;

  //emitPatientNotHereEvent() {
  //  let today = new Date();
  //  this.databaseService.handleLatePatient(
  //    this.appointment.patient.id,
  //    `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`,
  //  );
  //  this.tmpSub!.unsubscribe();
  //}

  //ngAfterViewInit() {
  //  if (!this.appointment.patientInClinic) {

  //    const oneSecondDelay = timer(1000);
  //    this.tmpSub = oneSecondDelay.pipe(takeLast(1)).subscribe(() => {
  //      console.log('fired');
  //      this.emitPatientNotHereEvent();
  //    });
  //  }
  //}

  setStateToExamining() {
    this.startTime = performance.now();  // Record start time
    this.updateAppointmentState = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.updateAppointmentStateToExamining(
      this.appointment.patient.id,
      schedulePath,
      'examining',
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updateAppointmentState = false),
      ).subscribe(() => {
        console.log('Setting State to \'examining\'');
      });
  }

  setStateToDone() {
    const currentTime = performance.now();

    this.totalMiliSeconds = currentTime - this.startTime;
    this.updateAppointmentState = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.updateAppointmentState(
      this.appointment.patient.id,
      schedulePath,
      'done',
      this.totalMiliSeconds,
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updateAppointmentState = false),
      ).subscribe(() => {
        console.log('Setting State into \'done\'');
      });
  }

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
    // console.log('navigated');
  }

  ngOnDestroy() {
  }
}
