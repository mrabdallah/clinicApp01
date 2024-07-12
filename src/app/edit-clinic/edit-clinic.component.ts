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

type EditFlags = {
  clinicName: boolean;
  clinicSubtitle: boolean;
  clinicAddress: boolean;
  personal: boolean;
  mainAverageAppointmentTimeTake: boolean;
  fee: boolean;
};

type EditValues = {
  clinicName: string;
  clinicSubtitle: string;
  clinicAddress: string;
  mainAverageAppointmentTimeTake: number;
  fee: number;
  personal: {
    assistantEmails: string[];
    doctorEmails: string[];
  };
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
    ReactiveFormsModule
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
  clinicSubscription: Subscription;
  public editFlags: EditFlags = {
    clinicName: false,
    clinicSubtitle: false,
    clinicAddress: false,
    personal: false,
    fee: false,
    mainAverageAppointmentTimeTake: false,
  };
  public editValues: EditValues = {
    clinicName: this.clinic?.clinicName ?? '',
    clinicSubtitle: this.clinic?.clinicSubtitle ?? '',
    clinicAddress: this.clinic?.clinicSubtitle ?? '',
    personal: this.clinic?.personal ?? { doctorEmails: [], assistantEmails: [] },
    mainAverageAppointmentTimeTake: this.clinic?.mainAverageAppointmentTimeTake ? (this.clinic?.mainAverageAppointmentTimeTake / 60 / 1000) : 15,
    fee: 0,
  };
  public personalForm = this._formBuilder.group({
    doctorEmails: this._formBuilder.array([]),
    assistantEmails: this._formBuilder.array([]),
  });
  @ViewChild('personalFormDirective') personalFormDirective: FormGroupDirective | undefined;
  isSubmittingPersonalForm = false;

  constructor(private route: ActivatedRoute, private store: Store<AppState>) {
    this.route.params.subscribe(
      (params: Params) => {
        console.log(`editing clinic with ID: ${this._clinicID}`);
        if (this._clinicID === undefined || this._clinicID !== params['id']) {
          this._clinicID = params['id'];
          this.store.dispatch(ClinicActions.fetchClinicToEditStart({ clinicID: params['id'] }));
        }
      }
    );

    this.clinicSubscription = this.clinic$.subscribe(clinic => {
      this.clinic = cloneDeep(clinic);
      this.editValues.clinicName = clinic?.clinicName ?? '';
      this.editValues.clinicSubtitle = clinic?.clinicSubtitle ?? '';
      this.editValues.clinicAddress = clinic?.clinicAddress ?? '';
      this.editValues.personal = clinic?.personal ?? { doctorEmails: [], assistantEmails: [] };
      this.editValues.mainAverageAppointmentTimeTake = clinic?.mainAverageAppointmentTimeTake ? (clinic?.mainAverageAppointmentTimeTake / 1000 / 60) : 15
      this.editValues.fee = clinic?.fee ?? 0;

      let currentDoctorsCount = clinic?.personal?.doctorEmails?.length ?? 0;
      let currentAssistantsCount = clinic?.personal?.assistantEmails?.length ?? 0;
      let doctorControllersCounter = (<FormArray>this.personalForm.get('doctorEmails')).length;
      let assistantControllersCounter = (<FormArray>this.personalForm.get('assistantEmails')).length;
      if (currentDoctorsCount > 0 &&
        this.personalForm.untouched &&
        currentDoctorsCount > doctorControllersCounter
      ) {
        for (let i = 0; i < currentDoctorsCount; i++) {
          this.addPersonalControls('doctorEmails');
        }
      }
      if (currentAssistantsCount > 0 &&
        this.personalForm.untouched &&
        currentAssistantsCount > assistantControllersCounter
      ) {
        for (let i = 0; i < currentAssistantsCount; i++) {
          this.addPersonalControls('assistantEmails');
        }
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.clinicSubscription.unsubscribe();
  }

  edit(fieldName: string) {
    this.editFlags[fieldName as keyof EditFlags] = !this.editFlags[fieldName as keyof EditFlags];
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


  getPersonalControls(controlName: string) {
    return (<FormArray>this.personalForm.get(controlName))?.controls;
  }

  addPersonalControls(controlName: string) {
    let initialValue = '';
    const newControllerIndex = (<FormArray>this.personalForm.get(controlName)).length;
    let currentDoctorCounter: number = this.clinic?.personal?.doctorEmails?.length ?? 0;
    let currentAssistantCounter = this.clinic?.personal?.assistantEmails?.length ?? 0;
    if (controlName === 'doctorEmails' && currentDoctorCounter > 0) {

      initialValue = this.clinic!.personal.doctorEmails[newControllerIndex]!;
    } else if (controlName === 'assistantEmails' && currentAssistantCounter > 0) {
      initialValue = this.clinic!.personal.assistantEmails[newControllerIndex]!;
    }

    const control = new FormControl(initialValue, [Validators.required, Validators.email]);
    (<FormArray>this.personalForm.get(controlName)).push(control);
  }

  removePersonalControls(controlName: string) {
    const targetArray: FormArray = this.personalForm.get(controlName) as FormArray;
    (<FormArray>this.personalForm.get(controlName)).removeAt(targetArray.length - 1);
  }

  trackByFunc(index: number, _obj: any): any {
    return index;
  }


  onPersonalFormSubmit() {
    if (!this.personalForm!.valid || !this.clinic || !this.clinic.firestorePath) { return; }
    this.isSubmittingPersonalForm = true;
    //console.log({
    //  doctorEmails: this.personalForm.value.doctorEmails,
    //  assistantEmails: this.personalForm.value.assistantEmails
    //});
    this.databaseService.updateClinicField(
      this.clinic.firestorePath!,
      'personal',
      {
        doctorEmails: this.personalForm.value.doctorEmails as string[],
        assistantEmails: this.personalForm.value.assistantEmails as string[]
      }
    )
      .pipe(
        catchError(error => throwError(() => error)),
        finalize(() => {
          //this.editFlags[fieldName as keyof EditFlags] = !this.editFlags[fieldName as keyof EditFlags];
          //this.personalForm.reset();
          //this.personalFormDirective?.resetForm();
          this.store.dispatch(ClinicActions.fetchClinicToEditStart({ clinicID: this.clinic!.id! }));
          this.isSubmittingPersonalForm = false;
          this.editFlags.personal = false;
        },
        )
      ).subscribe(() => { });

    //     next: (_) => {
    //       this.isSubmittingPersonalForm = false;
    //       this.personalFormDirective?.resetForm();

  }

}
