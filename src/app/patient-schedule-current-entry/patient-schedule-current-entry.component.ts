import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { Appointment } from '../types';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';
import { Router } from '@angular/router';
import { Subscription, takeLast, timer, Subject, interval, takeUntil, } from 'rxjs';
// import { MatIconButtonModule } from '@angular/material';
// import '@material/web/button/filled-button.js';


@Component({
  selector: 'patient-schedule-current-entry',
  standalone: true,
  imports: [MatIconModule,
    MatButtonModule,
    MatExpansionModule
  ],
  templateUrl: './patient-schedule-current-entry.component.html',
  styles: `
  .elems-container {
    background: linear-gradient(270deg, #8EE0FB, #FFB2E6, #F7E3AF);
    background-size: 600% 600%;

    -webkit-animation: AnimationName 5s ease infinite;
    -moz-animation: AnimationName 5s ease infinite;
    animation: AnimationName 5s ease infinite;
  }

  @keyframes AnimationName {
      0%{background-position:0% 50%}
      50%{background-position:100% 50%}
      100%{background-position:0% 50%}
  }

  ::ng-deep .specific-class > .mat-expansion-indicator:after {
      color: red !important;
    }

  .object-containss{
    max-height: 3.5rem;
    object-fit: contain;
  }
  .icon-btn{
    transform: scale(1.2);
  }
  .cont-elevation{
      box-shadow: 0 0 9px 2px #9E9E9E;
      border-radius: 15px;
    }
  .visible-tgl{
    display: none;
  }

  @media screen and (max-width: 600px){
    .scale-down-on-small{
      transform: scale(0.7);
    }
  }
  `
})
export class PatientScheduleCurrentEntryComponent implements AfterViewInit {
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

  emitPatientNotHereEvent() {
    let today = new Date();
    this.databaseService.handleLatePatient(
      this.appointment.patient.id,
      `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`,
    );
    this.tmpSub!.unsubscribe();
  }

  ngAfterViewInit() {
    if (!this.appointment.patientInClinic) {

      const oneSecondDelay = timer(1000);
      this.tmpSub = oneSecondDelay.pipe(takeLast(1)).subscribe(() => {
        console.log('fired');
        this.emitPatientNotHereEvent();
      });
    }
  }

  async setStateToExamining() {
    this.startTime = performance.now();  // Record start time

    this.updateAppointmentState = true;
    let today = new Date();
    let scheduleFirestorePath: string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.updateAppointmentState(
        this.appointment.patient.id,
        scheduleFirestorePath,
        'examining',
      );
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updateAppointmentState = false;
    }
  }

  async setStateToDone() {
    this.updateAppointmentState = true;
    const currentTime = performance.now();
    const elapsedTimeMs = currentTime - this.startTime;
    this.totalMiliSeconds = Math.floor(elapsedTimeMs / 1000); // Convert to seconds
    let today = new Date();
    let scheduleFirestorePath: string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.updateAppointmentState(
        this.appointment.patient.id,
        scheduleFirestorePath,
        'done',
        this.totalMiliSeconds,
      );
      this.appointmentDone.emit();
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updateAppointmentState = false;
    }
  }

  async toggleOnSite() {
    let today = new Date();
    let scheduleFirestorePath: string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    this.updateOnSiteIsInProgress = true;

    if (this.appointment.patientInClinic === false) {
      this.databaseService.resetLatenessCounter(this.appointment.patient.id, scheduleFirestorePath);
    }

    try {
      await this.databaseService.toggleOnSite(this.appointment.patient.id, scheduleFirestorePath, !this.appointment.patientInClinic);
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updateOnSiteIsInProgress = false;
    }
  }

  async togglePaid() {
    this.updatePaidIsInProgress = true;
    let today = new Date();
    let scheduleFirestorePath: string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.togglePaid(this.appointment.patient.id, scheduleFirestorePath, !this.appointment.paid);
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updatePaidIsInProgress = false;
    }
  }

  async toggleUrgent() {
    this.updateUrgencyInProgress = true;
    let today = new Date();
    let scheduleFirestorePath: string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.toggleUrgent(this.appointment.patient.id, scheduleFirestorePath, !this.appointment.isUrgent);
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updateUrgencyInProgress = false;
    }
  }

  navigateToPatientDetails() {
    this.router.navigate([`patient/${this.appointment.patient.id}`]);
    // console.log('navigated');
  }

  ngOnDestroy() {
  }
}
