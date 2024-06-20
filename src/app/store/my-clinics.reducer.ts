import { createReducer, on } from "@ngrx/store";
import { Clinic } from "../types";
import * as MyClinicsActions from "./my-clinics.actions";
import { cloneDeep } from "lodash-es";

export interface MyClinicsState {
  selectedClinic: Clinic | null;
  myClinics: Clinic[];
}

export const initialMyClinicsState: MyClinicsState = {
  selectedClinic: null,
  myClinics: []
};

export const myClinicsReducer = createReducer(
  initialMyClinicsState,
  on(MyClinicsActions.selectClinic, (state, { clinic }) => {
    const newState = cloneDeep(state);
    newState.selectedClinic = cloneDeep(clinic);
    return newState;
  }),
  on(MyClinicsActions.fetchMyClinicsSuccess, (state, { clinics }) => {
    const newState = cloneDeep(state);
    newState.myClinics = cloneDeep(clinics);
    return newState;
  }),
  //on(ScoreboardPageActions.awayScore, state => ({ ...state, away: state.away + 1 })),
  //on(ScoreboardPageActions.resetScore, state => ({ home: 0, away: 0 })),
  //on(ScoreboardPageActions.setScores, (state, { game }) => ({ home: game.home, away: game.away }))
);
