import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  log(obj: any, obj2?: any) {
    if (!environment.production) {
      if (obj2 !== undefined) {
        console.log(obj, obj2);
      } else {
        console.log(obj);
      }
    }
  }

  logError(error: any, customMessege?: string) {
    if (!environment.production) {
      if (customMessege) { console.error(customMessege); }
      console.error(error);
    }
  }
  logWarning(messege: string) {
    if (!environment.production) {
      console.warn(messege);
    }
  }
}
