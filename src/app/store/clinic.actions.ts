import { createAction, props } from "@ngrx/store";
import { Clinic } from "../types";

export const fetchMyClinicsStart = createAction(
  '[MyClinics page] fetchMyClinicsStart',
);

export const fetchMyClinicsSuccess = createAction(
  '[MyClinics page] fetchMyClinicsSuccess',
  props<{ clinics: Clinic[] }>()
);

export const fetchDoctorClinicsStart = createAction(
  '[MyClinics page] fetchDoctorClinicsStart',
);

export const fetchDoctorClinicsSuccess = createAction(
  '[MyClinics page] fetchDoctorClinicsSuccess',
  props<{ clinics: Clinic[] }>()
);

export const fetchAssistantClinicsStart = createAction(
  '[MyClinics page] fetchAssistantClinicsStart',
);

export const fetchAssistantClinicsSuccess = createAction(
  '[MyClinics page] fetchAssistantClinicsSuccess',
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

export const fetchClinicToEditRTDoc = createAction(
  '[EditClinic Component] fetchClinicToEditRTDoc',
  props<{ clinicID: string }>()
);

export const newClinicToEditSnapshot = createAction(
  '[Database Service] newClinicToEditSnapshot',
  props<{ clinic: Clinic }>()
);

export const unsubscribeFromClinicToEdit = createAction(
  '[EditClinic Component] unsubscribeFromClinicToEdit'
);

export const clearClinicToEdit = createAction(
  '[Effects] clearClinicToEdit'
);

export const startEditingClinicScheduleTemplate = createAction(
  '[EditClinic Component] startEditingClinicScheduleTemaple'
);

export const doneEditingClinicScheduleTemplate = createAction(
  '[EditSchedule Component] doneEditingClinicScheduleTemaple'
);

/*export const fetchClinicToEditSuccess = createAction(
  '[Effects] fetchClinicToEditSuccess',
  props<{ clinic: Clinic }>()
);*/
