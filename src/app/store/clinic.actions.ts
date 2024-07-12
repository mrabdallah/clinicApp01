import { createAction, props } from "@ngrx/store";
import { Clinic } from "../types";

export const fetchMyClinicsStart = createAction(
  '[MyClinics page] fetchMyClinicsStart',
);

export const fetchMyClinicsSuccess = createAction(
  '[MyClinics page] fetchMyClinicsSuccess',
  props<{ clinics: Clinic[] }>()
);

export const fetchAllClinicsStart = createAction(
  '[Home Page] fetchAllClinicsStart',
);

export const fetchAllClinicsSuccess = createAction(
  '[Effects] fetchAllClinicsSuccess',
  props<{ clinics: Clinic[] }>(),
);


export const selectClinic = createAction(
  '[MyClinics page] selectClinic',
  props<{ clinic: Clinic }>(),
);

export const createClinic = createAction(
  '[MyClinics Page] createClinic',
  props<{ clinic: Clinic }>()
);

export const fetchCurrentClinicByIdStart = createAction(
  '[Clinic Component] fetchClinicByIdStart',
  props<{ clinicID: string }>(),
);

export const fetchCurrentClinicByIdSuccess = createAction(
  '[ClinicComponent -> AppEffects -> DatabaseSvc] fetchClinicByIdSuccess',
  props<{ clinic: Clinic }>(),
);

export const deleteClinic = createAction(
  '[MyClinics Page] deleteClinic',
  props<{ clinicPath: string }>(),
);

export const fetchClinicToEditStart = createAction(
  '[EditClinic Component] fetchClinicToEditStart',
  props<{ clinicID: string }>()
);

export const fetchClinicToEditSuccess = createAction(
  '[Effects] fetchClinicToEditSuccess',
  props<{ clinic: Clinic }>()
);
