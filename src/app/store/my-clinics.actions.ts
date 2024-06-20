import { createAction, props } from "@ngrx/store";
import { Clinic } from "../types";

export const fetchMyClinicsStart = createAction(
  '[MyClinics page] fetchMyClinicsStart',
);

export const fetchMyClinicsSuccess = createAction(
  '[MyClinics page] fetchMyClinicsSuccess',
  props<{ clinics: Clinic[] }>()
);

export const selectClinic = createAction(
  '[MyClinics page] selectClinic',
  props<{ clinic: Clinic }>(),
);

export const createClinic = createAction(
  '[MyClinics Page] createClinic',
  props<{ clinic: Clinic }>()
);
