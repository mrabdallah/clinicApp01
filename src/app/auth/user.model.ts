//export interface AppUser {
//  email: string;
//  username: string;
//}


export type UserRole = 'doctor' | 'assistant' | 'patient' | 'owner';

export class AppUser {
  constructor(
    //public email: string,
    public id: string,
    public email?: string[],
    public avatarURL?: string,
    public displayName?: string,  // custom data, use firestore, not firebase auth
    public roles?: UserRole[],      // custom data, in firestore
    public doctorInClinics?: string[],  // clinic ids
    public assistantInClinics?: string[]
  ) { }
}

