import { createSelector } from "@ngrx/store";
import { AppState } from "./app.reducer";

export const selectUser = (state: AppState) => state.auth.user;

/*
export const selectFeatureCount = createSelector(
  selectFeature,
  (state: FeatureState) => state.counter
);
 * */

