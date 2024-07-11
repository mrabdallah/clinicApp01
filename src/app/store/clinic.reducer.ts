import { createReducer, on } from "@ngrx/store";
import { Clinic } from "../types";
import * as ClinicActions from "./clinic.actions";
import { cloneDeep } from "lodash-es";

export interface ClinicState {
  allClinics: Clinic[];
  selectedClinic: Clinic | null;
  myClinics: Clinic[];
}

export const initialClinicState: ClinicState = {
  allClinics: [],
  selectedClinic: null,
  myClinics: []
};

export const clinicReducer = createReducer(
  initialClinicState,
  on(ClinicActions.selectClinic, (state, { clinic }) => {
    const newState = cloneDeep(state);
    newState.selectedClinic = cloneDeep(clinic);
    return newState;
  }),
  on(ClinicActions.fetchMyClinicsSuccess, (state, { clinics }) => {
    const newState = cloneDeep(state);
    newState.myClinics = cloneDeep(clinics);
    return newState;
  }),
  on(ClinicActions.fetchAllClinicsSuccess, (state, { clinics }) => {
    const newState = cloneDeep(state);
    newState.allClinics = cloneDeep(clinics);
    return newState;

  }),
  on(ClinicActions.fetchCurrentClinicByIdSuccess, (state, { clinic }) => {
    const newState = cloneDeep(state);
    newState.selectedClinic = cloneDeep(clinic);
    return newState;
  }),
  //on(ScoreboardPageActions.awayScore, state => ({ ...state, away: state.away + 1 })),
  //on(ScoreboardPageActions.resetScore, state => ({ home: 0, away: 0 })),
  //on(ScoreboardPageActions.setScores, (state, { game }) => ({ home: game.home, away: game.away }))
);
