import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { Observable, Subscription, combineLatest, delay, map, of, take, takeUntil } from 'rxjs';
import { Appointment, Weekday } from './types';
import { Store } from '@ngrx/store';

import { AppState } from './store/app.reducer';
import * as AppSelectors from "./store/app.selectors";
import { LoggerService } from './logger.service';
import { concatLatestFrom } from '@ngrx/operators';
import { cloneDeep } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class TimeManagingAndPickingService {
  private databaseService = inject(DatabaseService);
  private comibinedObservablesSubs?: Subscription;
  private _loggerService = inject(LoggerService);

  constructor(private store: Store<AppState>) { }

  epochIntoTimeInputFieldFormat(time: Date): string {
    return `${time.getHours()}:${time.getMinutes()}`;
  }

  //getTimeNowIn12h(): string {  // 09:00 AM
  //  const now = new Date();
  //  const hours = now.getHours();
  //  const adjustedHours = (hours % 12 || 12).toString().padStart(2, '0'); // Convert to 12-hour format (12 for midnight/noon)
  //  const minutes = now.getMinutes().toString().padStart(2, '0');
  //  const ampm = hours >= 12 ? 'PM' : 'AM';

  //  return `${adjustedHours}:${minutes} ${ampm}`;
  //}

  /////////////////
  getTimeNowIn24H(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /* '18:35'  ->  Epoch */
  getEpochFrom2400(time: string): number {
    let now = new Date();
    now.setHours(parseInt(time.slice(0, 2)));
    now.setMinutes(parseInt(time.slice(3)));
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

  //getDateObjFromTargetDayDateStr(daydateStr: string): Date {
  //  let date = new Date();
  //  const dayInMonth: number = parseInt(daydateStr.split('_')[0]);
  //  const month: number = parseInt(daydateStr.split('_')[1]) - 1;
  //  const year: number = parseInt(daydateStr.split('_')[2]);
  //  date.setDate(dayInMonth);
  //  date.setMonth(month);
  //  date.setFullYear(year);
  //  return date;
  //}

  strToHours(str: string) {  // 15:00   returns 15
    return parseInt(str.split(':')[0]);
  }

  strToMinutes(str: string) {   // 15:20  returns 20
    return parseInt(str.split(':')[1]);
  }

  getAvailableAppointmentTimes(): Observable<Date[]> {
    return combineLatest([
      this.store.select(AppSelectors.newAppointment),
      this.store.select(AppSelectors.selectedClinic),
    ]).pipe(
      map(([newAppointment, selectedClinic]) => {
        if (
          selectedClinic === null ||
          selectedClinic === undefined ||
          selectedClinic.weekScheduleTemplate === undefined ||
          newAppointment === null ||
          newAppointment.targetDayDateStr === undefined ||
          newAppointment.targetDate === undefined
        ) {
          return [];
        }

        const dayNamesArr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const now = new Date();
        const nowDate12Am = new Date()
        nowDate12Am.setHours(0, 0, 0, 0);
        //const targetDateObj: Date = this.getDateObjFromTargetDayDateStr(newAppointment.targetDayDateStr);
        const targetWeekDay: Weekday = dayNamesArr[newAppointment.targetDate.getDay()] as Weekday;
        const targetDayIntervals: string[] = selectedClinic.weekScheduleTemplate[targetWeekDay] ?? [];
        const clinicAverageTime = selectedClinic.mainAverageAppointmentTimeTake ?? 1200000;  // default to 20 minutes
        // no schedule for the target day || the target date is passed
        if (targetDayIntervals.length < 2 || nowDate12Am.getTime() > newAppointment.targetDate.getTime()) {
          return [];  // TODO: maybe return error
        }

        if (  // target date is today and all intervals ended
          nowDate12Am.getTime() === newAppointment.targetDate.getTime() &&
          now.getHours() >
          this.strToHours(targetDayIntervals[targetDayIntervals.length - 1])
          && now.getMinutes() > this.strToMinutes(targetDayIntervals[targetDayIntervals.length - 1])
        ) {
          return [];
        } else {  // if target date is today or an upcomming day.
          let cursorTime: Date = cloneDeep(newAppointment.targetDate);
          let suggestions: Date[] = [];


          for (let i = 0; i < targetDayIntervals.length; i += 2) {
            //let sectionBooked = true;
            cursorTime.setHours(this.strToHours(targetDayIntervals[i]));
            cursorTime.setMinutes(this.strToMinutes(targetDayIntervals[i]));

            const currentIntervalEnd: Date = cloneDeep(newAppointment.targetDate);
            currentIntervalEnd.setHours(this.strToHours(targetDayIntervals[i + 1]));
            currentIntervalEnd.setMinutes(this.strToMinutes(targetDayIntervals[i + 1]));
            //this.getDateObjFromTargetDayDateStr(targetDayIntervals[i + 1]);

            while (cursorTime.getTime() < currentIntervalEnd.getTime()) {
              const indexOfConflictingAppointment: number = newAppointment.targetDayAppointments
                .findIndex(a => {
                  let tt = a.dateTime.getTime();
                  if (tt <= cursorTime.getTime() && (tt + clinicAverageTime) >= cursorTime.getTime()) {
                    return true;
                  }
                  return false;
                });
              if ((cursorTime.getTime() >= Date.now()) && indexOfConflictingAppointment === -1) {
                suggestions.push(cursorTime);
              }
              cursorTime = new Date(cursorTime.getTime() + clinicAverageTime + 1);
            }
          }

          /*
           *             for (let appointment of newAppointment.targetDayAppointments) {
            if (  // an appointment is booked clashing with cursorTime?
              cursorTime.getTime() <= (appointment.dateTime.getTime() + clinicAverageTime) &&
              cursorTime.getTime() >= appointment.dateTime.getTime()
            ) {
              cursorTime.setTime(cursorTime.getTime() + clinicAverageTime);
              continue;
            }
            suggestions.push(cursorTime);
            cursorTime.setTime(cursorTime.getTime() + clinicAverageTime);

            if (  // interval is booked at? break to start on the next interval
              (cursorTime.getTime() >=
                this.getDateObjFromTargetDayDateStr(targetDayIntervals[i + 1]).getTime())
              ||
              (appointment.dateTime.getTime() >=
                this.getDateObjFromTargetDayDateStr(targetDayIntervals[i + 1]).getTime())
            ) {
              break;
            }
          }

           * */
          return suggestions;
        }
      }),
      takeUntil(of(undefined).pipe(delay(1000))), // Emits immediately and completes
      //take(1),
    );
  }
}
