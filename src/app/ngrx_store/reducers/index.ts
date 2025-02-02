import { ActionReducer, ActionReducerMap } from '@ngrx/store';
import * as PatientsActions from '../actions/schedule.actions';


export interface State {
  newPatientFormDialogOpened?: any;
}
export const initialState: State = {
  newPatientFormDialogOpened: false,
};

export const appReducers: ActionReducerMap<State> = {};

export const metaReducers = [];
