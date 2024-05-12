import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  log(obj: any){
    if (!environment.production) {
      console.log(obj);
    }
  }

  logError(message: string, error: any){
    if (!environment.production) {
      console.error(error);
    }
  }
}
