
// Helper type to represent weekdays with 3-letter abbreviations
export type Weekday = 'SAT' | 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

export interface Clinic {
  id: string;
  firestorePath: string;
  mainAverageAppointmentTimeTake: number;
  owner: string;
  weekScheduleTemplate: { [key in Weekday]: string[] }; // Use a mapped type for weekdays
  //weekScheduleTemplate: {
  //  'SAT'?: string[];
  //  'SUN'?: string[];
  //  'MON'?: string[];
  //  'TUE'?: string[];
  //  'WED'?: string[];
  //  'THU'?: string[];
  //  'FRI'?: string[];
  //}; // Use a mapped type for weekdays
}

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
  expectedTime?: Date;
  timeTakenInSeconds?: number;
}

export interface DaySchedule {
  firestorePath: string;
  id: string;
  appointments: Appointment[];
}
