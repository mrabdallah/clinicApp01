import { createAction, props } from "@ngrx/store";
import { Appointment } from "../types";


export const setNewAppointmentTargetDate = createAction(
  '[AddAppointmentComponent] setNewAppointmentTargetDate',
  props<{ dateStr: string, dateObj: Date }>(),
);

export const getNewAppointmentDayAppointments = createAction(
  '[AddAppointmentComponent] getNewAppointmentDayAppointments',
);

//export const getNewAppointmentDayAppointmentsSuccess = createAction(
//  '[AddAppointmentComponent] getNewAppointmentDayAppointmentsSuccess',
//  props<{ appointments: Appointment[] }>(),
//);

export const createNewAppointment = createAction(
  '[AddApointmentComponent] createNewAppointment',
  props<{ appointment: Appointment, targetDateStr: string }>(),
);

export const getNewScheduleRealTimeSubscription = createAction(
  '[Shedule View] newScheduleRealTimeSubscription',
  props<{ dateStr: string }>(),
);

export const newScheduleSnapshot = createAction(
  '[Database Service] newScheduleSnapshot',
  props<{ appointments: Appointment[] }>(),
);

export const newAppointmentScheduleSnapshot = createAction(
  '[Database Service] newAppointmentScheduleSnapshot',
  props<{ appointments: Appointment[] }>(),
);

export const toggleEditingAppointments = createAction(
  '[Clinic Component] ToggleEditingAppointments',
  //  props<{ newState: boolean }>()
);

export const updateUpstreamScheduleVersion = createAction(
  '[ClinicComponent] UpdateUpstreamScheduleVersion',
  props<{
    appointments: Appointment[],
    targetDateStr: string,
    previousIndex: number,
    currentIndex: number
  }>(),
);

export const togglePatientOnSite = createAction(
  '[Schedule Entry] toggleOnSite',
  props<{ patientID: string, schedulePath: string, newState: boolean }>(),
);

export const deleteAppointment = createAction(
  '[DeleteAppointmentConfirmationDialog] deleteAppointment',
  props<{ clinicID: string, date: Date, patientID: string }>()
);
