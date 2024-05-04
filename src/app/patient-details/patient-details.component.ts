import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '../types';
import { DatabaseService } from '../database.service';
import {Location} from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [CommonModule, MatTabsModule,],
  templateUrl: './patient-details.component.html',
  styles: ``
})
export class PatientDetailsComponent {
  private databaseService = inject(DatabaseService);
  private _location = inject(Location);
  public patient$?: Observable<Patient|null>;


  @Input()
  set id(patientID: string) {
    this.patient$ = this.databaseService.getPatient(patientID);
  }

  goBack(){
    this._location.back();
  }

}
