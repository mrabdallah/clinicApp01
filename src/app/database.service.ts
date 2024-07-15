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
  Query,
  deleteDoc
} from '@angular/fire/firestore';
//import { Moment } from 'moment';
import { Observable, Subscription, defer, from, map, take, of, scheduled, throwError, tap, catchError, mergeMap, delay, takeUntil } from 'rxjs';
import { Appointment, Clinic, Patient } from './types';
import { LoggerService } from './logger.service';
import { FirebaseError } from '@angular/fire/app';
import { AuthService } from './auth.service';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.reducer';
import * as AppSelectors from './store/app.selectors';
import * as ScheduleActions from "./store/schedule.actions";
import * as ClinicActions from './store/clinic.actions';
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
      clinicSubtitle: snapshot.data()['clinicSubtitle'],
      clinicAddress: snapshot.data()['clinicAddress'],
      geoAddress: snapshot.data()['geoAddress'],
      firestorePath: snapshot.ref.path,
      mainAverageAppointmentTimeTake: snapshot.data()['mainAverageAppointmentTimeTake'],
      ownerID: snapshot.data()['ownerID'],
      personal: snapshot.data()['personal'],
      weekScheduleTemplate: snapshot.data()['weekScheduleTemplate'],
      fee: snapshot.data()['fee']
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
  scheduleRealTimeDocSubscription?: Subscription;
  newAppointmentScheduleRealTimeDocSubscription?: Subscription;
  clinicToEditRTDocSubscription?: Subscription;
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

  constructor(private store: Store<AppState>) {
    // this.fetchAllPatientsRealTimeSnapshot();
  }

  getMyOwnedClinics(userID?: string): Observable<Clinic[]> {
    if (userID === undefined) {
      return of([]);
    }
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

  fetchAllCLinics(): Observable<Clinic[]> {
    const clinicsRef = collection(this.firestore, "clinics");
    const q = query(clinicsRef).withConverter(clinicConverter);//, where('ownerID', '==', userID)).withConverter(clinicConverter);
    const promise = getDocs(q);
    return from(promise)
      .pipe(
        map((querySnapshot) => {
          if (!querySnapshot.empty) {
            return querySnapshot.docs.map(clinic => clinic.data());
          } else {
            const error: any = new Error('Error Fetching CLinics');
            error.timestamp = Date.now();
            return error;
            //throw new Error('Document not found'); // Throw custom error
          }
        }),
        catchError(this._handleFirestoreError)
      );
  }

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
      personal: {
        doctorEmails: clinicData.personal.doctorEmails,
        assistantEmails: clinicData.personal.assistantEmails,
      },
      clinicSubtitle: clinicData.clinicSubtitle,
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


  async createNewAppointment(clinicPath: string, appointment: Appointment, targetDate: string) {
    try {
      let appointmentDocRef = doc(
        this.firestore,
        `${clinicPath}/schedule/` + `${targetDate}`
      );
      await runTransaction(this.firestore, async (transaction) => {
        const scheduleSnapshot = await transaction.get(appointmentDocRef);
        if (!scheduleSnapshot.exists()) {
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
          //const fdsf = scheduleSnapshot.data()['appointments'];
          transaction.update(
            appointmentDocRef,
            {
              appointments: [
                ...scheduleSnapshot.data()['appointments'],
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


  async updateUpstreamScheduleVersion(newSchedule: Appointment[], path: string) {
    const targetDayScheduleDocRef = doc(this.firestore, path);
    try {

      await runTransaction(this.firestore, async (transaction) => {
        const targetDayScheduleDoc = await transaction.get(targetDayScheduleDocRef);
        if (!targetDayScheduleDoc.exists()) {
          throw "Document does not exist!"; // TODO: create a new one???
        }
        const upstreamSchedule: Appointment[] = targetDayScheduleDoc.data()['appointments'].slice();

        upstreamSchedule.splice(0, newSchedule.length, ...newSchedule);

        transaction.update(targetDayScheduleDocRef, { appointments: upstreamSchedule });
      });
      this.loggerService.log("Transaction 'updating schedule' successfully committed!");
    } catch (error) {
      this.loggerService.logError(error, "Transaction 'updating schedule' failed: ");
      throw error;
    }
  }

  toggleOnSite(patientID: string, schedulePath: string, newState: boolean): Observable<any> {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    return from(runTransaction(this.firestore, async (transaction) => {
      const targetScheduleSnapshot = await transaction.get(scheduleDocRef);
      if (!targetScheduleSnapshot.exists()) {
        return throwError(() => {
          const error: any = new Error("Clinic Schedule Document does not exist!");
          error.timestamp = Date.now();
          return error;
        });
      }

      const upstreamSchedule: Appointment[] = targetScheduleSnapshot.data()['appointments'];
      const idx: number | undefined = this._findAppointmentIndexUsingPatientID(upstreamSchedule, patientID);
      if (idx === undefined) {
        return throwError(() => {
          const error: any = new Error("Appointment does not exist!");
          error.timestamp = Date.now();
          return error;
        });
      }

      upstreamSchedule[idx] = {
        ...upstreamSchedule[idx],
        patientInClinic: newState,
      }
      transaction.update(scheduleDocRef, { appointments: upstreamSchedule });
      return;
    }))
      .pipe(
        map(() => this.loggerService.log("Appointment state 'On site' updated successfully")),
        catchError(error => throwError(() => error)),
        takeUntil(of(undefined).pipe(delay(1000))), // Emits after 1 second and completes
      );
  }

  togglePaid(patientID: string, schedulePath: string, newState: boolean): Observable<any> {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    return from(runTransaction(this.firestore, async (transaction) => {
      const targetScheduleSnapshot = await transaction.get(scheduleDocRef);
      if (!targetScheduleSnapshot.exists()) {
        return throwError(() => {
          const error: any = new Error("Clinic Schedule Document does not exist!");
          error.timestamp = Date.now();
          return error;
        });
      }

      const upstreamSchedule: Appointment[] = targetScheduleSnapshot.data()['appointments'];
      const idx: number | undefined = this._findAppointmentIndexUsingPatientID(upstreamSchedule, patientID);
      if (idx === undefined) {
        return throwError(() => {
          const error: any = new Error("Appointment does not exist!");
          error.timestamp = Date.now();
          return error;
        });
      }

      upstreamSchedule[idx] = {
        ...upstreamSchedule[idx],
        paid: newState,
      }
      transaction.update(scheduleDocRef, { appointments: upstreamSchedule });
      return;
    }))
      .pipe(
        map(() => this.loggerService.log("Appointment state 'On site' updated successfully")),
        catchError(error => throwError(() => error)),
        takeUntil(of(undefined).pipe(delay(1000))), // Emits immediately and completes
      );
  }

  toggleUrgent(patientID: string, schedulePath: string, newState: boolean): Observable<any> {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    return from(runTransaction(this.firestore, async (transaction) => {
      const targetScheduleSnapshot = await transaction.get(scheduleDocRef);
      if (!targetScheduleSnapshot.exists()) {
        return throwError(() => {
          const error: any = new Error("Clinic Schedule Document does not exist!");
          error.timestamp = Date.now();
          return error;
        });
      }

      const upstreamSchedule: Appointment[] = targetScheduleSnapshot.data()['appointments'];
      const idx: number | undefined = this._findAppointmentIndexUsingPatientID(upstreamSchedule, patientID);
      if (idx === undefined) {
        return throwError(() => {
          const error: any = new Error("Appointment does not exist!");
          error.timestamp = Date.now();
          return error;
        });
      }

      upstreamSchedule[idx] = {
        ...targetScheduleSnapshot.data()['appointments'][idx],
        isUrgent: newState,
      }
      transaction.update(scheduleDocRef, { appointments: upstreamSchedule });
      return;
    }))
      .pipe(
        map(() => this.loggerService.log("Appointment state 'On site' updated successfully")),
        catchError(error => throwError(() => error)),
        takeUntil(of(undefined).pipe(delay(1000))), // Emits immediately and completes
      );
  }

  _findAppointmentIndexUsingPatientID(appointments: Appointment[], patientID: string): number | undefined {
    return appointments.findIndex((appointment) => appointment.patient.id === patientID);
  }

  updateAppointmentState(
    patientID: string,
    schedulePath: string,
    newState: string,
    timeTakenInMiliSeconds: number
  ): Observable<any> {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    return from(runTransaction(this.firestore, async (transaction) => {
      const targetScheduleSnapshot = await transaction.get(scheduleDocRef);
      if (!targetScheduleSnapshot.exists()) {
        return throwError(() => {
          const error: any = new Error("Document does not exist!");
          error.timestamp = Date.now();
          return error;
        });
      }

      const appointments: Appointment[] = targetScheduleSnapshot.data()['appointments'];
      const idx: number | undefined = appointments.findIndex((appointment) => appointment.patient.id === patientID);

      if (idx === undefined) {
        return throwError(() => {
          const error: any = new Error("Appointment does not exist");
          error.timestamp = Date.now();
          return error;
        });
      }

      appointments[idx].state = (newState as 'waiting' | 'examining' | 'done');

      appointments[idx].timeTakenInMiliSeconds = timeTakenInMiliSeconds;
      let dayAverage = 0;
      let aSum: number = 0;
      let j = 0;

      for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].timeTakenInMiliSeconds === undefined || appointments[i].timeTakenInMiliSeconds === 0) { continue }
        aSum += appointments[i].timeTakenInMiliSeconds!;
        j += 1;
      }

      dayAverage = Math.floor(aSum / j);

      transaction.update(scheduleDocRef, {
        appointments: appointments,
        dayAverage: dayAverage,
      });
      return;
    }))
      .pipe(
        map(() => this.loggerService.log("Appointment state updated successfully")),
        catchError(error => throwError(() => error)),
        takeUntil(of(undefined).pipe(delay(1000))), // Emits after 1 second and completes
      );
  }

  updateAppointmentStateToExamining(
    patientID: string,
    schedulePath: string,
    newState: string,
    //timeTakenInMiliSeconds: number
  ): Observable<any> {
    const scheduleDocRef = doc(this.firestore, schedulePath);
    return from(runTransaction(this.firestore, async (transaction) => {
      const targetScheduleSnapshot = await transaction.get(scheduleDocRef);
      if (!targetScheduleSnapshot.exists()) {
        return throwError(() => {
          const error: any = new Error("Document does not exist!");
          error.timestamp = Date.now();
          return error;
        });
      }

      const appointments: Appointment[] = targetScheduleSnapshot.data()['appointments'];
      const idx: number | undefined = appointments.findIndex((appointment) => appointment.patient.id === patientID);

      if (idx === undefined) {
        return throwError(() => {
          const error: any = new Error("Appointment does not exist");
          error.timestamp = Date.now();
          return error;
        });
      }

      appointments[idx].state = (newState as 'waiting' | 'examining' | 'done');

      transaction.update(scheduleDocRef, {
        appointments: appointments,
        //dayAverage: dayAverage,
      });
      return;
    }))
      .pipe(
        map(() => this.loggerService.log("Appointment state updated successfully")),
        catchError(error => throwError(() => error)),
        takeUntil(of(undefined).pipe(delay(1000))), // Emits after 1 second and completes
      );
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

  fetchClinicByID(clinicID: string): Observable<Clinic> {
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

  fetchScheduleRealTimeDoc(clinicPath: string, dateStr: string): Observable<Appointment[]> {
    // dateStr format: dd|d_mm|m_yyyy
    //this.loggerService.log('inside fetchscheduleRealtimedoc method');
    //this.loggerService.log(clinicPath);
    //this.loggerService.log(dateStr);
    return new Observable(observer => {
      onSnapshot(
        doc(this.firestore, `${clinicPath}/schedule/${dateStr}`),
        (docSnapshot) => {
          let appointments: Appointment[] = [];
          if (docSnapshot.exists()) {
            for (const appointment of docSnapshot.data()['appointments']) {
              appointments.push({
                clinicID: clinicPath.split('/')[1],
                dateTime: (appointment.dateTime as Timestamp).toDate(),
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
            this.loggerService.log('found appointments: ', appointments);
            observer.next(appointments);
          } else {
            this.loggerService.log('todaySchedule$ - No appointments found');
            observer.next([...appointments]);
          }
        },
        (error) => observer.error(error.message)
      )
    });
  }

  subscribeToScheduleRealTimeDoc(clinicPath: string, dateStr: string) {
    this.scheduleRealTimeDocSubscription = this.fetchScheduleRealTimeDoc(clinicPath, dateStr)
      .subscribe(appointments => {
        this.store.dispatch(ScheduleActions.newScheduleSnapshot({ appointments }));
      });
  }

  unsubscribeFromScheduleRealTimeDoc() {
    this.scheduleRealTimeDocSubscription?.unsubscribe();
  }

  /* ****************************** */
  fetchClinicToEditRTDoc(clinicID: string): Observable<Clinic> {
    return new Observable(observer => {
      onSnapshot(
        doc(this.firestore, `/clinics/${clinicID}`).withConverter(clinicConverter),
        (docSnapshot) => {
          if (docSnapshot.exists()) {

            observer.next(docSnapshot.data());
          } else {
            observer.next(undefined);
          }
        },
        (error) => observer.error(error.message)
      )
    });
  }

  subscribeToClinicToEditRTDoc(clinicID: string) {
    this.clinicToEditRTDocSubscription = this.fetchClinicToEditRTDoc(clinicID)
      .subscribe(clinic => {
        this.store.dispatch(ClinicActions.newClinicToEditSnapshot({ clinic }));
      });
  }

  unsubscribeFromClinicToEditRTDoc() {
    this.clinicToEditRTDocSubscription?.unsubscribe();
  }

  /* ****************************** */

  fetchAppointmentScheduleRealTimeDoc(clinicPath: string, dateStr: string): Observable<Appointment[]> {
    return new Observable(observer => {
      onSnapshot(
        doc(this.firestore, `${clinicPath}/schedule/${dateStr}`),
        (docSnapshot) => {
          let appointments: Appointment[] = [];
          if (docSnapshot.exists()) {
            for (const appointment of docSnapshot.data()['appointments']) {
              appointments.push({
                clinicID: clinicPath.split('/')[1],
                dateTime: (appointment.dateTime as Timestamp).toDate(),
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
            this.loggerService.log('found appointments: ', appointments);
            observer.next(appointments);
          } else {
            this.loggerService.log('todaySchedule$ - No appointments found');
            observer.next([...appointments]);
          }
        },
        (error) => observer.error(error.message)
      )
    });
  }

  subscribeToAppointmentScheduleRealTimeDoc(clinicPath: string, dateStr: string) {
    this.newAppointmentScheduleRealTimeDocSubscription = this.fetchAppointmentScheduleRealTimeDoc(clinicPath, dateStr)
      .subscribe(appointments => {
        this.store.dispatch(ScheduleActions.newAppointmentScheduleSnapshot({ appointments }));
      });
  }

  unsubscribeFromAppintmentScheduleRealTimeDoc() {
    this.newAppointmentScheduleRealTimeDocSubscription?.unsubscribe();
  }

  deleteClinic(clinicPath: string) {
    // TODO: Do the delete from inside a cloud function
    const clinicRef = doc(this.firestore, clinicPath);
    const promise = deleteDoc(clinicRef);
    return from(promise).pipe(catchError(this._handleFirestoreError));
  }

  updateClinicField(clinicPath: string, fieldName: string, newState: any): Observable<any> {
    const clincDocRef = doc(this.firestore, clinicPath).withConverter(clinicConverter);
    const promise = updateDoc(clincDocRef, {
      [fieldName as keyof Clinic]: newState,
    });
    return from(promise).pipe(catchError(this._handleFirestoreError))
      .pipe(
        catchError(error => throwError(() => error)),
        takeUntil(of(undefined).pipe(delay(1000))), // Emits after 1 second and completes
      );
  }

}
