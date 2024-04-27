import { Component, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, Subscription, catchError, map, of, tap } from 'rxjs';
import {
  MatDialog
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TemporaryDataSrvService } from './temporary-data-srv.service'; // Import the data service

import {
  CdkDrag,
  DragDropModule,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { AddAppointmentComponent } from './add-appointment/add-appointment.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ClockComponent } from './clock/clock.component';
import { PatientScheduleEntryComponent } from './patient-schedule-entry/patient-schedule-entry.component';
import { PatientScheduleCurrentEntryComponent } from './patient-schedule-current-entry/patient-schedule-current-entry.component';
import { DatabaseService } from './database.service';
import { NewPatientFormComponent } from './new-patient-form/new-patient-form.component';
import { Appointment } from './types';

@Component({
  selector: 'app-root',
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
  templateUrl: './app.component.html',
  styles: `
  main {
    transition: 0.5s;
  }

  /*.sidebar-opend{
    margin-left: 250px;
  }*/

  .side-bar-container {
    transform: translate(0px, 15mm);
    transform: translateY(0mm);
    height: 100%;
    width: 0;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: #C1E3FF;
    overflow-x: hidden;
    transition: 0.5s;
  }
  .open {
    width: 250px;
  }
  .side-bar-toggle-btn{
    transition: 0.5s;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-49.5vw);
  }
  .toggled{
    transform: translateX(calc(-50vw + 263px));
  }
  .second-period{
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .prg-bar{
    width: 100%;
  }
  .layered-backgrounds{
    background: radial-gradient(circle at 10% 20%, rgb(137, 210, 253) 0%, rgb(255, 241, 188) 90%);
    height: 100dvh;
    width: 100%;
    position: absolute;
    z-index: -4;
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
  `,
  // styleUrl: './app.component.css'
})
export class AppComponent {
  newPatientFormDialogOpened: boolean =false;

  title = 'clinic-manager';
  private databaseService = inject(DatabaseService);
  todaySchedule: Appointment[] = [];
  patients: any[] = [];
  // movies = [
  //   'Episode I - The Phantom Menace',
  //   'Episode II - Attack of the Clones',
  //   'Episode III - Revenge of the Sith',
  //   'Episode IV - A New Hope',
  //   'Episode V - The Empire Strikes Back',
  //   'Episode VI - Return of the Jedi',
  //   'Episode VII - The Force Awakens',
  //   'Episode VIII - The Last Jedi',
  //   'Episode IX - The Rise of Skywalker',
  // ];
  // private todaySchedule$: Observable<any[]>;
  private todayScheduleSubscription: Subscription;

  isOpen = false;
  firstPeriodValue = 100;
  secondPeriodValue = 70;
  today = `${new Date().getHours}:${new Date().getMinutes}`;

  constructor(
    public dialog: MatDialog,
    // private newPatientModalService: NewPatientModalService
    private temporaryDataSrvService: TemporaryDataSrvService
  ) {

    this.todayScheduleSubscription = this.databaseService.getTodayScheduleRealTimeData().subscribe((arr) => {
        // .pipe(map((appointment) => appointment.state !== "done")).subscribe((arr) => {
      this.todaySchedule = [...arr.filter((appointment) => appointment.state.toLowerCase() !== "done")];
    });
  }

  

  ngOnInit() {
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.todaySchedule, event.previousIndex, event.currentIndex);
    // console.log(`\x1B[35m prev: ${event.previousIndex} curr: ${event.currentIndex} \x1B[0m`)
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
