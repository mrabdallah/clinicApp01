import { Component, OnDestroy, Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  // MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
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
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Store, select } from '@ngrx/store';
import { State } from '../ngrx_store/reducers/index'; // Import your state interface
import { TemporaryDataSrvService } from '../temporary-data-srv.service'; // Import the data service
import { DatabaseService } from '../database.service';
import { Observable, Subscription, combineLatest, defer, first, from, map, of, take, tap, timer } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Clinic, Patient, Weekday } from '../types';



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
  public allPatients$: Observable<Patient[]> = of([]);
  public nextAvailableTime = signal<number>(0);
  private comibinedObsSubs?: Subscription;
  //public clinicDoc$ = this.databaseService.clinicDocOneTimeSnapshot$;

  //public clinicDoc = toSignal(this.databaseService.clinicDocOneTimeSnapshot$, { initialValue: undefined });

  constructor(public dialogRef: MatDialogRef<AddAppointmentComponent>,
    private store: Store<State>,
    private formBuilder: FormBuilder,
    private temporaryDataSrvService: TemporaryDataSrvService
  ) {
    this.allPatients$ = this.databaseService.fetchAllPatientsRealTimeSnapshot();
  }

  options: any[] = [];
  filteredOptions: any[] = [];
  filterCtrl = new FormControl('');

  ngOnInit() {
    this.allPatientsObservableSubscription = this.allPatients$
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


    this.filteredOptions = this.options.slice(); // Initialize filtered options
    (this.profileForm.get('patientID') as FormControl).valueChanges.subscribe(value => {
      this.filteredOptions = this.options.filter(option =>
        `${option.firstName} ${option.lastName}`.toLowerCase().includes(value!.toLowerCase())
      );
    });
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
    this.comibinedObsSubs?.unsubscribe();
  }

  getTimeNowIn12h(): string {
    const now = new Date();
    const hours = now.getHours();
    const adjustedHours = hours % 12 || 12; // Convert to 12-hour format (12 for midnight/noon)
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    return `${adjustedHours}:${minutes} ${ampm}`;
  }

  getTimeNowIn24H(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  pickAppointmentTime() {
    console.log('picking');
    const now = new Date();
    const todayNameInTheWeek: number = now.getDay();
    const dayNames: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    let mainAverageAppointmentTimeTake: number | undefined;
    let numberOfCurrentAppointments: number = 0;

    //combineLatest([this.databaseService.todaySchedule$, timer(1000, 4000)])
    this.comibinedObsSubs = combineLatest([this.databaseService.todaySchedule$, this.databaseService.clinicDocOneTimeSnapshot$])
      .subscribe(([schedVal, clinicVal]) => {
        mainAverageAppointmentTimeTake = clinicVal?.mainAverageAppointmentTimeTake;
        numberOfCurrentAppointments ??= schedVal?.length;
        let todayScheduleTemplate = clinicVal?.weekScheduleTemplate[dayNames[todayNameInTheWeek] as Weekday];

        if (now.getHours()) {
        } else if (numberOfCurrentAppointments > 0) {
          //
        } else {
        }
        // check if now is passed schedule template
        // if no appiontments yet
        // // identify current time
        // // convert schedule template into comparable form
        // // identify which is time period in schedule template
        // // pick the start of the identified period
        //
        // if there are number of appointments
        // convert schedule template into comparable form
        // calculate the sum time for current appointments
        // check which period is is ocupied or free
        // identify expected opening
        //
        //
        console.log(`Inside combineLatest; mainAva: ${mainAverageAppointmentTimeTake},  numberOfCurrApp: ${numberOfCurrentAppointments}`);
        console.log('reached');
      });



    // get target day schedule template
    // get number of existing appointments
    // get mainAverage
    // calculate expected time till free slot
    // set value, do not return a value
    //return this.getTimeNowIn24H();
  }

  profileForm = this.formBuilder.group({
    patientID: ['', Validators.required],
    date: new FormControl(moment()),
    //date: new FormControl(moment().format('DD/MM/YYYY')),
    appointmentTime: [this.pickAppointmentTime(), Validators.required],
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

  getPatientFullData(id?: string) {
    if (id) {
      let patientIndex: number = this.options.findIndex(elem => elem.id === id);
      return this.options[patientIndex];
    }
  }

  onSubmit() {
    this.dialogRef.close();
    let patientDataObject = this.getPatientFullData(this.profileForm.value.patientID!);
    let targetDateString: string = ((): string => {
      const targetDate = moment(this.profileForm.value.date, 'DD/MM/YYYY').toDate();
      const targetDateModified = `${targetDate.getDate()}_`
        + `${targetDate.getMonth() + 1}_`
        + `${targetDate.getFullYear()}`;
      return targetDateModified;
    })();

    this.databaseService.createNewAppointment(
      {
        dateTime: moment(this.profileForm.value.date, 'DD/MM/YYYY').toDate(),
        state: 'waiting',
        isUrgent: typeof this.profileForm.value.isUrgent === 'boolean' ? this.profileForm.value.isUrgent : false,
        patientInClinic: typeof (this.profileForm.value.patientInClinic) === 'boolean' ? this.profileForm.value.patientInClinic : false,
        reasonForVisit: this.profileForm.value.reasonForVisit ?? '',
        paid: typeof (this.profileForm.value.paid) === 'boolean' ? this.profileForm.value.paid : false,
        latenessCtr: 0,
        patient: {
          id: this.profileForm.value.patientID!,
          firstName: patientDataObject.firstName,
          lastName: patientDataObject.lastName,
          // primaryContact: patientDataObject.primaryContact,
          // dateOfBirth: patientDataObject.dateOfBirth,
        },
      },
      targetDateString,
    );
  }

  openNewPatientFormDialog() {
    this.dialogRef.close();
    // fire ngrx action
    // this.store.dispatch(login());
    this.temporaryDataSrvService.setData(true);
  }
}
