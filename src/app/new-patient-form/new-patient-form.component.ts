import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
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
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';  // tslint:disable-next-line:no-duplicate-imports
import { MatSelectModule } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Store, select } from '@ngrx/store';
import { State } from '../ngrx_store/reducers/index'; // Import your state interface
import { TemporaryDataSrvService } from '../temporary-data-srv.service'; // Import the data service
import { DatabaseService } from '../database.service';
import { MatCheckboxModule } from '@angular/material/checkbox';




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
  selector: 'new-patient-form',
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
    MatCheckboxModule,
    MatDialogActions,
    // FormGroup,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    
    MatDatepickerModule,

    MatDialogClose,
    MatDialogTitle,
    MatAutocompleteModule,
    MatDialogContent,
    ReactiveFormsModule,
  ],
  templateUrl: './new-patient-form.component.html',
  styles: ``
})
export class NewPatientFormComponent {
  databaseService: DatabaseService = inject(DatabaseService);

  constructor(public dialogRef: MatDialogRef<NewPatientFormComponent>,
    private store: Store<State>,
    private formBuilder: FormBuilder,
    private temporaryDataSrvService: TemporaryDataSrvService
    ) { }

    profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      primaryContact: ['', Validators.required],
      emergencyContact: [''],
      reasonForVisit: ['', Validators.required],
      allergies: [''],
      pastMedicalHistory: [''],
      familyMedicalHistory: [''],
      socialHistory: [''],
      preferredAppointmentDaysAndTimes: [''],
      optInForDataSharing: [false],
      dateOfBirth: new FormControl(moment().format('DD/MM/YYYY')),
      // address: this.formBuilder.group({
      //   street: [''],
      //   city: [''],
      //   state: [''],
      //   zip: [''],
      // }),
    });
  
    onSubmit() {
      // TODO: Use EventEmitter with form value
      this.temporaryDataSrvService.setData(false);
      // console.log(`\x1B[34m${JSON.stringify(this.profileForm.value)}\x1B[0m`);
      this.dialogRef.close();
      this.databaseService.setNewPatient({
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        address: this.profileForm.value.address,
        primaryContact: this.profileForm.value.primaryContact,
        emergencyContact: this.profileForm.value.emergencyContact,
        reasonForVisit: this.profileForm.value.reasonForVisit,
        allergies: this.profileForm.value.allergies,
        pastMedicalHistory: this.profileForm.value.pastMedicalHistory,
        familyMedicalHistory: this.profileForm.value.familyMedicalHistory,
        socialHistory: this.profileForm.value.socialHistory,
        preferredAppointmentDaysAndTimes: this.profileForm.value.preferredAppointmentDaysAndTimes,
        optInForDataSharing: this.profileForm.value.optInForDataSharing,
        dateOfBirth: this.profileForm.value.dateOfBirth,
      });
    }
}
