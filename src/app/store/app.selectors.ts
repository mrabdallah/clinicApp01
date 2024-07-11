import { createSelector } from "@ngrx/store";
import { AppState } from "./app.reducer";

export const user = (state: AppState) => state.auth.user;

export const myClinics = (state: AppState) => state.clinic.myClinics;

export const allClinics = (state: AppState) => state.clinic.allClinics;

export const selectedClinic = (state: AppState) => state.clinic.selectedClinic;

export const todayAppointments = (state: AppState) => state.schedule.appointments;

export const newAppointment = (state: AppState) => state.schedule.newAppointment;

export const newAppointmentDaySchedule = (state: AppState) => state.schedule.newAppointment?.targetDayAppointments;


/*
export const selectFeatureCount = createSelector(
  selectFeature,
  (state: FeatureState) => state.counter
);
 * */

