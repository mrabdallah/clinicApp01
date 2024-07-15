import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Clinic, Weekday } from '../types';
import { DatabaseService } from '../database.service';
import { BehaviorSubject, Observable, Subscription, fromEvent, take, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CreateClinicComponent } from '../create-clinic/create-clinic.component';
import { MatSelectModule } from '@angular/material/select';
//import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.reducer';
import { startEditingClinicScheduleTemplate, doneEditingClinicScheduleTemplate } from '../store/clinic.actions';
import { selectedClinic, myClinics, clinicToEdit } from '../store/app.selectors';
import { MatIconModule } from '@angular/material/icon';
//import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'edit-schedule',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    AsyncPipe,
    CreateClinicComponent,
  ],
  templateUrl: './edit-schedule.component.html',
  styleUrl: './edit-schedule.component.css'
})
export class EditScheduleComponent implements OnInit, OnDestroy {
  @ViewChild('formDirective') formDirective: FormGroupDirective | undefined;
  static weekdays = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
  isSubmitting = false;
  ErrorMessages = {};
  scheduleForm: FormGroup;
  currentClincStoreSubscription?: Subscription;
  selectedClinicFirestorePath?: string;
  errorMessages = {
    main: '',
  }
  private _databaseService = inject(DatabaseService);
  private _router = inject(Router)
  private _formBuilder: FormBuilder = inject(FormBuilder);
  public clinics$?: Observable<Clinic[]>
  public clinicsSubscription?: Subscription;
  selectClinicBehaviorSubject?: BehaviorSubject<string>;
  weekScheduleTemplateCopy: { [key in Weekday]: string[] } = {
    SAT: [],
    SUN: [],
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
  };

  constructor(private store: Store<AppState>) {
    this.scheduleForm = this._formBuilder.group({
      SAT: new FormArray([]),
      SUN: new FormArray([]),
      MON: new FormArray([]),
      TUE: new FormArray([]),
      WED: new FormArray([]),
      THU: new FormArray([]),
      FRI: new FormArray([]),
    });
  }

  ngOnInit(): void {
    this.currentClincStoreSubscription = this.store.select(clinicToEdit)
      .subscribe(clinic => {
        console.log('newImage');
        console.log(clinic);
        this.selectedClinicFirestorePath = clinic?.firestorePath;
        for (let day of EditScheduleComponent.weekdays) {
          this.handleWeekday(day, clinic);
        }
      });
  }

  ngOnDestroy(): void {
    //this.clinicsSubscription?.unsubscribe();
    this.currentClincStoreSubscription?.unsubscribe();
  }

  exitEdit() {
    this.store.dispatch(doneEditingClinicScheduleTemplate());
  }

  matchLength(day: string, dayLength: number) {
    const targetArray: FormArray = this.scheduleForm.get(day) as FormArray;
    const diff = Math.abs(dayLength - targetArray.length);
    if (targetArray.length > dayLength) {
      for (let i = diff; i > 0; i--) {
        (<FormArray>this.scheduleForm?.get(day)).removeAt(targetArray.length - 1);
      }
    } else {
      for (let i = diff; i > 0; i--) {
        let intervalControl = new FormControl(null, Validators.required);
        (<FormArray>this.scheduleForm?.get(day)).push(intervalControl);
      }
    }
  }

  handleWeekday(day: string, clinic: Clinic | null) {
    console.log(`day: ${day}`);
    console.log(clinic);
    if (!clinic) {
      console.log('falseeeeeeee');
      return;
    }
    const dayArrLength = clinic.weekScheduleTemplate?.[day as Weekday]?.length ?? 0;
    const dayFormLength = (<FormArray>this.scheduleForm.get(day)).length;

    if (dayArrLength > 0 && dayFormLength === dayArrLength) {
      console.log('first');
      this.scheduleForm.get(day)?.setValue(clinic!.weekScheduleTemplate![day as Weekday]);
    } else if (dayArrLength > 0) {  // FORM current fields are greater or smaller
      console.log('second');
      this.matchLength(day, dayArrLength);
      (<FormArray>this.scheduleForm?.get(day)).setValue(clinic!.weekScheduleTemplate![day as Weekday]);
    } else {  // day should be cleared in the FORM
      console.log('third');
      this.matchLength(day, 0);
    }

    //this.weekScheduleTemplateCopy[day] = clinic?.weekScheduleTemplate?.[day] ?? [];
  }

  //onSelectionChange(val: string) {
  //  this.selectClinicBehaviorSubject?.next(val);
  //  this.updateScheduleFormFieldsInitialValues();
  //}

  //updateScheduleFormFieldsInitialValues() { }

  getControls(day: string) {
    return (<FormArray>this.scheduleForm.get(day)).controls;
  }

  trackByFunc(index: number, obj: any): any {
    return index;
  }

  onAddIntervalControls(day: string) {
    const startIntervalControl = new FormControl(null, Validators.required);
    const endIntervalControl = new FormControl(null, Validators.required);
    (<FormArray>this.scheduleForm?.get(day)).push(startIntervalControl);
    (<FormArray>this.scheduleForm?.get(day)).push(endIntervalControl);
  }

  onRemoveLastIntervalControl(day: string) {
    const targetArray: FormArray = this.scheduleForm?.get(day) as FormArray;
    (<FormArray>this.scheduleForm?.get(day)).removeAt(targetArray.length - 1);
    (<FormArray>this.scheduleForm?.get(day)).removeAt(targetArray.length - 1);
  }

  //updateErrorMessage() { }

  onSubmit() {
    if (!this.scheduleForm.valid) { return; }
    this.isSubmitting = true;
    const schd = {
      ...(this.scheduleForm.value.SAT.length > 0) && { SAT: this.scheduleForm.value.SAT },
      ...(this.scheduleForm.value.SUN.length > 0) && { SUN: this.scheduleForm.value.SUN },
      ...(this.scheduleForm.value.MON.length > 0) && { MON: this.scheduleForm.value.MON },
      ...(this.scheduleForm.value.TUE.length > 0) && { TUE: this.scheduleForm.value.TUE },
      ...(this.scheduleForm.value.WED.length > 0) && { WED: this.scheduleForm.value.WED },
      ...(this.scheduleForm.value.THU.length > 0) && { THU: this.scheduleForm.value.THU },
      ...(this.scheduleForm.value.FRI.length > 0) && { FRI: this.scheduleForm.value.FRI },
    }
    const path: string = this.selectedClinicFirestorePath!;
    this._databaseService.updateClinicWeekSchedule(schd, path)
      .pipe(take(1))
      .subscribe({
        next: (_) => {
          //this._router.;
          this.isSubmitting = false;
          this.scheduleForm.markAsUntouched();
          this.exitEdit();
          //this.formDirective!.resetForm();

        },
        error: (error: Error) => {
          this.errorMessages.main = error.message;
          this.isSubmitting = false;
        }
      });
  }

}
