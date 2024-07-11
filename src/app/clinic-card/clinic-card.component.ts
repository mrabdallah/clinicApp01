import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Clinic } from '../types';


@Component({
  selector: 'clinic-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,

  ],
  templateUrl: './clinic-card.component.html',
  styleUrl: './clinic-card.component.css'
})
export class ClinicCardComponent {
  @Input({ required: true }) clinic!: Clinic;

}
