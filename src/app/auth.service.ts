import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user, UserCredential } from "@angular/fire/auth";
import { Observable, from } from 'rxjs';
import { AppUser } from './auth/user_interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  currentUserSignal = signal<AppUser | undefined | null>(undefined);
  user$ = user(this.firebaseAuth);

  //constructor() { }

  signUp(email: string, password: string): Observable<any> {
    //this.firebaseAuth.
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log(user);
        //updateProfile(userCredential.user, { displayName: 'username' })
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(error);
        // ..
      });
    return from(promise);
  }
  signIn(email: string, password: string): Observable<UserCredential> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
        return user;
      })
      .catch((error) => {
        //const errorCode = error.code;
        //const errorMessage = error.message;
        return error;
      });
    return from(promise);
  }
}
