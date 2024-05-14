import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { Appointment } from '../types';
import { DatabaseService } from '../database.service';
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
  private databaseService = inject(DatabaseService);

  panelOpenState = false;
  isOpen = true;

  setStateToExamining(){
    let today = new Date();
    this.databaseService.updateAppointmentState(
      `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`,
      'examining',
    );
  }

  setStateToDone(){
    this.databaseService.updateAppointmentState(this.appointment.patient.id, 'done');
  }

  toggle(){
    this.isOpen = !this.isOpen;
  }

  toggleOnSite(){
    this.databaseService.toggleOnSite(this.appointment.patient.id, !this.appointment!.patientInClinic!);
  }

  togglePaid(){
    this.databaseService.togglePaid(this.appointment.patient.id, !this.appointment!.paid!);
  }

  toggleUrgent(){
    // this.databaseService.toggleUrgent(this.appointment.patient.id, !this.appointment!.isUrgent!);
  }
}
