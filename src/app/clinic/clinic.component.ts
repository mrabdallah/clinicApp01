import { Component, OnDestroy, OnInit, model, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
  CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, DragDropModule, moveItemInArray
} from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EMPTY, Subject, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { cloneDeep } from 'lodash-es';
import { Observable, Subscription, combineLatest, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';

import { Appointment, Clinic } from '../types';
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
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-clinic',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    MatIconModule,
    CdkDrag,
    MatButtonModule,
    MatTabsModule,
    MatCardModule, MatDatepickerModule,
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
  selectedDate = new Date();
  private isEditingAppointmentsSubscription?: Subscription;
  public isEditingAppointments: boolean = false;
  //selectedDate = model<Date | null>(null);
  urgentAndLateAppointments: Appointment[] = [];
  private _clinicID?: string;
  public schedule: Appointment[] = [];
  private _scheduleSubscription?: Subscription;
  public scheduleFiltered: Appointment[] = [];
  public patients: any[] = [];
  private schedule$?: Observable<Appointment[]>;
  private _databaseService = inject(DatabaseService);
  private _scheduleCheckStoreSubscription?: Subscription;
  public clinic$: Observable<Clinic | null> = of(null);
  destroyed = new Subject<void>();
  currentScreenSize?: string;

  // Create a map to display breakpoint names for demonstration purposes.
  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  constructor(
    breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private _temporaryDataSrvService: TemporaryDataSrvService
  ) {
    breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.currentScreenSize = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });
  }

  ngOnInit(): void {
    this.isEditingAppointmentsSubscription = this.store.select(AppSelectors.editingAppointments)
      .subscribe((state) => {
        this.isEditingAppointments = state;
      });


    this.clinic$ = this.store.select(AppSelectors.selectedClinic).pipe(map(clinic => {
      if (clinic?.id === this._clinicID) {
        return clinic;
      } else {
        return null;
      }
    }));

    this.route.params.subscribe(
      (params: Params) => {
        this._clinicID = params['id'];
      }
    );

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

    (() => {
      const selectedDate = this.selectedDate;
      selectedDate.setHours(0, 0, 0, 0);  // set time to 12 AM
      const dateStr: string = `${selectedDate.getDate()}_${selectedDate.getMonth() + 1}_${selectedDate.getFullYear()}`;
      this.store.dispatch(ScheduleActions.getNewScheduleRealTimeSubscription({ dateStr: dateStr }));
    })();

    this._scheduleCheckStoreSubscription = this.store.select(AppSelectors.selectedClinic)
      .pipe(
        concatLatestFrom(clinic => this.store.select(AppSelectors.todayAppointments)),
        tap(([clinic, appointments]) => {
          if (
            clinic &&
            clinic.id === this._clinicID &&
            (
              (appointments.length > 0 && appointments[0].clinicID !== this._clinicID) ||
              appointments.length === 0
            )
          ) {
            const selectedDate = this.selectedDate;
            selectedDate.setHours(0, 0, 0, 0);  // set time to 12 AM
            const dateStr: string = `${selectedDate.getDate()}_${selectedDate.getMonth() + 1}_${selectedDate.getFullYear()}`;

            this.store.dispatch(ScheduleActions.getNewScheduleRealTimeSubscription({ dateStr: dateStr }));
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
        this.patients = this._databaseService.patientsOneTimeSnapshot;
      }
    );
  }

  ngOnDestroy(): void {
    this._scheduleSubscription?.unsubscribe();
    this._scheduleCheckStoreSubscription?.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
    this.isEditingAppointmentsSubscription?.unsubscribe();
  }

  onDateChange(event: Date) {
    const selectedDate = event;
    selectedDate.setHours(0, 0, 0, 0);  // set time to 12 AM
    const dateStr: string = `${selectedDate.getDate()}_${selectedDate.getMonth() + 1}_${selectedDate.getFullYear()}`;

    this.store.dispatch(ScheduleActions.getNewScheduleRealTimeSubscription({ dateStr: dateStr }));
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

  startEditingAppointments() {
    this.store.dispatch(ScheduleActions.toggleEditingAppointments());
    //   this.isEditingAppointments = true;
  }
  doneEditingAppointments() {
    // this.isEditingAppointments = false;
    this.store.dispatch(ScheduleActions.toggleEditingAppointments());
  }

  drop(event: CdkDragDrop<Appointment[]>) {
    if (!this.isEditingAppointments) { return; }
    let now = new Date();
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    moveItemInArray(this.scheduleFiltered, event.previousIndex, event.currentIndex);
    const schedCopy = cloneDeep(this.schedule)
    schedCopy.splice(
      this.schedule.length - this.scheduleFiltered.length,
      this.scheduleFiltered.length,
      ...this.scheduleFiltered
    );
    this.store.dispatch(ScheduleActions.updateUpstreamScheduleVersion({
      appointments: schedCopy,
      targetDateStr: `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`,
      previousIndex,
      currentIndex
    }));
  }
}
