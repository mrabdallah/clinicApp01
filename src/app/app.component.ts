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
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import {
  CdkDrag,
  DragDropModule,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';


import { AddAppointmentComponent } from './add-appointment/add-appointment.component';
// import { SideBarComponent } from './side-bar/side-bar.component';
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
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NewPatientFormComponent,////////////////////////////////////////////////////////////////////
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    MatButtonModule,
    MatBottomSheetModule,
    RouterOutlet,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    BottomSheetComponent,
    DragDropModule,
    //SideBarComponent,
    TopBarComponent,
    ClockComponent,
    PatientScheduleEntryComponent,
    PatientScheduleCurrentEntryComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy, OnInit {
  router = inject(Router);
  authService = inject(AuthService);
  #userSubscription?: Subscription;
  userSignal = signal<AppUser | undefined | null>(null);// = signal(this.authService.userSignal.mutate);
  title = 'clinic-manager';
  isOpen = false;

  constructor(private store: Store<AppState>, private _bottomSheet: MatBottomSheet) { }

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

  /*toggleSidebar() {
    this.isOpen = !this.isOpen;
  }*/
  openBottomSheet() {
    this._bottomSheet.open(BottomSheetComponent);
    //this.isOpen = !this.isOpen;
  }
}
