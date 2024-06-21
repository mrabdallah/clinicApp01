import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Clinic } from '../types';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { Subscription, map } from 'rxjs';
import { AppState } from '../store/app.reducer';
import { fetchMyClinicsStart } from '../store/my-clinics.actions';
import { selectMyClinics, selectUser } from '../store/app.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'my-clinics',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './my-clinics.component.html',
  styleUrl: './my-clinics.component.css'
})
export class MyClinicsComponent implements OnInit, OnDestroy {
  myClinics$ = this.store.select(selectMyClinics);
  myClinics = toSignal(this.myClinics$);
  private _currentUserSubscription?: Subscription;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this._currentUserSubscription = this.store.select(selectUser)
      .subscribe(
        (user) => {
          this.store.dispatch(fetchMyClinicsStart());
        });
  }

  ngOnDestroy(): void {
    this._currentUserSubscription?.unsubscribe();
  }
}
