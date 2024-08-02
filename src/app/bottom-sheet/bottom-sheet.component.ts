import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';



@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.css'
})
export class BottomSheetComponent {

  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>) { }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
