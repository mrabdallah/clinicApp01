import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { Appointment } from '../types';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';
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

  @media screen and (max-width: 600px){
    .scale-down-on-small{
      transform: scale(0.7);
    }
  }
  `
})
export class PatientScheduleCurrentEntryComponent {
  @Input({required: true}) appointment!: Appointment;
  panelOpenState = false;
  private databaseService = inject(DatabaseService);
  private loggerService = inject(LoggerService);
  updateAppointmentState = false;
  updateOnSiteIsInProgress = false;
  updatePaidIsInProgress = false;
  updateUrgencyInProgress = false;

  async setStateToExamining(){
    this.updateAppointmentState = true;
    let today = new Date();
    let scheduleFirestorePath:string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
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

  async setStateToDone(){
    this.updateAppointmentState = true;
    let today = new Date();
    let scheduleFirestorePath:string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.updateAppointmentState(
        this.appointment.patient.id,
        scheduleFirestorePath,
        'done',
      );
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updateAppointmentState = false;
    }
  }

  async toggleOnSite(){
    this.updateOnSiteIsInProgress = true;
    let today = new Date();
    let scheduleFirestorePath:string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.toggleOnSite(this.appointment.patient.id, scheduleFirestorePath, !this.appointment.patientInClinic);
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updateOnSiteIsInProgress = false;
    }
  }

  async togglePaid(){
    this.updatePaidIsInProgress = true;
    let today = new Date();
    let scheduleFirestorePath:string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.togglePaid(this.appointment.patient.id, scheduleFirestorePath, !this.appointment.paid);
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updatePaidIsInProgress = false;
    }
  }

  async toggleUrgent(){
    this.updateUrgencyInProgress = true;
    let today = new Date();
    let scheduleFirestorePath:string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.toggleUrgent(this.appointment.patient.id, scheduleFirestorePath, !this.appointment.isUrgent);
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    } finally {
      this.updateUrgencyInProgress = false;
    }
  }
}
