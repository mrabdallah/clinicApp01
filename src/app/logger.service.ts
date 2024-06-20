import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  log(obj: any) {
    if (!environment.production) {
      console.log(obj);
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
