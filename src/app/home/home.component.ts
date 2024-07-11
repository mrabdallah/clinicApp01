import { Component, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, Subscription, catchError, map, of, take, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { TemporaryDataSrvService } from '../temporary-data-srv.service'; // Import the data service

import {
  CdkDrag,
  DragDropModule,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
} from '@angular/cdk/drag-drop';

import { SideBarComponent } from '../side-bar/side-bar.component';
import { ClockComponent } from '../clock/clock.component';
import { PatientScheduleEntryComponent } from '../patient-schedule-entry/patient-schedule-entry.component';
import { PatientScheduleCurrentEntryComponent } from '../patient-schedule-current-entry/patient-schedule-current-entry.component';
import { ClinicCardComponent } from '../clinic-card/clinic-card.component';

import { DatabaseService } from '../database.service';
import { Appointment, Clinic } from '../types';
import { LoggerService } from '../logger.service';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';
import * as AppSelectors from '../store/app.selectors';
import * as ClinicActions from '../store/clinic.actions';
import * as ScheduleActions from "../store/schedule.actions";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    RouterOutlet,
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    DragDropModule,
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
  private loggerService: LoggerService = inject(LoggerService);
  newPatientFormDialogOpened: boolean = false;
  private databaseService = inject(DatabaseService);
  //public todaySchedule$: Observable<Appointment[]> = this.databaseService.todaySchedule$;
  //public todaySchedule$: Observable<Appointment[]> = this.store.select(AppSelectors.todayAppointments);
  public todaySchedule: Appointment[] = [];
  public todayScheduleFiltered: Appointment[] = [];
  patients: any[] = [];
  public allClinics?: Clinic[];
  private todayScheduleSubscription?: Subscription;
  public allClinics$ = this.store.select(AppSelectors.allClinics);
  firstPeriodValue = 100;
  secondPeriodValue = 70;
  today = `${new Date().getHours}:${new Date().getMinutes}`;

  constructor(
    // private newPatientModalService: NewPatientModalService
    private store: Store<AppState>,
    private temporaryDataSrvService: TemporaryDataSrvService
  ) {
    //this.todayScheduleSubscription = this.databaseService.todaySchedule$.subscribe((appointments) => {
    //  this.todaySchedule = [...appointments];
    //  this.todayScheduleFiltered = [...appointments.filter((appointment: Appointment) => appointment.state.toLowerCase() !== "done")];
    //});
  }

  ngOnInit() {
    this.store.dispatch(ClinicActions.fetchAllClinicsStart());
    // this.todaySchedule$ = this.databaseService.fetchTodaySchedule();
    //this.store.dispatch(ScheduleActions.getNewScheduleRealTimeSubscription());
  }

  //drop(event: CdkDragDrop<Appointment[]>) {
  //  let today = new Date();
  //  // TODO: Change the 'E8WUcagWkeNQXKXGP6Uq' to use a variable
  //  let scheduleFirestorePath: string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;

  //  //moveItemInArray(this.todayScheduleFiltered, event.previousIndex, event.currentIndex);

  //  //this.databaseService.updateUpstreamScheduleVersion(scheduleFirestorePath,
  //  //  (() => {
  //  //    this.todaySchedule.splice(
  //  //      this.todaySchedule.length - this.todayScheduleFiltered.length,
  //  //      this.todayScheduleFiltered.length,
  //  //      ...this.todayScheduleFiltered,
  //  //    );
  //  //    return this.todaySchedule
  //  //  })()
  //  //);
  //}
}
