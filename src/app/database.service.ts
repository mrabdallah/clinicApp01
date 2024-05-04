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
  docData
} from '@angular/fire/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'
import { Moment } from 'moment';
import { Observable, map } from 'rxjs';
import { Appointment, Patient } from './types';

// interface DynamicDictionary {
//   [key: string]: any; // Key is a string, value can be any type
// }

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore);
  // patientNames: string[] = [];
  patientsOnTimeSnapshot: any[] = [];
  private allPatients$: Observable<any[]>;
  private todaySchedule$: Observable<Appointment[]>;

  constructor() {
    const allPatientsCollectionRef = query(collection(this.firestore, "patients"));
    this.allPatients$ = new Observable(observer => {
      const unsubscribe = onSnapshot(allPatientsCollectionRef, (snapshot) => {
        const patientsQuerySnapshot = snapshot.docs.map(doc => {
          // let pName = `${doc.data()['firstName']} ${doc.data()['lastName']}`;
          // if (!this.patientNames.includes(pName)) {
          //   this.patientNames.push(pName);
          // }
          return {
            firstName: doc.data()['firstName'], // Replace with property names
            lastName: doc.data()['lastName'], // and their mapping logic
            id: doc.id,
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
          };// as Foo;
        });
        observer.next(patientsQuerySnapshot);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });


    /* ******************************* Fetching today appointments ******************************* */
    // console.info('Fetching today appointments');
    // console.log()
    const today = new Date();
    // TODO: Subtract 'E8WUcagWkeNQXKXGP6Uq' with variable represent different doctors clinics
    // console.log(`/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}/appointments/`);
    today.setHours(0, 0, 0, 0); // Set time to 12 AM
    const todayScheduleCollectionRef = query(collection(this.firestore, `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/` +
      `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}` +
      `/appointments/`), where("dateTime", ">=", Timestamp.fromDate(today)));
    this.todaySchedule$ = new Observable(observer => {
      const unsubscribe = onSnapshot(todayScheduleCollectionRef, (snapshot) => {
        console.log('fetching appointments');
        if (snapshot.empty) {
          console.log('empty!!!!!!');
        } else{
          const todayScheduleQuerySnapshot = snapshot.docs.map(doc => {
            return {
              firestorePath: doc.ref.path,
              id: doc.id,
              dateTime: doc.data()['dateTime'].toDate(),
              patient: {
                firstName: doc.data()['firstName'],
                lastName: doc.data()['lastName'],
                id: doc.data()['patientID'],
                primaryContact: doc.data()['primaryContact'],
                dateOfBirth: doc.data()['dateOfBirth']?.toDate(),
              },
              state: doc.data()['state'],
              isUrgent: doc.data()['isUrgent'],
              reasonForVisit: doc.data()['reasonForVisit'],
              patientInClinic: doc.data()['patientInClinic'],
              paid: doc.data()['paid'],
            };
          });
          observer.next(todayScheduleQuerySnapshot);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  getPatient(patientID:string): Observable<Patient | null>{
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
    const today = new Date();
    try {
      await addDoc(collection(this.firestore,
        `/clinics/E8WUcagWkeNQXKXGP6Uq/schedule/` +  // TODO: Change the 'E8WUcagWkeNQXKXGP6Uq' to use a variable
        `${targetDate}` +
        `/appointments/`), {
          patientID: appointment.patient.id,
          firstName: appointment.patient.firstName,
          lastName: appointment.patient.lastName,
          primaryContact: appointment.patient.primaryContact,
          reasonForVisit: appointment.reasonForVisit,
          dateTime: appointment.dateTime,
          state: 'waiting',
          isUrgent: appointment.isUrgent,
          patientInClinic: appointment.patientInClinic,
          paid: appointment.paid,
      });
    } catch (error) {
      console.error('Error Setting New Patients:', error);
      // Handle errors gracefully, e.g., display an error message to the user
    }
  }

  async toggleOnSite(appointmentPath: string, newState: boolean){
    try{
      const docRef = doc(this.firestore, appointmentPath);
      await updateDoc(docRef, {
        patientInClinic: newState
      });
    } catch(error){}
  }

  async togglePaid(appointmentPath: string, newState: boolean){
    try{
      const docRef = doc(this.firestore, appointmentPath);
      await updateDoc(docRef, {
        paid: newState
      });
    } catch(error){}
  }

  async toggleUrgent(appointmentPath: string, newState: boolean){
    try{
      const docRef = doc(this.firestore, appointmentPath);
      await updateDoc(docRef, {
        isUrgent: newState
      });
    } catch(error){}
  }

  // async updateAppointmentState(collectionPath:string, appointmentID: string, newState:string){
  async updateAppointmentState(collectionPath: string, newState: string) {
    const docRef = doc(this.firestore, collectionPath);
    await updateDoc(docRef, {
      state: newState
    });
  }

  // Function to access the real-time data stream
  getRealTimeData(): Observable<any[]> {
    return this.allPatients$;
  }

  // Function to access the real-time data stream
  getTodayScheduleRealTimeData(): Observable<Appointment[]> {
    return this.todaySchedule$;
  }


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
