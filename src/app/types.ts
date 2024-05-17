
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  primaryContact?: string;
  emergencyContact?: string;
  gender?: 'female' | 'male';
  address?: string;
  work?: string;
  maritalStatus?: string
  allergies?: string;
  dateOfBirth?: Date;
  email?: string;
  familyMedicalHistory?: string;
  optInForDataSharing?: boolean;
  pastMedicalHistory?: string;
  preferredAppointmentDaysAndTimes?: string;
  socialHistory?: string;
}



export interface Appointment {
  // firestorePath?: string;
  // id?: string;
  dateTime: Date; // Use Date instead of any
  state: 'waiting' | 'examining' | 'done';
  isUrgent: boolean;
  patientInClinic: boolean;
  reasonForVisit: string;
  paid: boolean;
  latenessCtr: number;
  patient: Patient;
}

export interface DaySchedule {
  firestorePath: string;
  id: string;
  appointments: Appointment[];
}