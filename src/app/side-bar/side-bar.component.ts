import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [MatListModule, MatDividerModule, MatButtonModule, MatIcon, MatIconModule, RouterLink],
  templateUrl: './side-bar.component.html',
  styles: `
  .main-container{
    border-top: 1px solid hsl(197deg 36% 10% / 20%);
  }
  `
})
export class SideBarComponent {

}
