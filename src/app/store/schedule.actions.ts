import { createAction, props } from "@ngrx/store";
import { Appointment } from "../types";


export const setNewAppointmentTargetDate = createAction(
  '[AddAppointmentComponent] setNewAppointmentTargetDate',
  props<{ dateStr: string, dateObj: Date }>(),
);

export const getNewAppointmentDayAppointments = createAction(
  '[AddAppointmentComponent] getNewAppointmentDayAppointments',
);

export const getNewAppointmentDayAppointmentsSuccess = createAction(
  '[AddAppointmentComponent] getNewAppointmentDayAppointmentsSuccess',
  props<{ appointments: Appointment[] }>(),
);

export const createNewAppointment = createAction(
  '[AddApointmentComponent] createNewAppointment',
  props<{ appointment: Appointment, targetDateStr: string }>(),
);

export const getNewScheduleRealTimeSubscription = createAction(
  '[Shedule View] newScheduleRealTimeSubscription',
);

export const newScheduleSnapshot = createAction(
  '[Database Service] newScheduleSnapshot',
  props<{ appointments: Appointment[] }>(),
);

export const newAppointmentScheduleSnapshot = createAction(
  '[Database Service] newAppointmentScheduleSnapshot',
  props<{ appointments: Appointment[] }>(),
);


export const updateUpstreamScheduleVersion = createAction(
  '[ClinicComponent] UpdateUpstreamScheduleVersion',
  props<{ appointments: Appointment[], targetDateStr: string }>(),
);

export const togglePatientOnSite = createAction(
  '[Schedule Entry] toggleOnSite',
  props<{ patientID: string, schedulePath: string, newState: boolean }>(),
);
