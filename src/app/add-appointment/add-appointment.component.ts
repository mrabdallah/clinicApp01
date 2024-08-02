import { Component, OnDestroy, Signal, computed, inject, signal } from '@angular/core';
import {
  // MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FormBuilder,
  // FormControl,
  // FormGroup,
  // FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

import moment from 'moment';  // tslint:disable-next-line:no-duplicate-imports

import { Store, select } from '@ngrx/store';

import { TemporaryDataSrvService } from '../temporary-data-srv.service'; // Import the data service
import { DatabaseService } from '../database.service';
import { Observable, Subscription, combineLatestWith, defer, first, from, map, of, take, tap, timer, withLatestFrom } from 'rxjs';
import { Appointment, Clinic, Patient, Weekday } from '../types';
import { TimeManagingAndPickingService } from '../time-managing-and-picking.service';
import * as ScheduleActions from "../store/schedule.actions";
import * as AppSelectors from "../store/app.selectors";
import { AppState } from '../store/app.reducer';
import { appReducers } from '../ngrx_store/reducers';


export const MY_FORMATS = {
  parse: {
    dateInput: 'MMMM Do, YYYY',  // Use MMMM for full month name, Do for day with ordinal suffix
  },
  display: {
    dateInput: 'MMMM Do, YYYY',  // Use MMMM for full month name, Do for day with ordinal suffix
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'MMMM Do, YYYY',  // For screen readers (full month name)
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

function isDigitsOnly(str: string): boolean {
  return /^\d+$/.test(str);
}

@Component({
  selector: 'app-add-appointment',
  standalone: true,
  providers: [
    // Moment can be provided globally to your app by adding `provideMomentDateAdapter`
    // to your app config. We provide it at the component level here, due to limitations
    // of our example generation script.
    provideMomentDateAdapter(MY_FORMATS),
  ],
  imports: [
    MatButtonModule,
    MatIcon,
    MatIconModule,
    MatButtonModule,
    MatDialogActions,
    // FormGroup,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,

    MatDialogClose,
    MatDialogTitle,
    MatAutocompleteModule,
    MatDialogContent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-appointment.component.html',
  styles: ``
})
export class AddAppointmentComponent implements OnDestroy {
  private databaseService = inject(DatabaseService);
  private allPatientsObservableSubscription?: Subscription;
  private dateFieldChangesSubscription?: Subscription;
  public nextAvailableTime = signal<number>(0);
  //private comibinedObsSubs?: Subscription;
  public unbookedTimes: { value: number, viewValue: string }[] = [];
  private appointmentTimeOptionsSubscription?: Subscription;
  private timeManagingAndPickingSerivce = inject(TimeManagingAndPickingService);
  //initialTimeSet = false; // Flag to track if initial suggestion was used
  private dayAppointments: Appointment[] = [];
  private dayAppointmentsSubsciption?: Subscription;
  private fliteringPatientNamesSubscription?: Subscription;
  //public clinicDoc$ = this.databaseService.clinicDocOneTimeSnapshot$;

  //public clinicDoc = toSignal(this.databaseService.clinicDocOneTimeSnapshot$, { initialValue: undefined });

  constructor(public dialogRef: MatDialogRef<AddAppointmentComponent>,
    private store: Store<AppState>,
    private formBuilder: FormBuilder,
    private temporaryDataSrvService: TemporaryDataSrvService
  ) {
    //this.allPatients$ = this.databaseService.fetchAllPatientsRealTimeSnapshot();
    //this.dayAppointmentsSubsciption = this.databaseService.todaySchedule$.subscribe((appointments) => {
    //  this.dayAppointments = [...appointments];
    //});
  }

  options: { firstName: string; lastName: string; id: string; primaryContact: string }[] = [];
  filteredOptions: { firstName: string; lastName: string; id: string; primaryContact: string }[] = [];
  filterCtrl = new FormControl('');

  ngOnInit() {

    //   *********** Initialization for the appState
    this.store.dispatch(ScheduleActions.setNewAppointmentTargetDate({
      // dateStr: '20_4_2009'
      dateStr: `${new Date().getDate()}_${new Date().getMonth() + 1}_${new Date().getFullYear()}`,
      dateObj: new Date(),
    }));

    this.store.dispatch(ScheduleActions.getNewAppointmentDayAppointments());


    // names for autocomplete
    this.allPatientsObservableSubscription = this.databaseService.fetchAllPatientsRealTimeSnapshot()
      .subscribe((arr) => {
        let tmpArr: any[] = [];
        arr.forEach((p) => {
          tmpArr.push({
            firstName: p.firstName,
            lastName: p.lastName,
            id: p.id,
            primaryContact: p.primaryContact,
          });
        });
        this.options = [...tmpArr];
      });


    // ******  Filter user names
    this.filteredOptions = this.options.slice(); // Initialize filtered names options
    this.fliteringPatientNamesSubscription = (this.newAppointmentForm.get('patientID') as FormControl).valueChanges
      .pipe(
        withLatestFrom(this.store.select(AppSelectors.newAppointmentDaySchedule)),
      )
      .subscribe(([value, appointments]) => {
        this.filteredOptions = this.options.filter(option => {
          let result: boolean = `${option.firstName} ${option.lastName}`.toLowerCase().includes(value!.toLowerCase());
          if (result === false && isDigitsOnly(value)) {
            result = `${option.primaryContact}`.includes(value);
          }
          if (appointments == undefined) {
            return result;
          }

          for (let a of appointments) {
            if (a.patient.id === option.id && a.state !== 'done') { result = false; }
          }

          return result;
        });
      });

    // ************ Subscribing for changes on date field,  update AppState
    this.newAppointmentForm.get('date')?.valueChanges.subscribe((value: moment.Moment | null) => {
      console.log('changedddddd', value);
      this.store.dispatch(ScheduleActions.setNewAppointmentTargetDate({
        dateStr: this.currentDateFieldIntoStr(value),
        dateObj: this.currentDateFieldIntoDate(value)
      }));
      this.store.dispatch(ScheduleActions.getNewAppointmentDayAppointments());
    });


    // *************        subscription for updating appointment time options
    this.appointmentTimeOptionsSubscription = this.timeManagingAndPickingSerivce.
      getAvailableAppointmentTimes().subscribe(availableTimes => {
        if (availableTimes.length < 1) {
          this.newAppointmentForm.get('time')?.disable();
        } else {
          this.newAppointmentForm.get('time')?.enable();
        }
        this.unbookedTimes = availableTimes.map((ttt) => {
          return {
            value: ttt.getTime(),
            viewValue: this.dateToTimeStr(ttt),
          };
        });
      });
  }  // end of ngOnInit()

  dateToTimeStr(date: Date): string {  // 15:00
    //const now = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    //const ampm = hours >= 12 ? 'PM' : 'AM';

    return `${hours}:${minutes}`;
  }


  getFullNameForDisplay(selection: any): string {
    let selectionIndex: number = this.options.findIndex(elem => elem.id === selection);
    if (selectionIndex >= 0) {
      //return `${this.options[selectionIndex]?.firstName} ${this.options[selectionIndex]?.lastName}`;
      return `${this.options[selectionIndex]?.firstName} ${this.options[selectionIndex]?.lastName}` +
        `     -    ${this.options[selectionIndex]?.primaryContact}`;

    } else {
      return '';
    }
  }

  onSelectionChange(_event: any) {
    // if (event.option.selected) {
    //   console.log(' if    event.option.value');
    //   console.log(event.option.value);


    // }
  }

  ngOnDestroy(): void {
    this.allPatientsObservableSubscription?.unsubscribe();
    this.appointmentTimeOptionsSubscription?.unsubscribe();
    this.dayAppointmentsSubsciption?.unsubscribe();
    this.fliteringPatientNamesSubscription?.unsubscribe();
    this.dayAppointmentsSubsciption?.unsubscribe();
  }


  newAppointmentForm = this.formBuilder.group({
    patientID: ['', Validators.required],
    date: new FormControl(moment()),
    //date: new FormControl(moment().format('DD/MM/YYYY')),
    //appointmentTime: [this.pickAppointmentTime(), Validators.required],
    //appointmentTime: ['', Validators.required],
    time: ['', Validators.required],
    reasonForVisit: ['', Validators.required],
    isUrgent: [false],
    paid: [false],
    patientInClinic: [false],

    // address: this.formBuilder.group({
    //   street: [''],
    //   city: [''],
    //   state: [''],
    //   zip: [''],
    // }),
  });

  getPatientFullData(id: string) {
    //if (id) {
    let patientIndex: number = this.options.findIndex(elem => elem.id === id);
    return this.options[patientIndex];
    //}
  }

  currentDateFieldIntoStr(value: moment.Moment | null): string {
    let targetDate: Date = new Date();

    //if (this.newAppointmentForm.value.date) {
    if (value !== null) {
      //targetDate = moment(this.newAppointmentForm.value.date, 'DD/MM/YYYY').toDate();
      targetDate = value.toDate();
    }

    const targetDateStr: string = `${targetDate.getDate()}_`
      + `${targetDate.getMonth() + 1}_`
      + `${targetDate.getFullYear()}`;

    return targetDateStr;
  }

  currentDateFieldIntoDate(value: moment.Moment | null): Date {
    //if (this.newAppointmentForm.value.date) {
    if (value !== null) {
      return value.toDate();
    } else {
      return new Date();
    }
  }

  onSubmit() {
    this.dialogRef.close();
    let patientDataObject = this.getPatientFullData(this.newAppointmentForm.value.patientID!);
    const bookedDate: Date = new Date(parseInt(this.newAppointmentForm.value.time!));
    //const bookedDate: Date = moment(this.newAppointmentForm.value.date, 'DD/MM/YYYY').toDate();
    //const bookedTime: Date = this.newAppointmentForm.value.appointmentTime;
    const targetDateString: string = `${bookedDate.getDate()}_${bookedDate.getMonth() + 1}_${bookedDate.getFullYear()}`;

    //bookedDate.((this.newAppointmentForm.value.time))
    console.log(this.newAppointmentForm.value.time)
    console.log(bookedDate)

    this.store.dispatch(ScheduleActions.createNewAppointment({
      appointment: {
        dateTime: bookedDate,
        //dateTime: moment(this.newAppointmentForm.value.date, 'DD/MM/YYYY').toDate(),
        expectedTime: `${bookedDate.getHours().toString().padStart(2, '0')}:${bookedDate.getMinutes().toString().padStart(2, '0')}`,
        //expectedTime: typeof (this.newAppointmentForm.value.appointmentTime) === 'string' ? this.newAppointmentForm.value.appointmentTime : '',
        state: 'waiting',
        isUrgent: typeof this.newAppointmentForm.value.isUrgent === 'boolean' ? this.newAppointmentForm.value.isUrgent : false,
        patientInClinic: typeof (this.newAppointmentForm.value.patientInClinic) === 'boolean' ? this.newAppointmentForm.value.patientInClinic : false,
        reasonForVisit: this.newAppointmentForm.value.reasonForVisit ?? '',
        paid: typeof (this.newAppointmentForm.value.paid) === 'boolean' ? this.newAppointmentForm.value.paid : false,
        latenessCtr: 0,
        patient: {
          id: this.newAppointmentForm.value.patientID!,
          firstName: patientDataObject.firstName,
          lastName: patientDataObject.lastName,
          // primaryContact: patientDataObject.primaryContact,
          // dateOfBirth: patientDataObject.dateOfBirth,
        }
      }, targetDateStr: targetDateString
    }));
  }

  openNewPatientFormDialog() {
    this.dialogRef.close();
    // fire ngrx action
    // this.store.dispatch(login());
    this.temporaryDataSrvService.setData(true);
  }
}
