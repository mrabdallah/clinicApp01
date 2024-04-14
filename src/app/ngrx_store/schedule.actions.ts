import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Schedule Page] Change order',
  props<{ oldSchedule: Array<any>; newSchedule: Array<any> }>()
);