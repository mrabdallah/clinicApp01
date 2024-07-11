import { createSelector } from "@ngrx/store";
import { AppState } from "./app.reducer";

export const selectCurrentClinic = (state: AppState) => state.myClinic.selectedClinic;

/*
export const sometestSelector = createSelector(
  selectorFunction1,
  selectorFunction2,  // input here is the return from previous selector
  (state) => state * 4  // state is also the output from previous selector
)
*/
