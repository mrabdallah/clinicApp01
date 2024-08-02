import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormsModule, FormGroupDirective, ReactiveFormsModule, FormArray, FormControl, Validators } from '@angular/forms';

import { Subscription, catchError, finalize, take, tap, throwError } from 'rxjs';

import { cloneDeep } from 'lodash-es';

import { Store } from '@ngrx/store';

import { AppState } from '../store/app.reducer';
import * as AppSelectors from '../store/app.selectors';
import * as ClinicActions from '../store/clinic.actions';
import { Clinic } from '../types';
import { DatabaseService } from '../database.service';
import { EditScheduleComponent } from '../edit-schedule/edit-schedule.component';
import { PersonnelFormComponent } from './personnel-form/personnel-form.component';

type EditFlags = {
  clinicName: boolean;
  clinicSubtitle: boolean;
  clinicAddress: boolean;
  geoAddress: boolean;
  assistantEmails: boolean;
  doctorEmails: boolean;
  mainAverageAppointmentTimeTake: boolean;
  fee: boolean;
  weekScheduleTemplate: boolean;
};

type EditValues = {
  clinicName: string;
  clinicSubtitle: string;
  clinicAddress: string;
  geoAddress: string;
  mainAverageAppointmentTimeTake: number;
  fee: number;
  assistantEmails?: string[];
  doctorEmails?: string[];
};


@Component({
  selector: 'edit-clinic',
  standalone: true,
  imports: [
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    EditScheduleComponent,
    ReactiveFormsModule,
    PersonnelFormComponent
  ],
  templateUrl: './edit-clinic.component.html',
  styleUrl: './edit-clinic.component.css'
})
export class EditClinicComponent implements OnInit, OnDestroy {
  private databaseService = inject(DatabaseService);
  private _formBuilder = inject(FormBuilder);
  private _clinicID?: string;
  clinic$ = this.store.select(AppSelectors.clinicToEdit);
  clinic: Clinic | null = null;
  clinicSubscription?: Subscription;
  weekScheduleTemplateEditingFlagSubscription?: Subscription;
  public editFlags: EditFlags = {
    clinicName: false,
    clinicSubtitle: false,
    clinicAddress: false,
    geoAddress: false,
    doctorEmails: false,
    assistantEmails: false,
    fee: false,
    mainAverageAppointmentTimeTake: false,
    weekScheduleTemplate: false,
  };
  public editValues: EditValues = {
    clinicName: this.clinic?.clinicName ?? '',
    clinicSubtitle: this.clinic?.clinicSubtitle ?? '',
    clinicAddress: this.clinic?.clinicSubtitle ?? '',
    geoAddress: this.clinic?.geoAddress ?? '',
    doctorEmails: [],
    assistantEmails: [],
    mainAverageAppointmentTimeTake: this.clinic?.mainAverageAppointmentTimeTake ? (this.clinic?.mainAverageAppointmentTimeTake / 60 / 1000) : 15,
    fee: 0,
  };

  constructor(private route: ActivatedRoute, private store: Store<AppState>) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        console.log(`editing clinic with ID: ${this._clinicID}`);
        if (this._clinicID === undefined || this._clinicID !== params['id']) {
          this._clinicID = params['id'];
          this.store.dispatch(ClinicActions.fetchClinicToEditRTDoc({ clinicID: params['id'] }));
        }
      }
    );

    this.weekScheduleTemplateEditingFlagSubscription = this.store.select(AppSelectors.editingScheduleTemplate).subscribe(state => {
      this.editFlags.weekScheduleTemplate = state;
    });

    this.clinicSubscription = this.clinic$.subscribe(clinic => {
      this.clinic = cloneDeep(clinic);
      this.editValues.clinicName = clinic?.clinicName ?? '';
      this.editValues.clinicSubtitle = clinic?.clinicSubtitle ?? '';
      this.editValues.clinicAddress = clinic?.clinicAddress ?? '';
      this.editValues.geoAddress = clinic?.geoAddress ?? '';
      this.editValues.doctorEmails = clinic?.doctors;
      this.editValues.assistantEmails = clinic?.assistants;
      this.editValues.mainAverageAppointmentTimeTake = clinic?.mainAverageAppointmentTimeTake ? (clinic?.mainAverageAppointmentTimeTake / 1000 / 60) : 15
      this.editValues.fee = clinic?.fee ?? 0;

    });

  }

  ngOnDestroy(): void {
    this.clinicSubscription?.unsubscribe();
    this.store.dispatch(ClinicActions.unsubscribeFromClinicToEdit());
    this.weekScheduleTemplateEditingFlagSubscription?.unsubscribe();
  }

  to12AmPM(timeStr: string) {
    let minutes = parseInt(timeStr.split(':')[1]);
    let hours = parseInt(timeStr.split(':')[0]);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12 || 12);

    //return `${hours.toString().padStart(2, '0')}:${minutes} ${amPm}`;
    return `${hours.toString()}:${minutes} ${amPm}`;
  }


  edit(fieldName: string) {
    this.editFlags[fieldName as keyof EditFlags] = !this.editFlags[fieldName as keyof EditFlags];
  }

  editSchedule(state: boolean) {
    if (state) {
      this.store.dispatch(ClinicActions.startEditingClinicScheduleTemplate());
    } else {
      this.store.dispatch(ClinicActions.doneEditingClinicScheduleTemplate());
    }
  }

  save(fieldName: string) {
    if (fieldName === 'mainAverageAppointmentTimeTake') {
      this.editValues.mainAverageAppointmentTimeTake = this.editValues.mainAverageAppointmentTimeTake * 1000 * 60;
    }
    if (!this.clinic || !this.clinic.firestorePath) { return; }
    this.databaseService.updateClinicField(
      this.clinic.firestorePath!,
      fieldName,
      this.editValues[fieldName as keyof EditValues]
    )
      .pipe(
        catchError(error => throwError(() => error)),
        finalize(() => {
          if (fieldName === 'mainAverageAppointmentTimeTake') {
            this.editValues.mainAverageAppointmentTimeTake = this.editValues.mainAverageAppointmentTimeTake / 1000 / 60;
          }
          this.editFlags[fieldName as keyof EditFlags] = !this.editFlags[fieldName as keyof EditFlags];
        },
        )
      ).subscribe(() => { });
  }

}
