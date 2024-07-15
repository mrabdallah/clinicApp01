import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';


import { concatLatestFrom } from '@ngrx/operators';

import { EMPTY, catchError, concatMap, exhaustMap, map, mergeMap, of, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.reducer';
import * as AppSelectors from './store/app.selectors';
import { DatabaseService } from './database.service';
import { AppUser } from './auth/user.model';
import { Clinic } from './types';

import * as ClinicActions from './store/clinic.actions';
import * as ScheduleActions from "./store/schedule.actions";

@Injectable()
export class AppEffects {
  fetchMyClinics = createEffect(() => this.actions$.pipe(
    ofType(ClinicActions.fetchMyClinicsStart),  // you can listen for multiple actions 'action1, action2,'
    concatLatestFrom(_action => this.store.select(AppSelectors.user).pipe(take(1))),
    switchMap(([_action, user]) => {
      return this.databaseService.getMyOwnedClinics(user?.id)
        .pipe(
          map(clinics => ClinicActions.fetchMyClinicsSuccess({ clinics })));
    }),
  ));//, { dispatch: false });

  fetchAllClinics = createEffect(() => this.actions$.pipe(
    ofType(ClinicActions.fetchAllClinicsStart),  // you can listen for multiple actions 'action1, action2,'
    exhaustMap(() => this.databaseService.fetchAllCLinics()
      .pipe(
        map(clinics => ClinicActions.fetchAllClinicsSuccess({ clinics: clinics })),
        catchError(() => EMPTY)
      ))
  ));

  fetchClinicByIdStart = createEffect(() => this.actions$.pipe(
    ofType(ClinicActions.fetchCurrentClinicByIdStart),
    switchMap(action => {
      return this.databaseService.fetchClinicByID(action.clinicID)
        .pipe(map(clinic => ClinicActions.fetchCurrentClinicByIdSuccess({ clinic: clinic })));
    })
  ));

  createNewAppointment = createEffect(() => this.actions$.pipe(
    ofType(ScheduleActions.createNewAppointment),
    concatLatestFrom(_action => this.store.select(AppSelectors.selectedClinic)),
    tap(([action, selectedClinic]) => {
      const path: string = selectedClinic?.firestorePath ?? '';
      this.databaseService.createNewAppointment(path, action.appointment, action.targetDateStr);
    }),
  ), { dispatch: false });

  deleteClinic = createEffect(() => this.actions$.pipe(
    ofType(ClinicActions.deleteClinic),
    switchMap((action) => {
      return this.databaseService.deleteClinic(action.clinicPath)
        .pipe(map(() => ClinicActions.fetchMyClinicsStart()));
    }),
  ));

  getNewScheduleRealTimeSubscription = createEffect(() => this.actions$.pipe(
    ofType(ScheduleActions.getNewScheduleRealTimeSubscription),
    concatLatestFrom(_action => this.store.select(AppSelectors.selectedClinic)),
    tap(([_action, selectedClinic]) => {
      const path: string = selectedClinic?.firestorePath ?? '';
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // set time to 12 AM
      const dateStr: string = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
      this.databaseService.unsubscribeFromScheduleRealTimeDoc();
      this.databaseService.subscribeToScheduleRealTimeDoc(path, dateStr);
    }),
  ), { dispatch: false });

  getNewAppointmentDayAppointments = createEffect(() => this.actions$.pipe(
    ofType(ScheduleActions.getNewAppointmentDayAppointments),
    concatLatestFrom(_action => [
      this.store.select(AppSelectors.selectedClinic).pipe(take(1)),
      this.store.select(AppSelectors.newAppointment).pipe(take(1)),
    ]),
    tap(([_action, selectedClinic, newAppointment]) => {
      const path: string = selectedClinic?.firestorePath ?? '';
      const dateString: string = newAppointment?.targetDayDateStr ?? '';
      this.databaseService.unsubscribeFromAppintmentScheduleRealTimeDoc();
      this.databaseService.subscribeToAppointmentScheduleRealTimeDoc(path, dateString);
    }),
  ), { dispatch: false });

  updateUpstreamScheduleVersion = createEffect(() => this.actions$.pipe(
    ofType(ScheduleActions.updateUpstreamScheduleVersion),
    concatLatestFrom(_action => this.store.select(AppSelectors.selectedClinic)),
    tap(([action, clinic]) => {
      console.log(`${clinic?.firestorePath}/schedule/${action.targetDateStr}`);
      this.databaseService.updateUpstreamScheduleVersion(
        action.appointments,
        `${clinic?.firestorePath}/schedule/${action.targetDateStr}`
      );
    }),
  ), { dispatch: false });

  fetchClinicToEdit = createEffect(() => this.actions$.pipe(
    ofType(ClinicActions.fetchClinicToEditRTDoc),
    tap((action) => {
      const clinicID: string = action.clinicID ?? '';
      if (clinicID.length > 0) {
        this.databaseService.unsubscribeFromClinicToEditRTDoc();
        this.databaseService.subscribeToClinicToEditRTDoc(clinicID);
      }

    }),
  ), { dispatch: false });

  unsubscribeFromClinicToEdit = createEffect(() => this.actions$.pipe(
    ofType(ClinicActions.unsubscribeFromClinicToEdit),
    map(_action => {
      this.databaseService.unsubscribeFromClinicToEditRTDoc();
      return ClinicActions.clearClinicToEdit();
    })
  ));
  /*
   *
   *
   *  return this.databaseService.getMyOwnedClinics(user?.id)
        .pipe(
          map(clinics => ClinicActions.fetchMyClinicsSuccess({ clinics })));

   *
   *   getNewScheduleRealTimeSubscription = createEffect(() => this.actions$.pipe(
    ofType(ScheduleActions.getNewScheduleRealTimeSubscription),
    concatLatestFrom(_action => this.store.select(AppSelectors.selectedClinic)),
    tap(([_action, selectedClinic]) => {
      const path: string = selectedClinic?.firestorePath ?? '';
      const today = new Date();
      today.setHours(0, 0, 0, 0);  // set time to 12 AM
      const dateStr: string = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
      this.databaseService.unsubscribeFromScheduleRealTimeDoc();
      this.databaseService.subscribeToScheduleRealTimeDoc(path, dateStr);
    }),
  ), { dispatch: false });

   * */


  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private databaseService: DatabaseService
  ) { }
}
