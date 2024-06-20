import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DatabaseService } from '../database.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  public newClinicForm?: FormGroup;
  public isSubmitting = false;
  public errorMessages = {
    clinicName: '',
    clinicAddress: '',
    main: '',
  }

  ngOnInit() {
    this.newClinicForm = this._formBuilder.group({
      clinicName: ['', Validators.required],
      clinicAddress: ['', Validators.required],
    });
    this._userSubscription = this._authService.user$.subscribe(
      user => { this._currentUserID = user?.id; },
    );
  }

  ngOnDestroy(): void {
    this._userSubscription?.unsubscribe();
  }

  onSubmit() {
    if (!this.newClinicForm!.valid) { return; }
    this.isSubmitting = true;
    this._databaseService.addNewClinic({
      clinicName: this.newClinicForm!.value.clinicName,
      clinicAddress: this.newClinicForm!.value.clinicAddress,
      ownerID: this._currentUserID!,
    }).pipe(take(1)).subscribe({
      next: (_) => {
        this.isSubmitting = false;
        this.newClinicForm!.reset();
        this._router.navigateByUrl('');
      },
      error: (error: Error) => {
        this.errorMessages.main = error.message;
        this.isSubmitting = false;
      }
    });
  }
}
