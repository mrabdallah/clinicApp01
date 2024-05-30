import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { Observable, Subscription, combineLatest, map } from 'rxjs';
import { Weekday } from './types';

@Injectable({
  providedIn: 'root'
})
export class TimeManagingAndPickingService {
  private databaseService = inject(DatabaseService);
  private comibinedObservablesSubs?: Subscription;
  constructor() { }

  getTimeNowIn12h(): string {
    const now = new Date();
    const hours = now.getHours();
    const adjustedHours = hours % 12 || 12; // Convert to 12-hour format (12 for midnight/noon)
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    return `${adjustedHours}:${minutes} ${ampm}`;
  }

  /////////////////
  getTimeNowIn24H(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  ////////////////
  getEpochFrom2400(time: string): number {
    let now = new Date();
    now.setHours(parseInt(time.slice(0, 2)));
    now.setMinutes(parseInt(time.slice(2)));
    return now.getTime();
  }

  //////////////////
  prefixZeroToNumber(number: number): string {
    return number < 10 ? `0${number}` : number.toString();
  }

  ////////////////////
  calcCapacityForInterval(intervalStart: string, intervalEnd: string, average: number) {
    return Math.floor((this.getEpochFrom2400(intervalEnd) - this.getEpochFrom2400(intervalStart)) / average);
  }

  /////////////////////
  isTimeEndedForBooking(intervals: string[], currTime: number): boolean {
    if (currTime > this.getEpochFrom2400(intervals[intervals.length - 1])) {  // TODO: Add some more time depending on the settings
      return true;
    } else {
      return false;
    }
  }

  //////////////
  isIntervalFull(intervalStart: string, intervalEnd: string, requestedNumberOfAppointments: number, mainAverage: number): boolean {
    let bookedTime = mainAverage * requestedNumberOfAppointments;  // TODO: Add a constant for wasted time
    if ((this.getEpochFrom2400(intervalStart) + bookedTime) < this.getEpochFrom2400(intervalEnd)) {  // TODO: Add some number for approximation
      return true;
    } else { return false; }
  }

  //unsubscribe() {
  //  this.comibinedObservablesSubs?.unsubscribe();
  //}


  //pickAppointmentTime() {
  /*suggestAppointmentTime(now: Date): string {
    let finalSuggestedTime: string = '';  // in 2400 format
    this.comibinedObservablesSubs = combineLatest([this.databaseService.todaySchedule$, this.databaseService.clinicDocOneTimeSnapshot$])
      .subscribe(([schedVal, clinicVal]) => {
        //const now = new Date();
        const timeNow24: number = parseInt(`${now.getHours()}${this.prefixZeroToNumber(now.getMinutes())}`)
        const todayNameInTheWeek: number = now.getDay();
        const dayNamesArr: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        let mainAverage: number;
        let numberOfCurrentAppointments: number | undefined;
        let todayScheduleTemplate: string[] = [];
        numberOfCurrentAppointments ??= schedVal?.length;

        //for (let i = 0; i < todayScheduleTemplate.length; i++ ) {
        //  todayScheduleTemplate[i]
        //}
        if (clinicVal === undefined) {
          return '';
        }
        todayScheduleTemplate.push(...clinicVal!.weekScheduleTemplate[dayNamesArr[todayNameInTheWeek] as Weekday]);
        mainAverage = clinicVal.mainAverageAppointmentTimeTake;
        if (this.isTimeEndedForBooking(todayScheduleTemplate, timeNow24)) {
          // TODO: Suggest next available day
        } else {
          // check free spot in intervals, then break/exit
          let unprocessedNumberOfAppointments = numberOfCurrentAppointments;
          let expected!: number;   // in epoch
          for (let i = 0; i < todayScheduleTemplate.length; i += 2) {
            let c = this.calcCapacityForInterval(todayScheduleTemplate[i], todayScheduleTemplate[i + 1], mainAverage);
            if (unprocessedNumberOfAppointments <= c) {
              // TODO: Replace the 30 minutes with a value from the settings.
              expected = unprocessedNumberOfAppointments * mainAverage + this.getEpochFrom2400(todayScheduleTemplate[i]);
              expected = expected - 30 * 60 * 1000;  // subtract a 30 minutes; in order to make patient come early
              // check if it's too early. patien should be comming only when the clinic is open
              expected = expected < this.getEpochFrom2400(todayScheduleTemplate[i]) ? this.getEpochFrom2400(todayScheduleTemplate[i]) : expected;
              break;
            } else {
              unprocessedNumberOfAppointments -= c;
            }
            // TODO: Suggest the next available day. appointments may need to move??
          }
          finalSuggestedTime = (() => {
            let n = new Date(0);
            if (expected) {//&& expected !== undefined && expected !== null) {
              n.setTime(expected);
              return `${this.prefixZeroToNumber(n.getHours())}:${this.prefixZeroToNumber(n.getMinutes())}`
            } else { return '' };
          })();
        }
        return finalSuggestedTime;
      });
  }*/
  suggestedAppointmentTime(now: Date): Observable<string> {
    return combineLatest([
      this.databaseService.todaySchedule$,
      this.databaseService.clinicDocOneTimeSnapshot$,
    ]).pipe(
      map(([schedVal, clinicVal]) => {
        if (clinicVal === undefined) {
          return '';
        }

        const timeNow24 = parseInt(`${now.getHours()}${this.prefixZeroToNumber(now.getMinutes())}`);
        const todayNameInTheWeek = now.getDay();
        const dayNamesArr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        const todayScheduleTemplate = clinicVal.weekScheduleTemplate[dayNamesArr[todayNameInTheWeek] as Weekday];
        const mainAverage = clinicVal.mainAverageAppointmentTimeTake;

        if (this.isTimeEndedForBooking(todayScheduleTemplate, timeNow24)) {
          // TODO: Suggest next available day (can be implemented here or returned as empty string)
          return '';
        } else {
          const numberOfCurrentAppointments = schedVal?.length;
          let unprocessedNumberOfAppointments = numberOfCurrentAppointments;
          let expected: number | undefined;

          for (let i = 0; i < todayScheduleTemplate.length; i += 2) {
            const capacityForInterval = this.calcCapacityForInterval(todayScheduleTemplate[i], todayScheduleTemplate[i + 1], mainAverage);
            if (unprocessedNumberOfAppointments <= capacityForInterval) {
              expected = unprocessedNumberOfAppointments * mainAverage + this.getEpochFrom2400(todayScheduleTemplate[i]);
              expected -= 30 * 60 * 1000; // Subtract 30 minutes for early arrival
              expected = Math.max(expected, this.getEpochFrom2400(todayScheduleTemplate[i])); // Ensure time is within clinic hours
              break;
            } else {
              unprocessedNumberOfAppointments -= capacityForInterval;
            }
          }

          return expected ? `${this.prefixZeroToNumber(new Date(expected).getHours())}:${this.prefixZeroToNumber(new Date(expected).getMinutes())}` : '';
        }
      }),
    );
  }
}
