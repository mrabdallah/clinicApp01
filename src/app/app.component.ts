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
import { MatButtonModule } from '@angular/material/button';
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
    MatButtonModule,
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
  :host{
    height: 100dvh;
  }
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
    z-index: 19;
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
  .layered-backgrounds{
    background: radial-gradient(circle at 10% 20%, rgb(137, 210, 253) 0%, rgb(255, 241, 188) 90%);
    height: 100dvh;
    width: 100%;
    position: absolute;
    z-index: -4;
  }
  `,
  // styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'clinic-manager';
  // private todaySchedule$: Observable<any[]>;

  isOpen = false;




  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
