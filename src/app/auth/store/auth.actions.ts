import { createAction, props } from "@ngrx/store";
import { AppUser } from "../user.model";


export const loginWithEmailAndPasswordStart = createAction(
  '[Auth Component] loginWithEmailAndPasswordStart',
  props<{ email: string, password: string }>()
);

export const loginSuccess = createAction(
  '[Auth Component] loginWithEmailAndPasswordSuccess',
  props<{ user: AppUser }>()
);

export const logout = createAction('[Auth] userLoggedOut');
