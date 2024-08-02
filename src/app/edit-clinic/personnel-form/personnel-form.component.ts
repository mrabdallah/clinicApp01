import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Observable, Subscription, of, switchMap, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';

import { AppState } from '../../store/app.reducer';
import * as AppSelectors from '../../store/app.selectors';
import { Clinic } from '../../types';
import { DatabaseService } from '../../database.service';


@Component({
  selector: 'app-personnel-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './personnel-form.component.html',
  styleUrl: './personnel-form.component.css'
})
export class PersonnelFormComponent implements OnInit, OnDestroy {
  private _formBuilder = inject(FormBuilder);
  private databaseService = inject(DatabaseService);
  private clinicSubscription?: Subscription;
  public clinic: Clinic | null = null;
  public isEditing$ = this.store.select(AppSelectors.editingClinicFlags);
  public personnelIdEmails?: {
    doctorsIdEmailsArr?: [string, string][];  // id, email
    assistantsIdEmailsArr?: [string, string][];  // id, email
  };
  public personnelForm = this._formBuilder.group({
    doctorEmails: this._formBuilder.array([]),
    assistantEmails: this._formBuilder.array([]),
  });
  @ViewChild('personnelFormDirective') personnelFormDirective: FormGroupDirective | undefined;
  isSubmittingPersonnelForm = false;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.personnelIdEmails = { assistantsIdEmailsArr: [], doctorsIdEmailsArr: [] };
    this.clinicSubscription = this.store.select(AppSelectors.clinicToEdit)
      .pipe(
        tap(clinic => {
          this.clinic = cloneDeep(clinic);
          let currentDoctorsCount = clinic?.doctors?.length ?? 0;
          let currentAssistantsCount = clinic?.assistants?.length ?? 0;
          let doctorControllersCounter = (<FormArray>this.personnelForm.get('doctorEmails')).length;
          let assistantControllersCounter = (<FormArray>this.personnelForm.get('assistantEmails')).length;
          if (currentDoctorsCount > 0 &&
            this.personnelForm.untouched &&
            currentDoctorsCount > doctorControllersCounter
          ) {
            for (let i = 0; i < currentDoctorsCount; i++) {
              this.addPersonnelControls('doctorEmails');
            }
          }
          if (currentAssistantsCount > 0 &&
            this.personnelForm.untouched &&
            currentAssistantsCount > assistantControllersCounter
          ) {
            for (let i = 0; i < currentAssistantsCount; i++) {
              this.addPersonnelControls('assistantEmails');
            }
          }
        }),
        switchMap(clinic => {
          let currentDoctorsCount = clinic?.doctors?.length ?? 0;
          let currentAssistantsCount = clinic?.assistants?.length ?? 0;
          //if (clinic && (currentAssistantsCount > 0 || currentDoctorsCount > 0)) {
          //  return this.databaseService.fetchPersonnelIDs(clinic);
          //}
          return of(null);
        }),

        tap(arr => arr)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.clinicSubscription?.unsubscribe();
  }

  toggleEdit() { }

  getPersonnelControls(controlName: string) {
    return (<FormArray>this.personnelForm.get(controlName))?.controls;
  }

  addPersonnelControls(controlName: string) {
    const newControllerIndex = (<FormArray>this.personnelForm.get(controlName)).length;
    let initialValue = '';
    let currentDoctorCounter: number = this.clinic?.doctors?.length ?? 0;
    let currentAssistantCounter = this.clinic?.assistants?.length ?? 0;
    if (controlName === 'doctorEmails' && currentDoctorCounter > 0) {
      //initialValue = this.clinic!.doctors[newControllerIndex][0];
    } else if (controlName === 'assistantEmails' && currentAssistantCounter > 0) {
      //initialValue = this.clinic!.assistants[newControllerIndex][0];
    }

    const control = new FormControl(initialValue, [Validators.required, Validators.email]);
    (<FormArray>this.personnelForm.get(controlName)).push(control);
  }

  removePersonnelControls(controlName: string) {
    const targetArray: FormArray = this.personnelForm.get(controlName) as FormArray;
    (<FormArray>this.personnelForm.get(controlName)).removeAt(targetArray.length - 1);
  }

  trackByFunc(index: number, _obj: any): any {
    return index;
  }

  onPersonnelFormSubmit() {
  }
}
