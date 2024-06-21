import { createSelector } from "@ngrx/store";
import { AppState } from "./app.reducer";

export const selectUser = (state: AppState) => state.auth.user;

export const selectMyClinics = (state: AppState) => state.myClinics.myClinics;
/*
export const selectFeatureCount = createSelector(
  selectFeature,
  (state: FeatureState) => state.counter
);
 * */

