import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Observable, first, take } from 'rxjs';
import { Patient } from '../types';
import { DatabaseService } from '../database.service';
import {Location} from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { PatientHistoryVisitsAppointmentComponent } from '../patient-history-visits-appointment/patient-history-visits-appointment.component';



@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [CommonModule, MatTabsModule, PatientHistoryVisitsAppointmentComponent],
  templateUrl: './patient-details.component.html',
  styles: `
  `
})
export class PatientDetailsComponent {
  private databaseService = inject(DatabaseService);
  private _location = inject(Location);
  public patient$?: Observable<Patient|null>;
  public age?: number;

  @Input()
  set id(patientID: string) {
    this.patient$ = this.databaseService.getPatientDetails(patientID);
    this.patient$.pipe(first()).subscribe((val) => {
      let currentYear = new Date().getFullYear();
      try {
        this.age = currentYear - val!.dateOfBirth!.getFullYear();
      } catch (error) {}
    })
  }

  goBack(){
    this._location.back();
  }

}
