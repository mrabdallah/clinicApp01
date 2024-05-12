import { Component, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, Subscription, catchError, map, of, tap } from 'rxjs';
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
  newPatientFormDialogOpened: boolean =false;
  private databaseService = inject(DatabaseService);
  public todaySchedule$: Observable<Appointment[]> = of([]);
  patients: any[] = [];
  // private todayScheduleSubscription: Subscription;
  firstPeriodValue = 100;
  secondPeriodValue = 70;
  today = `${new Date().getHours}:${new Date().getMinutes}`;

  constructor(
    public dialog: MatDialog,
    // private newPatientModalService: NewPatientModalService
    private temporaryDataSrvService: TemporaryDataSrvService
  ) {}

    // this.todayScheduleSubscription = this.databaseService.getTodayScheduleRealTimeData().subscribe((arr: Appointment[]) => {
    //   // for (let appointment of arr) {
    //   //   appointment.
    //   // }
    //   // Sort the array in ascending order by "bar" property
      
    //   let sorted: Appointment[] = arr.sort((a: Appointment, b: Appointment) => a.order - b.order);

    //   this.todaySchedule = [...arr.filter((appointment) => appointment.state.toLowerCase() !== "done")];
    // });

  ngOnInit() {
    this.todaySchedule$ = this.databaseService.fetchTodaySchedule();
    this.databaseService.fetchPatientsOneTimeSnapshot().then(
      () => {
        this.patients = this.databaseService.patientsOnTimeSnapshot;
      }
    );

    this.temporaryDataSrvService.getData().subscribe(dialogState => {
      //this.newPatientFormDialogOpened = dialogState;
      if(dialogState) {
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
    // moveItemInArray(this.todaySchedule, event.previousIndex, event.currentIndex);
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // listSubject.next(event.container.data); // Update the observable with the reordered list

  }
}
