//export interface AppUser {
//  email: string;
//  username: string;
//}

export class AppUser {
  constructor(
    public email: string,
    public id: string,
    public displayName?: string
  ) { }
}

