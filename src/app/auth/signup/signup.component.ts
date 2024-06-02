import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  hidePassword = true;
  errorMessages = {
    email: '',
    password: '',
    confirmPassword: 'fffffff',
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
      console.error('r');
      this.errorMessages.confirmPassword = 'Confirm password is required';
    } else if (confirmPasswordControl?.hasError('passwordsDontMatch')) {
      console.error('d');
      this.errorMessages.confirmPassword = 'Passwords do not match';
    } else {
      console.error('n');
      this.errorMessages.confirmPassword = '';
    }
  }


  onSubmit() { }

}
