import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'edit-schedule',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './edit-schedule.component.html',
  styleUrl: './edit-schedule.component.css'
})
export class EditScheduleComponent implements OnInit {
  isSynchingChanges = false;
  ErrorMessages = {};
  scheduleForm: FormGroup;

  private _formBuilder: FormBuilder = inject(FormBuilder);

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
  }

  getControls(day: string) {
    return (<FormArray>this.scheduleForm.get(day)).controls;
  }

  trackByFunc(index: number, obj: any): any {
    return index
  }

  onAddIntervalControls(day: string) {
    const startIntervalControl = new FormControl(null, Validators.required);
    const endIntervalControl = new FormControl(null, Validators.required);
    (<FormArray>this.scheduleForm?.get(day)).push(startIntervalControl);
    (<FormArray>this.scheduleForm?.get(day)).push(endIntervalControl);
  }

  updateErrorMessage() { }

  onSubmit() {
    if (!this.scheduleForm.valid) { return; }
    console.log(this.scheduleForm.value);
    //this.isSigningIn = true;
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
  }

}
