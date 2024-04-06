import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [MatListModule, MatDividerModule, MatButtonModule, MatIcon, MatIconModule],
  templateUrl: './side-bar.component.html',
  styles: `
  .list-item{
    display: flex;
    align-items: center;
  }
  `
})
export class SideBarComponent {

}
