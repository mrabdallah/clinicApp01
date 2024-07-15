import { Component, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';

import { Clinic } from '../types';
import { AppState } from '../store/app.reducer';
import * as AppSelectors from '../store/app.selectors';
import * as ClinicActions from '../store/clinic.actions';
import * as ScheduleActions from "../store/schedule.actions";
import { CommonModule } from '@angular/common';
import { ClinicCardComponent } from '../clinic-card/clinic-card.component';


@Component({
  selector: 'app-clinics',
  standalone: true,
  imports: [CommonModule, ClinicCardComponent],
  templateUrl: './clinics.component.html',
  styleUrl: './clinics.component.css'
})
export class ClinicsComponent implements OnInit {
  public clinics: Clinic[] = [];
  public clinics$ = this.store.select(AppSelectors.allClinics);

  constructor(
    private store: Store<AppState>,
  ) { }

  ngOnInit() {
    this.store.dispatch(ClinicActions.fetchAllClinicsStart());
  }

}
