import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Clinic } from '../types';
import { DatabaseService } from '../database.service';
import { BehaviorSubject, Observable, Subscription, fromEvent, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CreateClinicComponent } from '../create-clinic/create-clinic.component';
import { MatSelectModule } from '@angular/material/select';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
import { Router } from '@angular/router';
//import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'edit-schedule',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AsyncPipe,
    CreateClinicComponent,
  ],
  templateUrl: './edit-schedule.component.html',
  styleUrl: './edit-schedule.component.css'
})
export class EditScheduleComponent implements OnInit, OnDestroy {
  isSubmitting = false;
  ErrorMessages = {};
  scheduleForm: FormGroup;
  currentClinc?: Clinic;
  clinics: Clinic[] = [];
  selectedClinicID?: string;
  errorMessages = {
    main: '',
  }
  private _databaseService = inject(DatabaseService);
  private _router = inject(Router)
  private _formBuilder: FormBuilder = inject(FormBuilder);
  public clinics$?: Observable<Clinic[]>
  public clinicsSubscription?: Subscription;
  selectClinicBehaviorSubject?: BehaviorSubject<string>;

  constructor() {
    this.scheduleForm = this._formBuilder.group({
      sat: new FormArray([]),
      sun: new FormArray([]),
      mon: new FormArray([]),
      tue: new FormArray([]),
      wed: new FormArray([]),
      thu: new FormArray([]),
      fri: new FormArray([]),
    });
  }

  ngOnInit(): void {
    //this.clinics$ = this._databaseService.clinics$.pipe(take(1));
    this.clinicsSubscription = this._databaseService.clinics$.subscribe((clinics: Clinic[]) => {
      this.clinics = [...clinics];
    });
    this.selectClinicBehaviorSubject = new BehaviorSubject('');
  }

  ngOnDestroy(): void {
    this.clinicsSubscription?.unsubscribe();
  }

  onSelectionChange(val: string) {
    this.selectClinicBehaviorSubject?.next(val);
    this.updateScheduleFormFieldsInitialValues();
  }

  updateScheduleFormFieldsInitialValues() {
    this._databaseService.
  }

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

  updateErrorMessage() { }

  onSubmit() {
    if (!this.scheduleForm.valid) { return; }
    this.isSubmitting = true;
    console.log(this.scheduleForm.value);
    //this.authService.signIn(this.signInForm.value.email!, this.signInForm.value.password!)
    //  //.pipe(take(1))
    //  .subscribe({
    //    next: (_) => {
    //      this.router.navigateByUrl('');
    //      this.isSigningIn = false;
    //      this.signInForm.reset();
    //    },
    //    error: (error: Error) => {
    //      this.errorMessages.main = error.message;
    //      this.isSigningIn = false;
    //    }
    //  });
    const schd = {
      ...(this.scheduleForm.value.sat.length > 0) && { sat: this.scheduleForm.value.sat },
      ...(this.scheduleForm.value.sun.length > 0) && { sun: this.scheduleForm.value.sun },
      ...(this.scheduleForm.value.mon.length > 0) && { mon: this.scheduleForm.value.mon },
      ...(this.scheduleForm.value.tue.length > 0) && { tue: this.scheduleForm.value.tue },
      ...(this.scheduleForm.value.wed.length > 0) && { wed: this.scheduleForm.value.wed },
      ...(this.scheduleForm.value.thu.length > 0) && { thu: this.scheduleForm.value.thu },
      ...(this.scheduleForm.value.fri.length > 0) && { fri: this.scheduleForm.value.fri },
    }
    const path: string = this.clinics.find(element => element.id === this.selectedClinicID)!.firestorePath!;
    this._databaseService.updateClinicWeekSchedule(schd, path)
      .pipe(take(1))
      .subscribe({
        next: (_) => {
          //this._router.;
          this.isSubmitting = false;
          this.scheduleForm.reset();

        },
        error: (error: Error) => {
          this.errorMessages.main = error.message;
          this.isSubmitting = false;
        }
      });
  }

}
