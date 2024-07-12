import { createReducer, on } from "@ngrx/store";
import { Clinic } from "../types";
import * as ClinicActions from "./clinic.actions";
import { cloneDeep } from "lodash-es";

export interface ClinicState {
  allClinics: Clinic[];
  selectedClinic: Clinic | null;
  myClinics: Clinic[];
  clinicToEdit: Clinic | null;
}

export const initialClinicState: ClinicState = {
  allClinics: [],
  selectedClinic: null,
  myClinics: [],
  clinicToEdit: null
};

export const clinicReducer = createReducer(
  initialClinicState,
  on(ClinicActions.selectClinic, (state, { clinic }) => {
    const newState = cloneDeep(state);
    newState.selectedClinic = cloneDeep(clinic);
    return newState;
  }),
  on(ClinicActions.fetchMyClinicsSuccess, (state, { clinics }) => {
    const newState = cloneDeep(state);
    newState.myClinics = cloneDeep(clinics);
    return newState;
  }),
  on(ClinicActions.fetchAllClinicsSuccess, (state, { clinics }) => {
    const newState = cloneDeep(state);
    newState.allClinics = cloneDeep(clinics);
    return newState;

  }),
  on(ClinicActions.fetchCurrentClinicByIdSuccess, (state, { clinic }) => {
    const newState = cloneDeep(state);
    newState.selectedClinic = cloneDeep(clinic);
    return newState;
  }),
  on(ClinicActions.fetchClinicToEditSuccess, (state, { clinic }) => {
    const newState = cloneDeep(state);
    newState.clinicToEdit = cloneDeep(clinic);
    return newState;
  }),
);
