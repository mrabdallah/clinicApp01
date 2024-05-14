import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  Firestore,
  collection,
  getDocs,
  onSnapshot,
  where,
  query,
  doc,
  Timestamp,
  updateDoc,
  setDoc,
  QueryDocumentSnapshot,
  DocumentData,
  DocumentReference,
  docData,
  orderBy,
  getDoc,
  runTransaction,
  Transaction
} from '@angular/fire/firestore';
import { Moment } from 'moment';
import { Observable, Subscription, defer, from, map, of } from 'rxjs';
import { Appointment, DaySchedule, Patient } from './types';
import { LoggerService } from './logger.service';



@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore);
  loggerService: LoggerService = inject(LoggerService);
  patientsOnTimeSnapshot: any[] = [];
  private allPatients$: Observable<Patient[]> = of([]);
  // private todaySchedule$: Observable<Appointment[]> = of([]);
  // private todayAppointmentsDocRealTimeSnapshot$: Observable<Appointments> = of([]);

  constructor(){
    // this.fetchAllPatientsRealTimeSnapshot();
  }

  // getTodayAppointmentsDocRealTimeSnapshot(targetDate: string): Observable<DaySchedule> {
  //   return new Observable<DaySchedule>((subscriber) => {
  //     const unsubscribe = onSnapshot(
  //       // TODO: change the path to be dynamic dependin on target clinic ID and doctor ID
  //       doc(this.firestore, `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${targetDate}`),
  //       () => {}
  //     );
  //     return unsubscribe;
  //   });
  // }

  fetchAllPatientsRealTimeSnapshot(): Observable<Patient[]>{
    const allPatientsCollectionRef = query(collection(this.firestore, "patients"));
    // this.allPatients$ = 
    return new Observable(observer => {
      const unsubscribe = onSnapshot(allPatientsCollectionRef, (snapshot) => {
        const patientsQuerySnapshot = snapshot.docs.map(doc => {
          return {
            id: doc.id,
            firstName: doc.data()['firstName'],
            lastName: doc.data()['lastName'],
            address: doc.data()['address'],
            allergies: doc.data()['allergies'],
            dateOfBirth: doc.data()['dateOfBirth'],
            primaryContact: doc.data()['primaryContact'],
            emergencyContact: doc.data()['emergencyContact'],
            familyMedicalHistory: doc.data()['familyMedicalHistory'],
            optInForDataSharing: doc.data()['optInForDataSharing'],
            pastMedicalHistory: doc.data()['pastMedicalHistory'],
            preferredAppointmentDaysAndTimes: doc.data()['preferredAppointmentDaysAndTimes'],
            socialHistory: doc.data()['socialHistory'],
            // ... other properties
          };// as Patient;
        });
        observer.next(patientsQuerySnapshot);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  fetchTodaySchedule(): Observable<Appointment[]>{
    this.loggerService.log('Fetching today appointments');
    const today = new Date();
    // TODO: Subtract 'E8WUcagWkeNQXKXGP6Uq' with variable represent different doctors clinics
    today.setHours(0, 0, 0, 0); // Set time to 12 AM
    const todayScheduleDocRef = doc(
      this.firestore,
      `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`,
    );
    // `/appointments/`), where("dateTime", ">=", Timestamp.fromDate(today)), orderBy(''));
    return new Observable(observer => {
      const unsubscribe = onSnapshot(todayScheduleDocRef, (snapshot) => {
        if (snapshot.exists()) {
          let todayScheduleAppointmentsArray: Appointment[] = [];
          for (const appointment of snapshot.data()['appointments'] as Appointment[]) {
            todayScheduleAppointmentsArray.push({
              dateTime: appointment.dateTime,
              state: appointment.state,
              isUrgent: appointment.isUrgent,
              patientInClinic: appointment.patientInClinic,
              reasonForVisit: appointment.reasonForVisit,
              paid: appointment.paid,
              patient: appointment.patient as Patient,
            } as Appointment);
          }
          observer.next(todayScheduleAppointmentsArray);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  getPatientDetails(patientID:string): Observable<Patient | null>{
    const patientDocRef = doc(this.firestore, `/patients/${patientID}`);
    return docData(patientDocRef).pipe(
      map((data:DocumentData | undefined) => {
        if (data) {
          return {
            id: patientID,
            firstName: data['firstName'],
            lastName: data['lastName'],
            primaryContact: data['primaryContact'],
            address: data['address'],
            allergies: data['allergies'],
            dateOfBirth: data['dateOfBirth'].toDate(),
            emergencyContact: data['emergencyContact'],
            familyMedicalHistory: data['familyMedicalHistory'],
            optInForDataSharing: data['optInForDataSharing'],
            pastMedicalHistory: data['pastMedicalHistory'],
            preferredAppointmentDaysAndTimes: data['preferredAppointmentDaysAndTimes'],
            socialHistory: data['socialHistory'],
          } as Patient;
        } else {
          // handle document not found case (throw error, return null, etc.)
          return null;
        }
      })
    );
  }


  async createNewAppointment(appointment: Appointment, targetDate: string) {
    try {
      let appointmentDocRef = doc(
        this.firestore,
        `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/` +  // TODO: Change the 'E8WUcagWkeNQXKXGP6Uq' to use a variable
        `${targetDate}`
      );
      await runTransaction(this.firestore, async (transaction) => {
        const tt = await transaction.get(appointmentDocRef);
        if (!tt.exists()) {
          // TODO: create a new one
          transaction.set(appointmentDocRef, 
            {
              appointments: [
                {
                  patient: {
                    id: appointment.patient.id,
                    firstName: appointment.patient.firstName,
                    lastName: appointment.patient.lastName,
                    // primaryContact: appointment.patient.primaryContact,
                  },
                  reasonForVisit: appointment.reasonForVisit,
                  dateTime: appointment.dateTime,
                  state: 'waiting',
                  isUrgent: appointment.isUrgent,
                  patientInClinic: appointment.patientInClinic,
                  paid: appointment.paid,
                }
              ]
            }
          );
        } else {
          const fdsf = tt.data()['appointments'];
          transaction.update(
            appointmentDocRef,
            {
              appointments: [
                ...fdsf,
                {
                  patient: {
                    id: appointment.patient.id,
                    firstName: appointment.patient.firstName,
                    lastName: appointment.patient.lastName,
                    // primaryContact: appointment.patient.primaryContact,
                  },
                  reasonForVisit: appointment.reasonForVisit,
                  dateTime: appointment.dateTime,
                  state: 'waiting',
                  isUrgent: appointment.isUrgent,
                  patientInClinic: appointment.patientInClinic,
                  paid: appointment.paid,
                }
              ],
            }
          );
        }
      });
      this.loggerService.log('Transaction successfully committed!');
    } catch (error) {
      console.error('Error Setting New Appointment:', error);
      // Handle errors gracefully, e.g., display an error message to the user
    }
  }

  async moveAppointmentInSchedule(scheduleFirestorePath: string, previousAppointments: Appointment[]) {
      // TODO: Change the 'E8WUcagWkeNQXKXGP6Uq' to use a variable
      const targetDayScheduleDocRef = doc(this.firestore, scheduleFirestorePath);
      try {
  
      await runTransaction(this.firestore, async (transaction) => {
        const targetDayScheduleDoc = await transaction.get(targetDayScheduleDocRef);
        if (!targetDayScheduleDoc.exists()) {
          throw "Document does not exist!"; // TODO: create a new one???
        }
        const upstreamSchedule: Appointment[] = targetDayScheduleDoc.data()['appointments'].slice();

        upstreamSchedule.splice(0, previousAppointments.length, ...previousAppointments);

        // const newSchedule = [
        //   ...previousAppointments,
        //   {
        //     dateTime: appointment.dateTime,
        //     state: appointment.state,
        //     isUrgent: appointment.isUrgent,
        //     patientInClinic: appointment.patientInClinic,
        //     reasonForVisit: appointment.reasonForVisit,
        //     paid: appointment.paid,
        //     patient: appointment.patient,
        //   },
        // ];
  
        transaction.update(targetDayScheduleDocRef, { appointments: upstreamSchedule });
      });
      this.loggerService.log('Transaction successfully committed!');
    } catch (error) {
      this.loggerService.logError('Transaction failed: ', error);
      throw error;
    }
  }

  async toggleOnSite(patientID: string, schedulePath: string, newState: boolean){
    const scheduleDocRef = doc(this.firestore, schedulePath);
    try{
      await runTransaction(this.firestore, async (transaction) => {
        const targetSchedule = await transaction.get(scheduleDocRef);
        if (!targetSchedule.exists()){throw "Document does not exist!";}
        let idx: number|undefined = this._findAppointmentIndexUsingPatientID(targetSchedule.data()['appointments'], patientID);
        if (idx === undefined) {throw "Appointment does not exist!"}
        const upstreamSchedule: Appointment[] = targetSchedule.data()['appointments'];
        upstreamSchedule[idx] = {
          ...targetSchedule.data()['appointments'][idx],
          patientInClinic: newState,
        }
        transaction.update(scheduleDocRef, { appointments: upstreamSchedule });
        return;
      });
    } catch(error){
      this.loggerService.logError('Error Updating appoinment state', error);
    }
  }

  async togglePaid(patientID: string, schedulePath: string, newState: boolean){
    const scheduleDocRef = doc(this.firestore, schedulePath);
    try{
      await runTransaction(this.firestore, async (transaction) => {
        const targetSchedule = await transaction.get(scheduleDocRef);
        if (!targetSchedule.exists()){
          throw "Document does not exist!";
        }
        let idx: number|undefined = this._findAppointmentIndexUsingPatientID(targetSchedule.data()['appointments'], patientID);
        if (idx === undefined) {
          throw "Appointment does not exist!"
        }
        const upstreamSchedule: Appointment[] = targetSchedule.data()['appointments'];
        upstreamSchedule[idx] = {
          ...targetSchedule.data()['appointments'][idx],
          paid: newState,
        }
        transaction.update(scheduleDocRef, { appointments: upstreamSchedule });
        return;
      });
    } catch(error){
      this.loggerService.logError('Error Updating appoinment state', error);
    }
  }

  async toggleUrgent(patientID: string, schedulePath: string, newState: boolean) {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    try{
      await runTransaction(this.firestore, async (transaction) => {
        const targetSchedule = await transaction.get(scheduleDocRef);
        if (!targetSchedule.exists()){
          throw "Document does not exist!";
        }
        let idx: number|undefined = this._findAppointmentIndexUsingPatientID(targetSchedule.data()['appointments'], patientID);
        if (idx === undefined) {
          throw "Appointment does not exist!"
        }
        const upstreamSchedule: Appointment[] = targetSchedule.data()['appointments'];
        upstreamSchedule[idx] = {
          ...targetSchedule.data()['appointments'][idx],
          isUrgent: newState,
        }
        transaction.update(scheduleDocRef, { appointments: upstreamSchedule });
        return;
      });
    } catch(error){}
  }


  _findAppointmentIndexUsingPatientID(appointments: Appointment[], patientID: string): number | undefined {
    return appointments.findIndex((appointment) => appointment.patient.id === patientID);
  }

  async updateAppointmentState(patientID: string, schedulePath: string, newState: string) {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const targetSchedule = await transaction.get(scheduleDocRef);
        if (!targetSchedule.exists()) {throw "Document does not exist!";}
        let idx: number | undefined = this._findAppointmentIndexUsingPatientID(targetSchedule.data()['appointments'], patientID);
        if (idx === undefined) {return Promise.reject("Appointment doesn't exist");}
        let appointments: Appointment[] = targetSchedule.data()['appointments'];
          let targetAppointment: Appointment = {
            ...appointments[idx],
            state: (newState as "waiting"| "examining" | "done"),
          };
          appointments[idx] = targetAppointment;
          
          transaction.update(scheduleDocRef, { appointments: appointments });
          return;
      });
      this.loggerService.log('Appointment State Updated');
    } catch (error) {
      this.loggerService.logError('Error in update appointment state Transaction', error);
    }
  }


  
  // Function to access the real-time data stream
  // getTodayScheduleRealTimeData(): Observable<Appointment[]> {
  //   return this.todaySchedule$;
  // }


  async fetchPatientsOneTimeSnapshot() {
    try {
      const patientsCollection = collection(this.firestore, 'patients');
      const patientsSnapshot = await getDocs(patientsCollection);

      this.patientsOnTimeSnapshot = patientsSnapshot.docs.map((doc:QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = doc.data();
        // Optionally add a doc ID property for reference:
        data['id'] = doc.id;
        return {
          id: doc.id,
          firstName: doc.data()['firstName'],
        };
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Handle errors gracefully, e.g., display an error message to the user
    }
  }

  async addNewPatient(patient: any) {
    try {
      await addDoc(collection(this.firestore, "patients"), {
        firstName: patient.firstName,
        lastName: patient.lastName,
        address: patient.address,
        primaryContact: patient.primaryContact,
        emergencyContact: patient.emergencyContact,
        allergies: patient.allergies,
        pastMedicalHistory: patient.pastMedicalHistory,
        familyMedicalHistory: patient.familyMedicalHistory,
        socialHistory: patient.socialHistory,
        preferredAppointmentDaysAndTimes: patient.preferredAppointmentDaysAndTimes,
        optInForDataSharing: patient.optInForDataSharing,
        dateOfBirth: patient.dateOfBirth,
        // TODO: add field for the clinic created the record
        // TODO: add field for date time creted
      });
    } catch (error) {
      console.error('Error Setting New Patients:', error);
      // Handle errors gracefully, e.g., display an error message to the user
    }
  }
}
