import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '../types';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';

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
  `
})
export class PatientScheduleEntryComponent {
  @Input({required: true}) appointment!: Appointment;
  private router = inject(Router);
  
  panelOpenState = false;
  private databaseService = inject(DatabaseService);


  toggleOnSite(){
    this.databaseService.toggleOnSite(this.appointment.patient.id, !this.appointment!.patientInClinic!);
  }

  togglePaid(){
    this.databaseService.togglePaid(this.appointment.patient.id, !this.appointment!.paid!);
  }

  toggleUrgent(){
    this.databaseService.toggleUrgent(this.appointment.patient.id, !this.appointment!.isUrgent!);
  }

  navigateToPatientDetails() {
    this.router.navigate([`patient/${this.appointment?.patient.id}`]);
    console.log('navigated');
  }
}
