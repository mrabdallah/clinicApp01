//export interface AppUser {
//  email: string;
//  username: string;
//}


export type UserRole = 'doctor' | 'assistant' | 'patient' | 'owner';

export class AppUser {
  constructor(
    public email: string,
    public id: string,
    public displayName?: string,  // custom data, use firestore, not firebase auth
    public mainRole?: UserRole      // custom data, in firestore
  ) { }
}

