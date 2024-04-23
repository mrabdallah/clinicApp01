import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemporaryDataSrvService {
  private newPatientFormDialogOpened = new BehaviorSubject<boolean>(false); // Define a BehaviorSubject

  // constructor() { }

  getData(): Observable<any> {
    return this.newPatientFormDialogOpened.asObservable(); // Expose data as an Observable
  }

  setData(newData: any) {
    this.newPatientFormDialogOpened.next(newData); // Update the BehaviorSubject with new data
  }


}
