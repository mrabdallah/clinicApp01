// Helper type to represent weekdays with 3-letter abbreviations
export type Weekday = 'SAT' | 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

/*export interface ClinicProps {
  id: string;
  firestorePath: string;
  mainAverageAppointmentTimeTake: number;   // number in miliseconds
  ownerID: string;
  weekScheduleTemplate?: { [key in Weekday]: string[] }; // Use a mapped type for weekdays
  // TODO: Make a structure of even number; start and end
  //
  //weekScheduleTemplate: {
  //  'SAT'?: string[];  '1200',  '1500',  '1700', '2300'          must be even numbers
  //  'SUN'?: string[];
  //  'MON'?: string[];
  //  'TUE'?: string[];
  //  'WED'?: string[];
  //  'THU'?: string[];
  //  'FRI'?: string[];
  //}; // Use a mapped type for weekdays
}*/

export class Clinic {
  constructor(
    public clinicName: string,
    public clinicAddress: string,
    public ownerID: string,
    // TODO: change the name to something else than doctor (doc/operator/specialist/...)
    public doctors: string[],  // [[id], [id], ...]
    public assistants: string[],  // [[id], [id], ...]
    public clinicSubtitle?: string,
    public geoAddress?: string,  // maps:https://maps.app.goo.gl/uEsL4Ddt12jZuKfL8
    public weekScheduleTemplate?: { [key in Weekday]: string[] }, // Use a mapped type for weekdays
    public id?: string,
    public firestorePath?: string,
    public mainAverageAppointmentTimeTake?: number,   // number in miliseconds
    public fee?: number
  ) { }
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
  //id?: string;
  clinicID?: string;
  dateTime: Date;
  state: 'waiting' | 'examining' | 'done';
  isUrgent: boolean;
  patientInClinic: boolean;
  reasonForVisit: string;
  paid: boolean;
  latenessCtr: number;
  patient: Patient;
  expectedTime?: string;  // '13:00'
  timeTakenInMiliSeconds?: number;
}

export interface DaySchedule {
  firestorePath: string;
  id: string;
  appointments: Appointment[];
  altered: boolean;
}
