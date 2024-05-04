
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  primaryContact: string;
  gender?: 'female' | 'male';
  address?: string;
  work?: string;
  maritalStatus?: string
  allergies?: string;
  dateOfBirth: Date;
  email?: string;
  emergencyContact?: string;
  familyMedicalHistory?: string;
  optInForDataSharing?: boolean;
  pastMedicalHistory?: string;
  preferredAppointmentDaysAndTimes?: string;
  socialHistory?: string;
}



export interface Appointment {
  firestorePath?: string;
  id?: string;
  dateTime: Date; // Use Date instead of any
  patient: Patient; // Reference Patient interface
  state: 'waiting' | 'examining' | 'done';
  isUrgent: boolean;
  patientInClinic: boolean;
  reasonForVisit: string;
  paid: boolean;
  order?: number;
}


