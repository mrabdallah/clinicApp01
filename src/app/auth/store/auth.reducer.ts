import { createReducer, on } from '@ngrx/store';
import { AppUser } from '../user.model';
import * as AuthActions from './auth.actions';
import { cloneDeep } from 'lodash-es';

export interface AuthState {
  user: AppUser | null;
}

export const initialAuthState: AuthState = {
  user: null,
  //home: 0,
  //away: 0,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.loginWithEmailAndPasswordStart, state => {
    const newState = cloneDeep(state);
    return newState;
  }),
  on(AuthActions.loginSuccess, (state, { user }) => {
    const newState = cloneDeep(state);
    newState.user = cloneDeep(user);
    return newState;
  }),
  on(AuthActions.loginSuccess, (state, { user }) => {
    const newState = cloneDeep(state);
    newState.user = cloneDeep(user);
    return newState;
  }),
  on(AuthActions.logout, state => {
    const newState = cloneDeep(state);
    newState.user = null;
    return newState;
  }),
  //on(ScoreboardPageActions.resetScore, state => ({ home: 0, away: 0 })),
  //on(ScoreboardPageActions.setScores, (state, { game }) => ({ home: game.home, away: game.away }))
);
