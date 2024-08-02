import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  user,
  UserCredential
} from "@angular/fire/auth";
import { Observable, catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { AppUser, UserRole } from './auth/user.model';
import { LoggerService } from './logger.service';
import { FirebaseError } from '@angular/fire/app';
import { Firestore, collection, doc, onSnapshot, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggerService = inject(LoggerService);
  firebaseAuth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  //#user$ = user(this.firebaseAuth);
  user$: Observable<AppUser | null> = user(this.firebaseAuth)
    .pipe(
      switchMap((user) => {
        if (user) {
          this.loggerService.log(`inside authservice -> user logged in; ${user.email}`);
          return this.getUserCustomData(user.uid).pipe(
            map(
              (customData) => {
                return new AppUser(
                  user.uid,
                  customData?.emails,
                  '',
                  customData?.displayName,
                  customData?.roles
                );
              })
          );
        } else {
          return of(null);
        }
      }),
      //map(user => {
      //  if (user) {
      //    return new AppUser(user.email!, user.uid!);
      //  } else {
      //    this.loggerService.log(`no user, or user logged out.`);
      //    return null;
      //  }
      //})
    );
  //userSignal = signal<AppUser | undefined | null>(undefined);

  //constructor() { }
  //
  //get user$() { return this.#user$; }

  getUserCustomData(userID: string): Observable<{ emails: string[], displayName: string, roles: UserRole[] } | null> {
    return new Observable(observer => {
      return onSnapshot(doc(this.firestore, `/users/${userID}`), (docSnapshot) => {
        console.log(`getUserCustomData -> new call`);
        if (docSnapshot.exists()) {
          observer.next({
            emails: docSnapshot.data()['emails'],
            displayName: docSnapshot.data()['displayName'],
            roles: docSnapshot.data()['roles'],
          });
        } else {
          observer.next(null);
        }
      });
    });
  }

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
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential) => {
        this.loggerService.log(userCredential.user);
        return userCredential
      });
    return from(promise)
      .pipe(
        catchError(this.handleError)
      );
  }

  setUserCustomData(userId: string, customData: Partial<AppUser>) {
    const userRef = doc(collection(this.firestore, 'users'), userId);
    return setDoc(userRef, customData, { merge: true });
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
