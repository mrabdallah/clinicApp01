import { Component } from '@angular/core';
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
    
    MatDatepickerModule,

    MatDialogClose,
    MatDialogTitle,
    MatAutocompleteModule,
    MatDialogContent,
    ReactiveFormsModule],
  templateUrl: './add-appointment.component.html',
  styles: ``
})
export class AddAppointmentComponent {
  constructor(public dialogRef: MatDialogRef<AddAppointmentComponent>, private formBuilder: FormBuilder) { }

  options = ['Option 1', 'Option 2', 'Option 3', 'Longer Option Text'];
  filteredOptions: string[] = [];
  filterCtrl = new FormControl('');

  ngOnInit() {
    this.filteredOptions = this.options.slice(); // Initialize filtered options
    (this.profileForm.get('name') as FormControl).valueChanges.subscribe(value => {
      this.filteredOptions = this.options.filter(option =>
        option.toLowerCase().includes(value!.toLowerCase())
      );
    });
  }

  onSelectionChange(event: any) {
    if (event.option.selected) {
      this.filterCtrl.setValue(event.option.value); // Update form control value on selection
    }
  }


  /**
   *     firstName: ['', Validators.required],
    lastName: [''],
   */

  profileForm = this.formBuilder.group({
    name: ['', Validators.required],
    date: new FormControl(moment().format('DD/MM/YYYY')),
    address: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      zip: [''],
    }),
  });

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.log(`\x1B[34m${JSON.stringify(this.profileForm.value)}\x1B[0m`);
  }
}