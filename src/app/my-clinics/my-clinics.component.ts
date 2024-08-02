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
import { CreateClinicDialog } from './create-clinic-dialog/create-clinic-dialog';


@Component({
  selector: 'my-clinics',
  standalone: true,
  imports: [
    AsyncPipe,
    CreateClinicDialog,
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
          if (!user) {
            return
          }
          if (user.roles?.includes('doctor')) {
            this.store.dispatch(ClinicActions.fetchDoctorClinicsStart());
          }
          if (user.roles?.includes('owner')) {
            this.store.dispatch(ClinicActions.fetchMyClinicsStart());
          }
          if (user.roles?.includes('assistant')) {
            this.store.dispatch(ClinicActions.fetchAssistantClinicsStart());
          }
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



