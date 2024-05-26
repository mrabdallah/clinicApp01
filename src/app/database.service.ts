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
  DocumentSnapshot,
  DocumentData,
  DocumentReference,
  docData,
  orderBy,
  getDoc,
  runTransaction,
  Transaction
} from '@angular/fire/firestore';
//import { Moment } from 'moment';
import { Observable, Subscription, defer, from, map, take, of, scheduled, throwError, tap, catchError } from 'rxjs';
import { Appointment, Clinic, Patient } from './types';
import { LoggerService } from './logger.service';



@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore);
  loggerService: LoggerService = inject(LoggerService);
  patientsOnTimeSnapshot: any[] = [];
  private allPatients$: Observable<Patient[]> = of([]);
  private clinc?: Clinic;
  public todaySchedule$: Observable<Appointment[]> = new Observable(observer => {
    this.loggerService.log('Fetching todaySchedule$');
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to 12 AM
    return onSnapshot(
      doc(this.firestore, `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`),
      (docSnapshot) => {
        let appointments: Appointment[] = [];
        if (docSnapshot.exists()) {
          this.loggerService.log('todaySchedule$ - new snapshot');
          for (const appointment of docSnapshot.data()['appointments'] as Appointment[]) {
            appointments.push({
              dateTime: appointment.dateTime,
              state: appointment.state,
              isUrgent: appointment.isUrgent,
              patientInClinic: appointment.patientInClinic,
              reasonForVisit: appointment.reasonForVisit,
              paid: appointment.paid,
              latenessCtr: appointment.latenessCtr,
              patient: appointment.patient as Patient,
            } as Appointment);
          }
          observer.next(appointments);
        } else {
          this.loggerService.log('todaySchedule$ - No appointments found');
          observer.next([...appointments]);
        }
      },
      (error) => observer.error(error.message)
    );
  });
  //public todaySchedule$: Observable<Appointment[]> = new Observable(observer => {
  //  this.loggerService.log('Fetching today schedule $');
  //  let today = new Date();
  //  today.setHours(0, 0, 0, 0); // Set time to 12 AM
  //  // TODO: Subtract 'E8WUcagWkeNQXKXGP6Uq' with variable represent different doctors clinics
  //
  //  const unsubscribe = onSnapshot(doc(this.firestore, `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`), (snapshot) => {
  //    if (snapshot.exists()) {
  //      console.log('yeah');
  //      let todayScheduleAppointmentsArray: Appointment[] = [];
  //      for (const appointment of snapshot.data()['appointments'] as Appointment[]) {
  //        todayScheduleAppointmentsArray.push({
  //          dateTime: appointment.dateTime,
  //          state: appointment.state,
  //          isUrgent: appointment.isUrgent,
  //          patientInClinic: appointment.patientInClinic,
  //          reasonForVisit: appointment.reasonForVisit,
  //          paid: appointment.paid,
  //          latenessCtr: appointment.latenessCtr,
  //          patient: appointment.patient as Patient,
  //        } as Appointment);
  //      } observer.next(todayScheduleAppointmentsArray);
  //    } else { console.log('idk'); }

  //  }, (error) => {
  //    this.loggerService.logError('error fetching today schedule:', error);
  //    observer.error(error);
  //  });
  //  return unsubscribe();
  //})
  //.pipe(tap(x => {console.log('sadf')}))
  ;

  //public clinicDocOneTimeSnapshot$: Observable<Clinic | undefined> = docData(doc(this.firestore, this.clinic.path), { idField: 'id' })
  public clinicDocOneTimeSnapshot$: Observable<Clinic | undefined> = docData(doc(this.firestore, `/clinics/E8WUcagWkeNQXKXGP6Uq`), { idField: 'id' })
    .pipe(
      //tap(x => this.loggerService.log('Fetching Clinic Doc $')),
      //tap(x => this.loggerService.log(x)),
      map((data) => (data ? { ...data, firestorePath: `/clinics/E8WUcagWkeNQXKXGP6Uq`, } as Clinic : undefined)), // Handle missing document
      catchError((error) => {
        this.loggerService.logError('Error fetching appointments doc:', error);
        return of(undefined); // Return undefined on error
      })
    );




  constructor() {
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


  //this.databaseService.setAppointmentTimeTaken(this.appointment.patient.id, scheduleFirestorePath, this.milliseconds / 1000);
  async setAppointmentTimeTaken(patientID: string, scheduleFirestorePath: string, timeTakenInSeconds: number) {
    let scheduleRef = doc(this.firestore, scheduleFirestorePath);
    //await updateDoc(scheduleRef, {timeTakenInSeconds: timeTakenInSeconds });
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const scheduleDoc = await transaction.get(scheduleRef);
        if (!scheduleDoc.exists()) { throw 'Document Does not exist'; }
        let appointmentsUpstream: Appointment[] = scheduleDoc.data()['appointments'];
        let targetAppiontmentIndex: number = appointmentsUpstream.findIndex((appointment) => appointment.patient.id === patientID);
        appointmentsUpstream[targetAppiontmentIndex].timeTakenInSeconds = timeTakenInSeconds;
        transaction.update(scheduleRef, { appointments: appointmentsUpstream });
      });
    } catch (error) { }
  }


  fetchAllPatientsRealTimeSnapshot(): Observable<Patient[]> {
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

  //fetchTodaySchedule(): Observable<Appointment[]> {
  //  this.loggerService.log('Fetching today appointments');
  //  const today = new Date();
  //  // TODO: Subtract 'E8WUcagWkeNQXKXGP6Uq' with variable represent different doctors clinics
  //  today.setHours(0, 0, 0, 0); // Set time to 12 AM
  //  const todayScheduleDocRef = doc(
  //    this.firestore,
  //    `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`,
  //  );
  //  // `/appointments/`), where("dateTime", ">=", Timestamp.fromDate(today)), orderBy(''));
  //  return new Observable(observer => {
  //    const unsubscribe = onSnapshot(todayScheduleDocRef, (snapshot) => {
  //      if (snapshot.exists()) {
  //        let todayScheduleAppointmentsArray: Appointment[] = [];
  //        for (const appointment of snapshot.data()['appointments'] as Appointment[]) {
  //          todayScheduleAppointmentsArray.push({
  //            dateTime: appointment.dateTime,
  //            state: appointment.state,
  //            isUrgent: appointment.isUrgent,
  //            patientInClinic: appointment.patientInClinic,
  //            reasonForVisit: appointment.reasonForVisit,
  //            paid: appointment.paid,
  //            latenessCtr: appointment.latenessCtr,
  //            patient: appointment.patient as Patient,
  //          } as Appointment);
  //        }
  //        observer.next(todayScheduleAppointmentsArray);
  //      }
  //    }, (error) => {
  //      observer.error(error);
  //    });

  //    return () => unsubscribe();
  //  });
  //}

  getPatientDetails(patientID: string): Observable<Patient | null> {
    const patientDocRef = doc(this.firestore, `/patients/${patientID}`);
    return docData(patientDocRef).pipe(
      map((data: DocumentData | undefined) => {
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
                  latenessCtr: appointment.latenessCtr,
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
                  latenessCtr: appointment.latenessCtr,
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
  async handleLatePatient(patientID: string, targetScheduleFirestorePath: string) {
    console.log('transaction called');
    const targetScheduleRef = doc(this.firestore, targetScheduleFirestorePath);
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const targetScheduleDoc = await transaction.get(targetScheduleRef);

        if (!targetScheduleDoc.exists()) { throw "Appointment Document doesn't exist!"; }

        let upstreamAppointments: Appointment[] = [...targetScheduleDoc.data()['appointments']];
        let targetAppontmentIndex: number = upstreamAppointments.findIndex((appointment) => appointment.patient.id === patientID);
        let patientIDsToMoveDown: string[] = [];
        let firstOnsitePatientId: string | undefined;

        //upstreamAppointments[targetAppontmentIndex].latenessCtr += 1;
        //patientIDsToMoveDown.push(upstreamAppointments[targetAppontmentIndex].patient.id);

        for (let i = targetAppontmentIndex; i < upstreamAppointments.length; i++) {
          if (upstreamAppointments[i].patientInClinic) {
            firstOnsitePatientId = upstreamAppointments[i].patient.id;
            break;
            //} else if (
            //  !upstreamAppointments[i].patientInClinic &&
            //  upstreamAppointments[i].latenessCtr === upstreamAppointments[targetAppontmentIndex].latenessCtr - 1
            //) {
            //  break;
          } else {
            // TODO: Check apppointment time first before deciding to make action.
            upstreamAppointments[i].latenessCtr += 1;
            patientIDsToMoveDown.push(upstreamAppointments[i].patient.id);
          }
        }

        if (firstOnsitePatientId === undefined) { return; }

        for (let j = 0; j < patientIDsToMoveDown.length; j++) {
          let onSitePatientAppointmentIndex = upstreamAppointments.findIndex((appointment) => appointment.patient.id === firstOnsitePatientId);
          let appIndex: number = upstreamAppointments.findIndex((appointment) => appointment.patient.id === patientIDsToMoveDown[j]);
          let app: Appointment = upstreamAppointments.splice(appIndex, 1)[0];
          upstreamAppointments.splice(
            app.latenessCtr + j + onSitePatientAppointmentIndex - 1,
            0,
            app,
          );
          upstreamAppointments = upstreamAppointments.filter(element => element !== undefined);
        }


        let newSchedule: Appointment[] = upstreamAppointments.filter(appointment => appointment !== undefined);

        transaction.update(targetScheduleRef, { appointments: newSchedule });
        return;
      });
      this.loggerService.log('Late Patient Appointment\'s transaction successfully committed!');
    } catch (error) {
      this.loggerService.logError('Failed in: Late Patient Appointment\'s transaction:', error);
    } finally {
    }
  }


  async resetLatenessCounter(patientID: string, targetScheduleFirestorePath: string) {
    const targetScheduleRef = doc(this.firestore, targetScheduleFirestorePath);
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const targetScheduleDoc = await transaction.get(targetScheduleRef);
        if (!targetScheduleDoc.exists()) { throw "Appointment Document doesn't exist!"; }
        let upstreamScheduleCopy: Appointment[] = targetScheduleDoc.data()['appointments'];

        let targetAppointmentIndex: number = upstreamScheduleCopy.findIndex((appointment) => appointment.patient.id === patientID);
        upstreamScheduleCopy[targetAppointmentIndex].latenessCtr = 0;

        transaction.update(targetScheduleRef, { appointments: upstreamScheduleCopy });
        return;
      });
      this.loggerService.log('Transaction successfully committed!');
    } catch (error) {
      this.loggerService.logError('error onappointmentdone: ', error);
    }
  }



  // async moveAndIncreaseLatenessCounter(targetScheduleFirestorePath: string, targetAppointmentPatientID: string){
  async moveAndIncreaseLatenessCounter(targetScheduleFirestorePath: string) {
    const targetScheduleRef = doc(this.firestore, targetScheduleFirestorePath);
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const targetScheduleDoc = await transaction.get(targetScheduleRef);
        if (!targetScheduleDoc.exists()) { throw "Appointment Document doesn't exist!"; }
        let upstreamScheduleCopy: Appointment[] = [...targetScheduleDoc.data()['appointments']];
        type SomeTuple = [string, number];
        let movementShiftsArr: SomeTuple[] = [];
        let anchor: number = 0;

        console.log('schedule before calculations: ');
        console.log(upstreamScheduleCopy);


        for (const [index, value] of upstreamScheduleCopy.entries()) {
          if (value.state !== 'waiting') {
            movementShiftsArr.push([value.patient.id, 0]);
            anchor = index + 1;
          } else if (value.state === 'waiting' && !value.patientInClinic) {
            // TODO: check if clock, increase counter if late
            movementShiftsArr.push([value.patient.id, value.latenessCtr + 1]);
            upstreamScheduleCopy[index].latenessCtr += 1;
          } else {
            let shift: number = index - anchor;
            shift = -shift;
            movementShiftsArr.push([value.patient.id, shift]);
            break;
          }
        }
        console.log('schedule after calculations: ');
        console.log(upstreamScheduleCopy);

        console.log('shifts: ');
        console.log(movementShiftsArr);

        for (let i = 0; i < movementShiftsArr.length; i++) {
          if (movementShiftsArr[i][1] !== 0) {
            let appointmentIndex: number = upstreamScheduleCopy.findIndex((a) => a.patient.id === movementShiftsArr[i][0]);
            let appointment: Appointment = upstreamScheduleCopy.splice(appointmentIndex, 1)[0];
            upstreamScheduleCopy.splice(appointmentIndex + movementShiftsArr[i][1], 0, appointment);
          }
        }
        let newSchedule: Appointment[] = upstreamScheduleCopy.filter(element => element !== undefined);

        transaction.update(targetScheduleRef, { appointments: newSchedule });
        return;
      });
      this.loggerService.log('Transaction successfully committed!');
    } catch (error) {
      this.loggerService.logError('error onappointmentdone: ', error);
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

  async toggleOnSite(patientID: string, schedulePath: string, newState: boolean) {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const targetSchedule = await transaction.get(scheduleDocRef);
        if (!targetSchedule.exists()) { throw "Document does not exist!"; }
        let idx: number | undefined = this._findAppointmentIndexUsingPatientID(targetSchedule.data()['appointments'], patientID);
        if (idx === undefined) { throw "Appointment does not exist!" }
        const upstreamSchedule: Appointment[] = targetSchedule.data()['appointments'];
        upstreamSchedule[idx] = {
          ...targetSchedule.data()['appointments'][idx],
          patientInClinic: newState,
        }
        transaction.update(scheduleDocRef, { appointments: upstreamSchedule });
        return;
      });
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    }
  }

  async togglePaid(patientID: string, schedulePath: string, newState: boolean) {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const targetSchedule = await transaction.get(scheduleDocRef);
        if (!targetSchedule.exists()) {
          throw "Document does not exist!";
        }
        let idx: number | undefined = this._findAppointmentIndexUsingPatientID(targetSchedule.data()['appointments'], patientID);
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
    } catch (error) {
      this.loggerService.logError('Error Updating appoinment state', error);
    }
  }

  async toggleUrgent(patientID: string, schedulePath: string, newState: boolean) {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const targetSchedule = await transaction.get(scheduleDocRef);
        if (!targetSchedule.exists()) {
          throw "Document does not exist!";
        }
        let idx: number | undefined = this._findAppointmentIndexUsingPatientID(targetSchedule.data()['appointments'], patientID);
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
    } catch (error) { }
  }


  _findAppointmentIndexUsingPatientID(appointments: Appointment[], patientID: string): number | undefined {
    return appointments.findIndex((appointment) => appointment.patient.id === patientID);
  }

  async updateAppointmentState(patientID: string, schedulePath: string, newState: string, timeTakenInSeconds?: number) {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const targetScheduleDoc = await transaction.get(scheduleDocRef);
        if (!targetScheduleDoc.exists()) { throw "Document does not exist!"; }
        let appointments: Appointment[] = targetScheduleDoc.data()['appointments'];
        let targetAppointmentIndex: number | undefined = appointments.findIndex((appointment) => appointment.patient.id === patientID);
        if (targetAppointmentIndex === undefined) { return Promise.reject("Appointment doesn't exist"); }
        // let targetAppointment: Appointment = {
        //   ...appointments[idx],
        //   state: (newState as "waiting" | "examining" | "done"),
        // };
        appointments[targetAppointmentIndex].state = (newState as 'waiting' | 'examining' | 'done');

        let dayAverage = 0;
        if (timeTakenInSeconds !== undefined) {
          appointments[targetAppointmentIndex].timeTakenInSeconds = timeTakenInSeconds;
          let aSum: number = 0;
          let j = 0;
          for (let i = 0; i < appointments.length; i++) {
            if (appointments[i].timeTakenInSeconds === undefined || appointments[i].timeTakenInSeconds === 0) { continue }
            aSum += appointments[i].timeTakenInSeconds!;
            j += 1;
          }
          dayAverage = Math.floor(aSum / j);
        }

        transaction.update(scheduleDocRef, {
          appointments: appointments,
          dayAverage: dayAverage,
        });
        return;
      });
      this.loggerService.log('Appointment State Updated');
    } catch (error) {
      this.loggerService.logError('Error in update appointment state Transaction', error);
    }
  }

  /*
   *
        let oldLength:number = appointments.length >= 2 ? appointments.length - 1 : 0;
        let oldAverage: number = 0?
   * */
  async setOrUpdateClinicAppointmentsTimeAverage(firestorePath: string, newAverageInSeconds: number) {
    // const clinicDocRef = doc(this.firestore, firestorePath);
    // try {
    //   await runTransaction(this.firestore, async (transaction) => {
    //     const targetClinicDoc = await transaction.get(clinicDocRef);
    //     if (!targetClinicDoc.exists()) { throw "Document does not exist!"; }
    //     let mainAverage = targetClinicDoc.data()['mainAverageInSeconds'];

    //     if (mainAverage !== undefined) {
    //       appointments[targetAppointmentIndex].timeTakenInSeconds = timeTakenInSeconds;
    //     }

    //     transaction.update(scheduleDocRef, { appointments: appointments });
    //     return;
    //   });
    //   this.loggerService.log('Appointment State Updated');
    // } catch (error) {
    //   this.loggerService.logError('Error in update appointment state Transaction', error);
    // }
  }

  // Function to access the real-time data stream
  // getTodayScheduleRealTimeData(): Observable<Appointment[]> {
  //   return this.todaySchedule$;
  // }


  async fetchPatientsOneTimeSnapshot() {
    try {
      const patientsCollection = collection(this.firestore, 'patients');
      const patientsSnapshot = await getDocs(patientsCollection);

      this.patientsOnTimeSnapshot = patientsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
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
