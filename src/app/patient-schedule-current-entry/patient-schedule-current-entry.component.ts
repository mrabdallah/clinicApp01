import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
// import { MatIconButtonModule } from '@angular/material';
// import '@material/web/button/filled-button.js';

import { Subscription, takeLast, timer, Subject, interval, takeUntil, take, catchError, tap, throwError, finalize, } from 'rxjs';

import { Appointment } from '../types';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';
import * as AppSelectors from '../store/app.selectors';
import * as ScheduleActions from '../store/schedule.actions';


interface DeleteDialogData {
  clinicID: string;
  date: Date,
  patientID: string,
}

@Component({
  selector: 'patient-schedule-current-entry',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatExpansionModule
  ],
  templateUrl: './patient-schedule-current-entry.component.html',
  styleUrl: './patient-schedule-current-entry.component.css',
})
//export class PatientScheduleCurrentEntryComponent implements AfterViewInit {
export class PatientScheduleCurrentEntryComponent implements OnInit, OnDestroy {
  @Output() appointmentDone = new EventEmitter<void>();
  @Input({ required: true }) appointment!: Appointment;
  readonly dialog = inject(MatDialog);
  public isEditingAppointments: boolean = false;
  private isEditingAppointmentsSubscription?: Subscription;
  private databaseService = inject(DatabaseService);
  private loggerService = inject(LoggerService);
  private router = inject(Router);
  private tmpSub?: Subscription;
  panelOpenState = false;
  updateAppointmentState = false;
  updateOnSiteIsInProgress = false;
  updatePaidIsInProgress = false;
  updateUrgencyInProgress = false;
  stopwatchIsActive: boolean = false;
  intervalSubscription: any;
  startTime: number = 0;
  totalMiliSeconds: number = 0;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.isEditingAppointmentsSubscription = this.store.select(AppSelectors.editingAppointments)
      .subscribe(state => {
        this.isEditingAppointments = state;
      });
  }

  setStateToExamining() {
    this.startTime = performance.now();  // Record start time
    this.updateAppointmentState = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.updateAppointmentStateToExamining(
      this.appointment.patient.id,
      schedulePath,
      'examining',
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updateAppointmentState = false),
      ).subscribe(() => {
        console.log('Setting State to \'examining\'');
      });
  }

  openDialogDelete(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DeleteAppointmentConfirmationDialog, {
      data: {
        clinicID: this.appointment.clinicID,
        date: this.appointment.dateTime,
        patientID: this.appointment.patient.id,
      },
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  setStateToDone() {
    const currentTime = performance.now();

    this.totalMiliSeconds = currentTime - this.startTime;
    this.updateAppointmentState = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.updateAppointmentState(
      this.appointment.patient.id,
      schedulePath,
      'done',
      this.totalMiliSeconds,
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updateAppointmentState = false),
      ).subscribe(() => {
        console.log('Setting State into \'done\'');
      });
  }

  toggleOnSite() {
    this.updateOnSiteIsInProgress = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.toggleOnSite(
      this.appointment.patient.id,
      schedulePath,
      !this.appointment.patientInClinic,
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updateOnSiteIsInProgress = false),
      ).subscribe(() => {
        console.log('toggling onsite');
      });
  }

  togglePaid() {
    this.updatePaidIsInProgress = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.togglePaid(
      this.appointment.patient.id,
      schedulePath,
      !this.appointment.paid
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updatePaidIsInProgress = false),
      ).subscribe(() => {
        console.log('toggling Paid');
      });
  }

  toggleUrgent() {
    this.updateUrgencyInProgress = true;

    const targetDate = this.appointment.dateTime;
    const schedulePath: string = `/clinics/${this.appointment.clinicID}/schedule/` +
      `${targetDate.getDate()}_${targetDate.getMonth() + 1}_${targetDate.getFullYear()}`;

    this.databaseService.toggleUrgent(
      this.appointment.patient.id,
      schedulePath,
      !this.appointment.isUrgent
    )
      .pipe(
        tap(() => { console.log('Component: Appointment state updated successfully'); }),
        catchError(error => throwError(() => error)),
        take(1),
        finalize(() => this.updateUrgencyInProgress = false),
      ).subscribe(() => {
        console.log('toggling Urgent');
      });
  }

  navigateToPatientDetails() {
    this.router.navigate([`patient/${this.appointment.patient.id}`]);
    // console.log('navigated');
  }

  editAppointment() {
    console.log('editing');
  }

  ngOnDestroy() {
    this.isEditingAppointmentsSubscription?.unsubscribe();
  }
}

@Component({
  selector: 'appointment-delete-confirmation-dialog',
  template: `
  <h2 mat-dialog-title>Delete appointment</h2>
  <mat-dialog-content>
    Are you sure you want to delete this appointment?
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close cdkFocusInitial>No</button>
    <button mat-button mat-dialog-close (click)="onClick()">Yes</button>
  </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAppointmentConfirmationDialog {
  readonly dialogRef = inject(MatDialogRef<DeleteAppointmentConfirmationDialog>);
  readonly data = inject<DeleteDialogData>(MAT_DIALOG_DATA);

  constructor(private _store: Store<AppState>) { }

  onClick() {
    this._store.dispatch(ScheduleActions.deleteAppointment({
      clinicID: this.data.clinicID,
      date: this.data.date,
      patientID: this.data.patientID
    })
    );
  }
}
