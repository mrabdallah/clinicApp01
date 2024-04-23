import { createAction, props } from '@ngrx/store';
import { scheduled } from 'rxjs';

// export const login = createAction(
//   '[Schedule Page] Change order',
//   props<{ oldSchedule: Array<any>; newSchedule: Array<any> }>()
// );

export const opentNewPationFormDialog = createAction('[Schedule Page or SideNav] Open New Patient Form Dialog');