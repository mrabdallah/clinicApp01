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
  //public allPatients$: Observable<Patient[]> = of([]);
  public nextAvailableTime = signal<number>(0);
  //private comibinedObsSubs?: Subscription;
  public suggestedTimes?: { value: number, viewValue: string }[] = [];
  private suggestedAppointmentTimeSubscription?: Subscription;
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
    // names for autocomplete
    this.allPatientsObservableSubscription = //this.allPatients$
      this.databaseService.fetchAllPatientsRealTimeSnapshot()
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


    this.filteredOptions = this.options.slice(); // Initialize filtered names options
    this.fliteringPatientNamesSubscription = (this.newAppointmentForm.get('patientID') as FormControl).valueChanges
      .pipe(
        withLatestFrom(this.store.select(AppSelectors.newAppointmentDaySchedule)),
      )

      .subscribe(([value, appointments]) => {
        this.filteredOptions = this.options.filter(option => {
          let result: boolean = `${option.firstName} ${option.lastName}`.toLowerCase().includes(value!.toLowerCase());
          //for (let a of this.dayAppointments) {
          if (appointments !== undefined) {
            for (let a of appointments) {
              if (a.patient.id === option.id && a.state !== 'done') { result = false; }
            }
          }

          return result;
        });
      });


    const dateObj = moment(this.newAppointmentForm.value.date, 'dd/mm/yyyy').toDate();
    dateObj.setHours(0, 0, 0, 0);

    this.store.dispatch(ScheduleActions.setNewAppointmentTargetDate({
      dateStr: this.momentIntoMyStrFormat().length > 0 ? this.momentIntoMyStrFormat() :
        `${new Date().getDate()}_${new Date().getMonth() + 1}_ ${new Date().getFullYear()}`,
      dateObj: dateObj,
    }));

    const targetDate = moment(this.newAppointmentForm?.value.date, 'dd/mm/yyyy').toDate();


    this.store.dispatch(ScheduleActions.getNewAppointmentDayAppointments());

    this.suggestedAppointmentTimeSubscription = this.timeManagingAndPickingSerivce.
      getAvailableAppointmentTimes().subscribe(suggestedTimes => {
        this.suggestedTimes = suggestedTimes.map((ttt) => {
          return {
            value: ttt.getTime(),
            viewValue: this.dateToTimeStr(ttt),
          };
        });

        console.log(this.suggestedTimes);
        //if (!this.newAppointmentForm.get('time')?.dirty) {
        //  //this.newAppointmentForm.get('time')?.setValue(suggestedTimes.length > 0 ? `${suggestedTimes[0].getHours()}:${suggestedTimes[0].getMinutes()}` : `${new Date().getHours()}:${new Date().getMinutes()}`);
        //  //this.newAppointmentForm.get('appointmentTime')?.setValue(this.timeManagingAndPickingSerivce.epochIntoTimeInputFieldFormat(suggestedTimes[0] ?? `${new Date().getHours()}:${new Date().getMinutes()}`));
        //}
      });
  }

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
      return `${this.options[selectionIndex]?.firstName} ${this.options[selectionIndex]?.lastName}`;
    } else {
      return '';
    }
  }

  onSelectionChange(event: any) {
    // if (event.option.selected) {
    //   console.log(' if    event.option.value');
    //   console.log(event.option.value);


    // }
  }

  ngOnDestroy(): void {
    this.allPatientsObservableSubscription?.unsubscribe();
    this.suggestedAppointmentTimeSubscription?.unsubscribe();
    this.dayAppointmentsSubsciption?.unsubscribe();
    this.fliteringPatientNamesSubscription?.unsubscribe();
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

  momentIntoMyStrFormat(): string {
    if (this.newAppointmentForm.value.date) {
      const targetDate = moment(this.newAppointmentForm.value.date, 'DD/MM/YYYY').toDate();
      const targetDateModified = `${targetDate.getDate()}_`
        + `${targetDate.getMonth() + 1}_`
        + `${targetDate.getFullYear()}`;
      return targetDateModified;
    }
    return '';
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
