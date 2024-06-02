import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, g } from "@angular/fire/auth";
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);

  //constructor() { }

  signUp(email: string, password: string): Observable<any> {
    //this.firebaseAuth.
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log(user);
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

  //signIn(): Observable { }
}
