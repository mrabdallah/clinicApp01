import { ActionReducerMap } from "@ngrx/store";
import { AuthState, authReducer } from "../auth/store/auth.reducer";
import { MyClinicsState, myClinicsReducer } from "./my-clinics.reducer";


export interface AppState {
  auth: AuthState;
  myClinic: MyClinicsState;
}


export const appReducer: ActionReducerMap<AppState> = {
  auth: authReducer,
  myClinic: myClinicsReducer,
};
