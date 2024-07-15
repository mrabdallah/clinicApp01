import { Component, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, Subscription, catchError, map, of, take, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { TemporaryDataSrvService } from '../temporary-data-srv.service'; // Import the data service


import { SideBarComponent } from '../side-bar/side-bar.component';
import { ClockComponent } from '../clock/clock.component';
import { PatientScheduleEntryComponent } from '../patient-schedule-entry/patient-schedule-entry.component';
import { PatientScheduleCurrentEntryComponent } from '../patient-schedule-current-entry/patient-schedule-current-entry.component';
import { ClinicCardComponent } from '../clinic-card/clinic-card.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    //CdkDropList,
    //CdkDrag,
    //CdkDragPlaceholder,
    RouterOutlet,
    CommonModule,
    MatIconModule,
    //MatProgressBarModule,
    //DragDropModule,
    SideBarComponent,
    ClinicCardComponent,
    ClockComponent,
    PatientScheduleEntryComponent,
    MatButtonModule,
    PatientScheduleCurrentEntryComponent,
  ],
  templateUrl: './home.component.html',
  styles: `
 .second-period{
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .prg-bar{
    width: 100%;
  }
  `
})
export class HomeComponent {
  patients: any[] = [];
  //public allClinics?: Clinic[];
  private todayScheduleSubscription?: Subscription;

  constructor(
    // private newPatientModalService: NewPatientModalService
    //private store: Store<AppState>,
    private temporaryDataSrvService: TemporaryDataSrvService
  ) {
    //this.todayScheduleSubscription = this.databaseService.todaySchedule$.subscribe((appointments) => {
    //  this.todaySchedule = [...appointments];
    //  this.todayScheduleFiltered = [...appointments.filter((appointment: Appointment) => appointment.state.toLowerCase() !== "done")];
    //});
  }



}
