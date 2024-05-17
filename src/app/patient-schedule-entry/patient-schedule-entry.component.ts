import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '../types';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';
import { LoggerService } from '../logger.service';

@Component({
  selector: 'patient-schedule-entry',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  templateUrl: './patient-schedule-entry.component.html',
  styles: `
    .object-containss{
      max-height: 3.5rem;
      object-fit: contain;
    }
    .cont-elevation{
      box-shadow: 0 0 9px 2px #9E9E9E;
      border-radius: 15px;
    }
    .visible-tgl{
      display: none;
    }
    ::ng-deep .specific-class > .mat-expansion-indicator:after {
      color: red;
    }
  `
})
export class PatientScheduleEntryComponent {
  @Input({required: true}) appointment!: Appointment;
  panelOpenState = false;
  private router = inject(Router);
  private loggerService = inject(LoggerService);
  private databaseService = inject(DatabaseService);
  updateOnSiteIsInProgress = false;
  updatePaidIsInProgress = false;
  updateUrgencyInProgress = false;



  async toggleOnSite(){
    this.updateOnSiteIsInProgress = true;
    let today = new Date();
    let scheduleFirestorePath:string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
    try {
      await this.databaseService.toggleOnSite(this.appointment.patient.id, scheduleFirestorePath, !this.appointment.patientInClinic).then();      
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);

    } finally{
    this.updateOnSiteIsInProgress = false; // Enable button after operation (regardless of success/failure)

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

  navigateToPatientDetails() {
    this.router.navigate([`patient/${this.appointment.patient.id}`]);
  }
}
