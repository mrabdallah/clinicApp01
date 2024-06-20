import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user, UserCredential } from "@angular/fire/auth";
import { Observable, catchError, from, map, tap, throwError } from 'rxjs';
import { AppUser } from './auth/user.model';
import { LoggerService } from './logger.service';
import { FirebaseError } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggerService = inject(LoggerService);
  firebaseAuth = inject(Auth);
  //#user$ = user(this.firebaseAuth);
  user$: Observable<AppUser | null> = user(this.firebaseAuth)
    .pipe(map(user => {
      if (user) {
        this.loggerService.log(`user logged in; ${user.email}`);
        return new AppUser(user.email!, user.uid!, user.displayName || undefined);
      } else {
        this.loggerService.log(`user logged out.`);
        return null;
      }
    }));
  //userSignal = signal<AppUser | undefined | null>(undefined);

  //constructor() { }
  //
  //get user$() { return this.#user$; }

  private handleError(error: FirebaseError) {
    let errorMessage = 'An unknown error occurred!';
    if (!error || !error.code) {
      return throwError(() => new Error(errorMessage));
    }
    switch (error.code) {
      case 'auth/email-already-exists':
        errorMessage = 'This email exists already';
        break;
      //case 'EMAIL_NOT_FOUND':
      //  errorMessage = 'This email does not exist.';
      //  break;
      case 'auth/invalid-credential':
        errorMessage = 'Email or Password are incorrect';
        break;
    }
    return throwError(() => new Error(errorMessage));
  }

  signUp(email: string, password: string): Observable<any> {
    //this.firebaseAuth.
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential) => {
        // Signed up
        // const user = userCredential.user;
        this.loggerService.log(userCredential.user);
        // updateProfile(userCredential.user, { displayName: 'username' })
        // ...
        return userCredential
      });
    //.catch((error) => {
    //  const errorCode = error.code;
    //  const errorMessage = error.message;
    //  this.loggerService.logError(error);
    //  // ..
    //  return error;
    //});
    return from(promise)
      .pipe(
        //tap(x => console.log('signinobsran'))
        catchError(this.handleError)
      );
  }

  signIn(email: string, password: string): Observable<UserCredential> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential) => {
        // Signed in
        // const user = userCredential.user;
        // ...
        return userCredential;
      });
    //.catch((error: FirebaseError) => {
    //  //const errorCode = error.code;
    //  //const errorMessage = error.message;
    //  this.loggerService.logError(error, 'Error in promise - singing in:');
    //  //return error;
    //});
    return from(promise)
      .pipe(
        //tap(x => console.log('signinobsran'))
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }
}
