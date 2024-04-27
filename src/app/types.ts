export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Appointment {
  firestorePath?: string;
  id: string;
  dateTime: Date; // Use Date instead of any
  patient: Patient; // Reference Patient interface
  state: 'waiting' | 'examining' | 'done';
  isUrgent: false;
  patientInClinic: false;
  paid: false;
}


