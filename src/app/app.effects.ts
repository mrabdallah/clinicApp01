import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createClinic, fetchMyClinicsStart, fetchMyClinicsSuccess } from './store/my-clinics.actions';
import { EMPTY, catchError, exhaustMap, map, mergeMap, of, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.reducer';
import { selectUser } from './store/app.selectors';
import { DatabaseService } from './database.service';
import { AppUser } from './auth/user.model';
import { Clinic } from './types';
import { concatLatestFrom } from '@ngrx/operators';

@Injectable()
export class AppEffects {
  fetchMyClinics = createEffect(() => this.actions$.pipe(
    ofType(fetchMyClinicsStart),  // you can listen for multiple actions 'action1, action2,'
    tap(() => { console.log('ineffect'); }),
    concatLatestFrom(action => this.store.select(selectUser).pipe(take(1))),
    switchMap(([_, user]) => {
      return this.databaseService.getMyOwnedClinics(user?.id ?? '').pipe(
        map(clinics => fetchMyClinicsSuccess({ clinics }))
      );
    }),
  ));//, { dispatch: false });

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private databaseService: DatabaseService
  ) { }
}
