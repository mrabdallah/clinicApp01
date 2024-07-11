import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
  CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, DragDropModule, moveItemInArray
} from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { cloneDeep } from 'lodash-es';
import { Observable, Subscription, combineLatest, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';

import { Appointment } from '../types';
import { AppState } from '../store/app.reducer';
import * as AppSelectors from '../store/app.selectors';
import * as ScheduleActions from '../store/schedule.actions';
import * as ClinicActions from '../store/clinic.actions';

import { PatientScheduleEntryComponent } from '../patient-schedule-entry/patient-schedule-entry.component';
import { PatientScheduleCurrentEntryComponent } from '../patient-schedule-current-entry/patient-schedule-current-entry.component';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';
import { NewPatientFormComponent } from '../new-patient-form/new-patient-form.component';
import { DatabaseService } from '../database.service';
import { TemporaryDataSrvService } from '../temporary-data-srv.service';


@Component({
  selector: 'app-clinic',
  standalone: true,
  imports: [
    MatIconModule,
    CdkDrag,
    DragDropModule,
    CdkDragPlaceholder,
    CdkDropList,
    PatientScheduleEntryComponent,
    PatientScheduleCurrentEntryComponent,
    AddAppointmentComponent,
    NewPatientFormComponent,
  ],
  templateUrl: './clinic.component.html',
  styleUrl: './clinic.component.css'
})
export class ClinicComponent implements OnInit, OnDestroy {
  private _clinicID?: string;
  public schedule: Appointment[] = [];
  private _scheduleSubscription?: Subscription;
  public scheduleFiltered: Appointment[] = [];
  public patients: any[] = [];
  private schedule$?: Observable<Appointment[]>;
  private _databaseService = inject(DatabaseService);
  private _scheduleCheckStoreSubscription?: Subscription;

  constructor(
    public dialog: MatDialog,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private _temporaryDataSrvService: TemporaryDataSrvService
  ) {
    this.route.params.subscribe(
      (params: Params) => {
        this._clinicID = params['id'];
      }
    );
  }

  ngOnInit(): void {
    this.store.dispatch(ClinicActions.fetchCurrentClinicByIdStart({ clinicID: this._clinicID ?? '' }));
    this._scheduleSubscription = this.store.select(AppSelectors.todayAppointments)
      .subscribe(appointments => {
        if (appointments.length > 0 && appointments[0].clinicID === this._clinicID) {
          this.schedule = cloneDeep(appointments);
          this.scheduleFiltered = [...appointments.filter((appointment: Appointment) => appointment.state.toLowerCase() !== "done")];
        } else {
          this.schedule = [];
          this.scheduleFiltered = [];
        }
      });


    this._scheduleCheckStoreSubscription = this.store.select(AppSelectors.selectedClinic)
      .pipe(
        concatLatestFrom(clinic => this.store.select(AppSelectors.todayAppointments)),
        tap(([clinic, appointments]) => {
          if (
            clinic &&
            clinic.id === this._clinicID && (
              (appointments.length > 0 &&
                appointments[0].clinicID !== this._clinicID) ||
              appointments.length === 0
            )
          ) {
            this.store.dispatch(ScheduleActions.getNewScheduleRealTimeSubscription());
          }

        }),
      )
      .subscribe();

    // For Opening New Patient dialog
    this._temporaryDataSrvService.getData().subscribe(dialogState => {
      //this.newPatientFormDialogOpened = dialogState;
      if (dialogState) {
        this.openNewPatientFormDialog('500ms', '500ms');
      }
    });

    this._databaseService.fetchPatientsOneTimeSnapshot().then(
      () => {
        this.patients = this._databaseService.patientsOnTimeSnapshot;
      }
    );
  }

  ngOnDestroy(): void {
    this._scheduleSubscription?.unsubscribe();
    this._scheduleCheckStoreSubscription?.unsubscribe();
  }

  openNewAppointmentDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(AddAppointmentComponent, {
      width: '80vw',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { testdatakey: 'testdatavalue' }
    });
  }

  openNewPatientFormDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(NewPatientFormComponent, {
      width: '80vw',
      enterAnimationDuration,
      exitAnimationDuration,
      data: { testdatakey: 'testdatavalue' }
    });
  }

  drop(event: CdkDragDrop<Appointment[]>) {
    let now = new Date();
    moveItemInArray(this.scheduleFiltered, event.previousIndex, event.currentIndex);
    this.store.dispatch(ScheduleActions.updateUpstreamScheduleVersion({
      appointments: this.schedule.splice(
        this.schedule.length - this.scheduleFiltered.length,
        this.scheduleFiltered.length,
        ...this.scheduleFiltered,),
      targetDateStr: `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`,
    }));
  }
}
