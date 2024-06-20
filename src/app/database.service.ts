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
  Transaction,
  FirestoreError,
  limit,
  docSnapshots,
  QuerySnapshot,
  Query
} from '@angular/fire/firestore';
//import { Moment } from 'moment';
import { Observable, Subscription, defer, from, map, take, of, scheduled, throwError, tap, catchError, mergeMap } from 'rxjs';
import { Appointment, Clinic, Patient } from './types';
import { LoggerService } from './logger.service';
import { FirebaseError } from '@angular/fire/app';
import { AuthService } from './auth.service';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.reducer';
import { selectUser } from './store/app.selectors';
import { AppUser } from './auth/user.model';


// converter method
const clinicConverter = {
  toFirestore(clinic: Clinic) {
    return clinic; // Convert clinic object to plain object for Firestore
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Clinic {
    const clinic = {
      id: snapshot.id,
      clinicName: snapshot.data()['clinicName'],
      clinicAddress: snapshot.data()['clinicAddress'],
      firestorePath: snapshot.ref.path,
      mainAverageAppointmentTimeTake: snapshot.data()['mainAverageAppointmentTimeTake'],
      ownerID: snapshot.data()['ownerID'],
      weekScheduleTemplate: snapshot.data()['weekScheduleTemplate'],
    } as Clinic;
    return clinic;
  },
};

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private firestore: Firestore = inject(Firestore);
  private _authService = inject(AuthService);
  public loggerService: LoggerService = inject(LoggerService);
  patientsOnTimeSnapshot: any[] = [];
  private allPatients$: Observable<Patient[]> = of([]);
  public ownedClinics$: Observable<Clinic[]> = this._authService.user$.pipe(
    mergeMap(user => from(
      getDocs(query(collection(this.firestore, `clinics`), where('ownerID', '==', user?.id)).withConverter(clinicConverter))
        .then(querySnapshot => {
          if (!querySnapshot.empty) { throwError(() => new Error('No clinics created yet')); }
          const clinics: Clinic[] = [];
          querySnapshot.forEach(doc => {
            clinics.push(doc.data());
          });
          return clinics;
        })
    ).pipe(catchError(this._handleFirestoreError)))
  );

  private _handleFirestoreError(error: FirestoreError) {
    let errorMessage = 'An unknown error occurred!';
    if (!error || !error.code) {
      return throwError(() => new Error(errorMessage));
    }
    switch (error.code) {
      case 'not-found':
        errorMessage = 'Document not found';
        break;
      case 'unauthenticated':
        errorMessage = 'No valid credentials was provided with request';
        break;
      case 'permission-denied':
        errorMessage = 'Perminssion denied';
        break;
    }
    return throwError(() => new Error(errorMessage));
  }

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
              expectedTime: appointment.expectedTime,
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


  constructor(private store: Store<AppState>) {
    // this.fetchAllPatientsRealTimeSnapshot();
  }

  /*
   *   public ownedClinics$: Observable<Clinic[]> = this._authService.user$.pipe(
    mergeMap(user => from(
      getDocs(query(collection(this.firestore, `clinics`), where('ownerID', '==', user?.id)).withConverter(clinicConverter))
        .then(querySnapshot => {
          if (!querySnapshot.empty) { throwError(() => new Error('No clinics created yet')); }
          const clinics: Clinic[] = [];
          querySnapshot.forEach(doc => {
            clinics.push(doc.data());
          });
          return clinics;
        })
    ).pipe(catchError(this._handleFirestoreError)))
  );

   * */

  getMyOwnedClinics(userID: string): Observable<Clinic[]> {
    if (userID.length < 1) {
      this.loggerService.logWarning('no userID provided');
      return of([]);
    }
    const col = collection(this.firestore, 'clinics').withConverter(clinicConverter);
    const q = query(col, where('ownerID', '==', userID));
    return from(getDocs(q)).pipe(
      map((querySnapshot: QuerySnapshot<Clinic, Clinic>) => {
        if (!querySnapshot.empty) {
          this.loggerService.logWarning('empty query; no clinics owned by current user');
          let clinics: Clinic[] = [];
          for (let i = 0; i < querySnapshot.docs.length; i++) {
            clinics.push(querySnapshot.docs[i].data());
          }
          return clinics;
        }
        return []
      })
    );
  }
  /*getMyOwnedClinics(): Observable<Clinic[]> {
    return this.store.select(selectUser).pipe(
      take(1), // Get the user only once
      map(user => {
        if (user === null) {
          return of([]);
          //return throwError(() => new Error('No user provided'));
        }
        const coll = collection(this.firestore, 'clinics').withConverter(clinicConverter);
        return query(coll, where('ownerID', '==', (user as AppUser).id));
      }),
      //catchError(error => of([])),
      mergeMap(firestoreQuery => {
        if (firestoreQuery instanceof Error) {
          return of([]); // Return empty array if error from previous pipe
        }
        return from(getDocs(firestoreQuery as Query));
      }),
      map(querysnapshot => {
        if (querysnapshot && (querysnapshot as QuerySnapshot).empty) {
          //const a: Clinic[] = []
          return [];
          //return a;
        }
        return (querysnapshot as QuerySnapshot).docs.map(doc => doc.data() as Clinic); // Use map for data transformation
      })
    );
  }*/


  public getClinicDoc(clinicID: string): Observable<Clinic> {
    const promise = getDoc(doc(this.firestore, 'clinics', clinicID).withConverter(clinicConverter))
    return from(promise)
      .pipe(
        map((docSnapshot) => {
          if (docSnapshot.exists()) {
            return docSnapshot.data();
          } else {
            const error: any = new Error('Document Does not exist');
            error.timestamp = Date.now();
            return error;
            //throw new Error('Document not found'); // Throw custom error
          }
        }),
        catchError(this._handleFirestoreError)
      );
  }

  public getClinicDocs$: Observable<Clinic | undefined> = docData(doc(this.firestore, `/clinics/E8WUcagWkeNQXKXGP6Uq`), { idField: 'id' })
    .pipe(
      map((data) => (data ? { ...data, firestorePath: `/clinics/E8WUcagWkeNQXKXGP6Uq`, } as Clinic : undefined)), // Handle missing document
      catchError((error) => {
        this.loggerService.logError(error, 'Error fetching appointments doc:');
        return of(undefined); // Return undefined on error
      })
    );



  //this.databaseService.setAppointmentTimeTaken(this.appointment.patient.id, scheduleFirestorePath, this.milliseconds / 1000);
  async setAppointmentTimeTaken(patientID: string, scheduleFirestorePath: string, timeTakenInMiliSeconds: number) {
    let scheduleRef = doc(this.firestore, scheduleFirestorePath);
    //await updateDoc(scheduleRef, {timeTakenInMiliSeconds: timeTakenInMiliSeconds });
    try {
      await runTransaction(this.firestore, async (transaction) => {
        const scheduleDoc = await transaction.get(scheduleRef);
        if (!scheduleDoc.exists()) { throw 'Document Does not exist'; }
        let appointmentsUpstream: Appointment[] = scheduleDoc.data()['appointments'];
        let targetAppiontmentIndex: number = appointmentsUpstream.findIndex((appointment) => appointment.patient.id === patientID);
        appointmentsUpstream[targetAppiontmentIndex].timeTakenInMiliSeconds = timeTakenInMiliSeconds;
        transaction.update(scheduleRef, { appointments: appointmentsUpstream });
      });
    } catch (error) { }
  }

  addNewClinic(clinicData: Clinic): Observable<DocumentReference> {
    const promise = addDoc(collection(this.firestore, 'clinics').withConverter(clinicConverter), {
      clinicName: clinicData.clinicName,
      clinicAddress: clinicData.clinicAddress,
      ownerID: clinicData.ownerID,
    });
    return from(promise).pipe(catchError(this._handleFirestoreError));
  }

  public updateClinicWeekSchedule(obj: any, clinicPath: string): Observable<void> {
    const promise = updateDoc(doc(this.firestore, clinicPath), {
      weekScheduleTemplate: obj,
    });
    return from(promise).pipe(catchError(this._handleFirestoreError));
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
                  expectedTime: appointment.expectedTime,
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
                  expectedTime: appointment.expectedTime,
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
      this.loggerService.logError(error, 'Failed in: Late Patient Appointment\'s transaction:');
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
      this.loggerService.logError(error, 'error onappointmentdone');
    }
  }


  async moveAppointmentInSchedule(path: string, previousAppointments: Appointment[]) {
    // TODO: Change the 'E8WUcagWkeNQXKXGP6Uq' to use a variable
    const targetDayScheduleDocRef = doc(this.firestore, path);
    try {

      await runTransaction(this.firestore, async (transaction) => {
        const targetDayScheduleDoc = await transaction.get(targetDayScheduleDocRef);
        if (!targetDayScheduleDoc.exists()) {
          throw "Document does not exist!"; // TODO: create a new one???
        }
        const upstreamSchedule: Appointment[] = targetDayScheduleDoc.data()['appointments'].slice();

        upstreamSchedule.splice(0, previousAppointments.length, ...previousAppointments);

        transaction.update(targetDayScheduleDocRef, { appointments: upstreamSchedule });
      });
      this.loggerService.log('Transaction successfully committed!');
    } catch (error) {
      this.loggerService.logError(error, 'Transaction failed: ');
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
      this.loggerService.logError(error, 'Error Updating appoinment state');
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
      this.loggerService.logError(error, 'Error Updating appoinment state');
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

  async updateAppointmentState(patientID: string, schedulePath: string, newState: string, timeTakenInMiliSeconds?: number) {
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
        if (timeTakenInMiliSeconds !== undefined) {
          appointments[targetAppointmentIndex].timeTakenInMiliSeconds = timeTakenInMiliSeconds;
          let aSum: number = 0;
          let j = 0;
          for (let i = 0; i < appointments.length; i++) {
            if (appointments[i].timeTakenInMiliSeconds === undefined || appointments[i].timeTakenInMiliSeconds === 0) { continue }
            aSum += appointments[i].timeTakenInMiliSeconds!;
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
      this.loggerService.logError(error, 'Error in update appointment state Transaction');
    }
  }


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
