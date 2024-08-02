import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogModule,
  MatDialogTitle,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';

import { Observable, Subscription, catchError, finalize, take, tap, throwError } from 'rxjs';
import { Store } from '@ngrx/store';

import { Appointment } from '../types';
import { AppState } from '../store/app.reducer';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';
import * as ScheduleActions from '../store/schedule.actions';
import * as AppSelectors from '../store/app.selectors';
import { MatButtonModule } from '@angular/material/button';


interface DeleteDialogData {
  clinicID: string;
  date: Date,
  patientID: string,
}

@Component({
  selector: 'patient-schedule-entry',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  templateUrl: './patient-schedule-entry.component.html',
  styleUrl: './patient-schedule-entry.component.css'
})
export class PatientScheduleEntryComponent implements OnInit, OnDestroy {
  @Input({ required: true }) appointment!: Appointment;
  panelOpenState = false;
  private router = inject(Router);
  private loggerService = inject(LoggerService);
  private databaseService = inject(DatabaseService);
  updateOnSiteIsInProgress = false;
  updatePaidIsInProgress = false;
  updateUrgencyInProgress = false;
  public isEditingAppointments: boolean = false;
  private isEditingAppointmentsSubscription?: Subscription;
  readonly dialog = inject(MatDialog);


  constructor(private _store: Store<AppState>) { }

  ngOnInit(): void {
    this.isEditingAppointmentsSubscription = this._store.select(AppSelectors.editingAppointments)
      .subscribe(state => {
        this.isEditingAppointments = state;
      });
  }

  ngOnDestroy(): void {
    this.isEditingAppointmentsSubscription?.unsubscribe();

  }

  editAppointment() {
    console.log('editing');
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
