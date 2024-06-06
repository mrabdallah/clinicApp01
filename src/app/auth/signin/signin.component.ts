import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isSigningIn = false;
  hidePassword = true;
  errorMessages = {
    email: '',
    password: '',
    main: '',
  }
  private formBuilder: FormBuilder = inject(FormBuilder);

  //constructor(private formBuilder: FormBuilder){}

  togglePasswordVisibility(event: MouseEvent) {
    this.hidePassword = !this.hidePassword;
    event.stopPropagation();
  }

  signInForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  updateErrorMessage() {
    const emailControl = this.signInForm.get('email');
    if (emailControl?.hasError('required')) {
      this.errorMessages.email = 'You must enter a value';
    } else if (emailControl?.hasError('email')) {
      this.errorMessages.email = 'Not a valid email';
    } else {
      this.errorMessages.email = '';
    }

    const passwordControl = this.signInForm.get('password');
    if (passwordControl?.hasError('required')) {
      this.errorMessages.password = 'Password is required';
    } else if (passwordControl?.hasError('minlength')) {
      this.errorMessages.password = 'Password must be at least 6 characters';
    } else {
      this.errorMessages.password = '';
    }
  }

  onSubmit() {
    if (!this.signInForm.valid) { return; }
    this.isSigningIn = true;
    this.authService.signIn(this.signInForm.value.email!, this.signInForm.value.password!)
      //.pipe(take(1))
      .subscribe({
        next: (_) => {
          this.router.navigateByUrl('');
          this.isSigningIn = false;
          this.signInForm.reset();
        },
        error: (error: Error) => {
          this.errorMessages.main = error.message;
          this.isSigningIn = false;

        }
      });
  }
}
