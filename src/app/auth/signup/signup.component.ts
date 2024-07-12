import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { take } from 'rxjs';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isSigningUp = false;
  hidePassword = true;
  errorMessages = {
    email: '',
    password: '',
    confirmPassword: '',
    main: '',
  }
  private formBuilder: FormBuilder = inject(FormBuilder);

  //constructor(private formBuilder: FormBuilder){}

  togglePasswordVisibility(event: MouseEvent) {
    this.hidePassword = !this.hidePassword;
    event.stopPropagation();
  }

  signUpForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, this.passwordMatchValidator]],
  });

  passwordMatchValidator(control: any): ValidationErrors | null {
    if (!control.parent || !control) {
      return null;
    }

    const password = control.parent.get('password').value;
    const confirmPassword = control.value;

    if (confirmPassword !== password) {
      return { passwordsDontMatch: true };
    }

    return null;
  }

  updateErrorMessage() {
    const emailControl = this.signUpForm.get('email');
    if (emailControl?.hasError('required')) {
      this.errorMessages.email = 'You must enter a value';
    } else if (emailControl?.hasError('email')) {
      this.errorMessages.email = 'Not a valid email';
    } else {
      this.errorMessages.email = '';
    }

    const passwordControl = this.signUpForm.get('password');
    if (passwordControl?.hasError('required')) {
      this.errorMessages.password = 'Password is required';
    } else if (passwordControl?.hasError('minlength')) {
      this.errorMessages.password = 'Password must be at least 6 characters';
    } else {
      this.errorMessages.password = '';
    }

    const confirmPasswordControl = this.signUpForm.get('confirmPassword');
    if (confirmPasswordControl?.hasError('required')) {
      this.errorMessages.confirmPassword = 'Confirm password is required';
    } else if (confirmPasswordControl?.hasError('passwordsDontMatch')) {
      this.errorMessages.confirmPassword = 'Passwords do not match';
    } else {
      this.errorMessages.confirmPassword = '';
    }
  }


  onSubmit() {
    if (!this.signUpForm.valid) { return; }
    this.isSigningUp = true;
    if (this.signUpForm.valid) {
      this.isSigningUp = true;
      this.authService.signUp(this.signUpForm.value.email!, this.signUpForm.value.password!)
        //.pipe(take(1))
        .subscribe({
          next: (_) => {
            this.router.navigateByUrl('');
            this.isSigningUp = false;
            this.signUpForm.reset();
          },
          error: (error) => {
            this.errorMessages.main = error.message;
            this.isSigningUp = false;
          }
        });
    }
  }

}
