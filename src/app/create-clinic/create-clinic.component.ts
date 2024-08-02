import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DatabaseService } from '../database.service';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { AuthService } from '../auth.service';
import { AppUser } from '../auth/user.model';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'create-clinic',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './create-clinic.component.html',
  styleUrl: './create-clinic.component.css'
})
export class CreateClinicComponent implements OnInit, OnDestroy {
  private _databaseService = inject(DatabaseService);
  private _formBuilder = inject(FormBuilder);
  private _userSubscription?: Subscription;
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _currentUserID?: string;
  public isSubmitting = false;
  public errorMessages = {
    clinicName: '',
    clinicAddress: '',
    main: '',
  }
  public newClinicForm = this._formBuilder.group({
    clinicName: ['', Validators.required],
    clinicSubtitle: ['', Validators.required],
    clinicAddress: ['', Validators.required],
    personal: this._formBuilder.group({
      doctorEmails: this._formBuilder.array([]),
      assistantEmails: this._formBuilder.array([]),
    }),
  });

  ngOnInit() {
    this._userSubscription = this._authService.user$.subscribe(
      user => { this._currentUserID = user?.id; },
    );

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
      clinicAddress: this.newClinicForm.value.clinicAddress!,
      ownerID: this._currentUserID!,
      doctors: this.newClinicForm.value.personal!.doctorEmails! as string[],
      assistants: this.newClinicForm.value.personal!.assistantEmails! as string[]
    }).pipe(take(1)).subscribe({
      next: (_) => {
        this.isSubmitting = false;
        this.newClinicForm!.reset();
        //this._router.navigateByUrl('');
      },
      error: (error: Error) => {
        this.errorMessages.main = error.message;
        this.isSubmitting = false;
      }
    });
  }
}
