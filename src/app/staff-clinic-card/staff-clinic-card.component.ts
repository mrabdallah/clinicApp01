import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Store } from '@ngrx/store';

import { Clinic } from '../types';
import { AppState } from '../store/app.reducer';
import { deleteClinic } from '../store/clinic.actions';
import * as AppSelectors from '../store/app.selectors';
import { take } from 'rxjs';


interface DialogData {
  clinicPath: string;
  ownerID: string;
}

@Component({
  selector: 'staff-clinic-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './staff-clinic-card.component.html',
  styleUrl: './staff-clinic-card.component.css'
})
export class StaffClinicCardComponent {
  @Input({ required: true }) clinic!: Clinic;
  readonly dialog = inject(MatDialog);

  openDialogDelete(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DeleteConfirmationDialog, {
      data: {
        clinicPath: this.clinic.firestorePath,
        ownerID: this.clinic.ownerID,
      },
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  goEditClinic() {
    //
  }
}

@Component({
  selector: 'delete-confirmation-dialog',
  template: `
  <h2 mat-dialog-title>Delete clinic</h2>
  <mat-dialog-content>
    Are you sure you want to delete that clinic?
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close cdkFocusInitial>No</button>
    <button mat-button mat-dialog-close (click)="onClick()">Yes</button>
  </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationDialog {
  readonly dialogRef = inject(MatDialogRef<DeleteConfirmationDialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  //  readonly clinicPath = this.data.clinicPath;

  constructor(private _store: Store<AppState>) { }

  onClick() {
    let userID: string;
    this._store.select(AppSelectors.user).pipe(take(1)).subscribe(user => {
      userID = user!.id;
      console.log(`userID: ${user?.id}  ownerID: ${this.data.ownerID}`);
      if (userID === this.data.ownerID) {

        console.log('yeahhhhh');
        this._store.dispatch(deleteClinic({
          clinicPath: this.data.clinicPath,
          //ownerID: this.data.ownerID
        }));
      } else {
        console.log('naaaaaah');
      }
    });

  }
}
