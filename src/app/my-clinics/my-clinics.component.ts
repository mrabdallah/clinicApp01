import { Component, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


import { Store } from '@ngrx/store';
import { BehaviorSubject, Subscription, map, take } from 'rxjs';

import { AppState } from '../store/app.reducer';
import { Clinic } from '../types';
import * as ClinicActions from '../store/clinic.actions';
import * as AppSelectors from '../store/app.selectors';
import { CreateClinicComponent } from '../create-clinic/create-clinic.component';
import { cloneDeep } from 'lodash-es';
import { EditScheduleComponent } from '../edit-schedule/edit-schedule.component';
//import { ClinicCardComponent } from '../clinic-card/clinic-card.component';
import { StaffClinicCardComponent } from '../staff-clinic-card/staff-clinic-card.component';
import { MatDialog, MatDialogContent } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatabaseService } from '../database.service';


@Component({
  selector: 'my-clinics',
  standalone: true,
  imports: [
    AsyncPipe,
    //ClinicCardComponent,
    StaffClinicCardComponent,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CreateClinicComponent,
    EditScheduleComponent,
  ],
  templateUrl: './my-clinics.component.html',
  styleUrl: './my-clinics.component.css'
})
export class MyClinicsComponent implements OnInit, OnDestroy {
  myClinics$ = this.store.select(AppSelectors.myClinics);
  myClinics = toSignal(this.myClinics$);
  selectedClinic$ = this.store.select(AppSelectors.selectedClinic);
  selectedClinicSignal = toSignal(this.selectedClinic$);
  selectedClinicID?: string;
  selectedClinicBehaviorSubject = new BehaviorSubject('');
  private _currentUserSubscription?: Subscription;
  readonly dialog = inject(MatDialog);

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this._currentUserSubscription = this.store.select(AppSelectors.user)
      .subscribe(
        (user) => {
          this.store.dispatch(ClinicActions.fetchMyClinicsStart());
        });
  }

  ngOnDestroy(): void {
    this._currentUserSubscription?.unsubscribe();
  }

  openCreateClinicDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(CreateClinicDialog, {
      width: '85vw',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }


  //onSelectionChange(val: string) {
  //  this.selectedClinicBehaviorSubject?.next(val);
  //  const selectedClinic = this.myClinics()!.find(clinic => clinic.id === val);
  //  this.store.dispatch(ClinicActions.selectClinic({ clinic: cloneDeep(selectedClinic!) }));
  //  //this.updateScheduleFormFieldsInitialValues();
  //}
}


@Component({
  selector: 'create-clinic-dialog',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogContent,
    MatIconModule,
  ],
  templateUrl: './create-clinic-dialog.html',
  styleUrl: './create-clinic-dialog.css'
})
export class CreateClinicDialog implements OnInit, OnDestroy {
  private _databaseService = inject(DatabaseService);
  private _formBuilder = inject(FormBuilder);
  private _userSubscription?: Subscription;
  //private _router = inject(Router);
  //private _authService = inject(AuthService);
  private _currentUserID?: string;
  public isSubmitting = false;
  public errorMessages = {
    clinicName: '',
    clinicAddress: '',
    clinicSubtitle: '',
    main: '',
  }
  @ViewChild('formDirective')
  formDirective: FormGroupDirective | undefined;

  public newClinicForm = this._formBuilder.group({
    clinicName: ['', Validators.required],
    clinicSubtitle: ['', Validators.required],
    clinicAddress: ['', Validators.required],
    personal: this._formBuilder.group({
      doctorEmails: this._formBuilder.array([]),
      assistantEmails: this._formBuilder.array([]),
    }),
  });

  constructor(private _store: Store<AppState>) { }

  ngOnInit() {
    //this._userSubscription = this._authService.user$.subscribe(
    //  user => { this._currentUserID = user?.id; },
    //);

    this._userSubscription = this._store.select(AppSelectors.user).pipe(map(user => user?.id)).subscribe((userID) => {
      this._currentUserID = userID;
    })

    this.addPersonalControls('doctorEmails');
    this.addPersonalControls('assistantEmails');
  }

  ngOnDestroy(): void {
    this._userSubscription?.unsubscribe();
  }

  getPersonalControls(controlName: string) {
    return (<FormArray>this.newClinicForm.get('personal')?.get(controlName))?.controls;
  }

  addPersonalControls(controlName: string) {
    const control = new FormControl('', [Validators.required, Validators.email]);
    (<FormArray>this.newClinicForm.get('personal')?.get(controlName)).push(control);
  }

  removePersonalControls(controlName: string) {
    const targetArray: FormArray = this.newClinicForm.get('personal')?.get(controlName) as FormArray;
    (<FormArray>this.newClinicForm.get('personal')?.get(controlName)).removeAt(targetArray.length - 1);
  }

  trackByFunc(index: number, _obj: any): any {
    return index;
  }

  onSubmit() {

    if (!this.newClinicForm!.valid) { return; }
    console.warn(this.newClinicForm.value);
    this.isSubmitting = true;
    this._databaseService.addNewClinic({
      clinicName: this.newClinicForm.value.clinicName!,
      clinicSubtitle: this.newClinicForm.value.clinicSubtitle!,
      clinicAddress: this.newClinicForm.value.clinicAddress!,
      ownerID: this._currentUserID!,
      personal: {
        doctorIDs: this.newClinicForm.value.personal!.doctorEmails! as string[],
        assistantIDs: this.newClinicForm.value.personal!.assistantEmails! as string[]
      },
    }).pipe(take(1)).subscribe({
      next: (_) => {
        this.isSubmitting = false;
        this.newClinicForm!.reset();
        this.formDirective?.resetForm();
        //this._router.navigateByUrl('');
      },
      error: (error: Error) => {
        this.errorMessages.main = error.message;
        this.isSubmitting = false;
      }
    });
  }
}
