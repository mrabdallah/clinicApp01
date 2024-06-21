import { Component, inject, OnDestroy, OnInit, signal, Signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
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
import { AuthService } from './auth.service';
import { AppUser } from './auth/user.model';
import { TopBarComponent } from './top-bar/top-bar.component';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.reducer';
import { loginSuccess, logout } from './auth/store/auth.actions';

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
    TopBarComponent,
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
    z-index: 19;
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
export class AppComponent implements OnDestroy, OnInit {
  router = inject(Router);
  authService = inject(AuthService);
  #userSubscription?: Subscription;
  userSignal = signal<AppUser | undefined | null>(null);// = signal(this.authService.userSignal.mutate);
  title = 'clinic-manager';
  isOpen = false;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.#userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userSignal.set(user!);
        this.store.dispatch(loginSuccess({ user: user }));
      } else {
        this.store.dispatch(logout());
      }
    });
  }

  ngOnDestroy(): void {
    this.#userSubscription?.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
