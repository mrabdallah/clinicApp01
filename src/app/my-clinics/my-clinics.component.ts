import { Component, OnInit, signal } from '@angular/core';
import { Clinic } from '../types';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { AppState } from '../store/app.reducer';
import { fetchMyClinicsStart } from '../store/my-clinics.actions';

@Component({
  selector: 'my-clinics',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './my-clinics.component.html',
  styleUrl: './my-clinics.component.css'
})
export class MyClinicsComponent implements OnInit {
  myClinics = signal<Clinic[]>([]);
  myClinics$ = this.store.select('myClinic');

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    console.log('oninit call');
    this.store.dispatch(fetchMyClinicsStart());
    console.log('oninit exit');
  }
}
