import { Component, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, Subscription, catchError, map, of, take, tap } from 'rxjs';
import {
  MatDialog
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TemporaryDataSrvService } from '../temporary-data-srv.service'; // Import the data service

import {
  CdkDrag,
  DragDropModule,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { ClockComponent } from '../clock/clock.component';
import { PatientScheduleEntryComponent } from '../patient-schedule-entry/patient-schedule-entry.component';
import { PatientScheduleCurrentEntryComponent } from '../patient-schedule-current-entry/patient-schedule-current-entry.component';
import { DatabaseService } from '../database.service';
import { NewPatientFormComponent } from '../new-patient-form/new-patient-form.component';
import { Appointment } from '../types';
import { LoggerService } from '../logger.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NewPatientFormComponent,////////////////////////////////////////////////////////////////////
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    RouterOutlet,
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    DragDropModule,
    SideBarComponent,
    ClockComponent,
    PatientScheduleEntryComponent,
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

  .patient-schedule-entry-container {
    box-sizing: border-box;
    cursor: move;
  }
  .cdk-drag-preview {
    box-sizing: border-box;
    border-radius: 4px;
    box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                0 8px 10px 1px rgba(0, 0, 0, 0.14),
                0 3px 14px 2px rgba(0, 0, 0, 0.12);
  }

  .cdk-drag-animating {
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
  }
  .patient-schedule-entries.cdk-drop-list-dragging .patient-schedule-entry-container:not(.cdk-drag-placeholder) {
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
  }

  .patient-schedule-entry-placeholder {
    background: #ccc;
    border: dotted 3px #999;
    min-height: 60px;
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
  }

  `
})
export class HomeComponent {
  private loggerService: LoggerService = inject(LoggerService);
  newPatientFormDialogOpened: boolean = false;
  private databaseService = inject(DatabaseService);
  //public todaySchedule$: Observable<Appointment[]> = this.databaseService.todaySchedule$;
  public todaySchedule: Appointment[] = [];
  public todayScheduleFiltered: Appointment[] = [];
  patients: any[] = [];
  private todayScheduleSubscription: Subscription;
  firstPeriodValue = 100;
  secondPeriodValue = 70;
  today = `${new Date().getHours}:${new Date().getMinutes}`;

  constructor(
    public dialog: MatDialog,
    // private newPatientModalService: NewPatientModalService
    private temporaryDataSrvService: TemporaryDataSrvService
  ) {
    this.todayScheduleSubscription = this.databaseService.todaySchedule$.subscribe((appointments) => {
      this.todaySchedule = [...appointments];
      this.todayScheduleFiltered = [...appointments.filter((appointment: Appointment) => appointment.state.toLowerCase() !== "done")];
    });
    //this.todayScheduleSubscription = this.databaseService.fetchTodaySchedule()
    //  .subscribe((schedule: Appointment[]) => {
    //    this.todaySchedule = [...schedule];
    //    this.todayScheduleFiltered = [...schedule.filter((appointment: Appointment) => appointment.state.toLowerCase() !== "done")];
    //  });
  }

  ngOnInit() {
    // this.todaySchedule$ = this.databaseService.fetchTodaySchedule();
    this.databaseService.fetchPatientsOneTimeSnapshot().then(
      () => {
        this.patients = this.databaseService.patientsOnTimeSnapshot;
      }
    );

    this.temporaryDataSrvService.getData().subscribe(dialogState => {
      //this.newPatientFormDialogOpened = dialogState;
      if (dialogState) {
        this.openNewPatientFormDialog('500ms', '500ms');
      }
    });
  }


  openNewAppointmentDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(AddAppointmentComponent, {
      width: '50vw',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { testdatakey: 'testdatavalue' }
    });
  }

  openNewPatientFormDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(NewPatientFormComponent, {
      width: '75vw',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { testdatakey: 'testdatavalue' }
    });
  }

  drop(event: CdkDragDrop<Appointment[]>) {
    let today = new Date();
    // TODO: Change the 'E8WUcagWkeNQXKXGP6Uq' to use a variable
    let scheduleFirestorePath: string = `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;

    moveItemInArray(this.todayScheduleFiltered, event.previousIndex, event.currentIndex);

    this.databaseService.moveAppointmentInSchedule(scheduleFirestorePath,
      (() => {
        this.todaySchedule.splice(
          this.todaySchedule.length - this.todayScheduleFiltered.length,
          this.todayScheduleFiltered.length,
          ...this.todayScheduleFiltered,
        );
        return this.todaySchedule
      })()
    );
  }
}
