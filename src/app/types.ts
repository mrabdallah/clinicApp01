// const APPOINTMENT_STATUS = {
//   WAITING: 'Waiting',
//   EXAMINING: 'Examining',
//   DONE: 'Done',
// } as const;

export type Appointment = {
  firestorePath: string;
  appointmentID: string;
  dateTime: any;
  patient: {
    firstName: string;
    lastName: string;
    patientID: string;
  };
  state: string; //'Waiting' | 'Examining' | 'Done'
};