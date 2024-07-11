import { ActionReducerMap } from "@ngrx/store";
import { AuthState, authReducer } from "../auth/store/auth.reducer";
import { ClinicState, clinicReducer } from "./clinic.reducer";
import { ScheduleState, scheduleReducer } from "./schedule.reducer";


export interface AppState {
  auth: AuthState;
  clinic: ClinicState;
  schedule: ScheduleState;
}


export const appReducer: ActionReducerMap<AppState> = {
  auth: authReducer,
  clinic: clinicReducer,
  schedule: scheduleReducer
};
