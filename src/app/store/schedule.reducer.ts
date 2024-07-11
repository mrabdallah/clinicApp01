import { createReducer, on } from "@ngrx/store";
import { Appointment } from "../types";
import * as ScheduleActions from "./schedule.actions";
import { cloneDeep } from "lodash-es";

export interface ScheduleState {
  appointments: Appointment[];
  newAppointment: {
    targetDayDateStr: string;   // 30_4_2009
    targetDate: Date;
    targetDayAppointments: Appointment[];
  } | null;
}

export const initialScheduleState: ScheduleState = {
  appointments: [],
  newAppointment: null,
};

export const scheduleReducer = createReducer(
  initialScheduleState,
  //on(ScheduleActions.createNewAppointment, () => {}),
  on(ScheduleActions.newScheduleSnapshot, (state, { appointments }) => {
    const newState = cloneDeep(state);
    newState.appointments = cloneDeep(appointments);
    return newState;
  }),
  on(ScheduleActions.setNewAppointmentTargetDate, (state, { dateStr, dateObj }) => {
    const newState = cloneDeep(state);
    newState.newAppointment = {
      targetDayDateStr: dateStr,
      targetDate: dateObj,
      targetDayAppointments: newState.newAppointment?.targetDayAppointments ?? [],
    }
    return newState;
  }),
  on(ScheduleActions.newAppointmentScheduleSnapshot, (state, { appointments }) => {
    const newState = cloneDeep(state);
    if (newState.newAppointment) {
      newState.newAppointment.targetDayAppointments = cloneDeep(appointments);
    }
    return newState;
  }),
  //on(ScheduleActions.getNewAppointmentDayAppointmentsSuccess, (state, { appointments }) => {
  //  const newState = cloneDeep(state);
  //  if (newState.newAppointment) {
  //    newState.newAppointment.targetDayAppointments = cloneDeep(appointments);
  //  }
  //  return newState;
  //}),
);
