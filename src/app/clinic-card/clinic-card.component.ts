import { Component, Input, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { Clinic } from '../types';


type sch = string[];

@Component({
  selector: 'clinic-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './clinic-card.component.html',
  styleUrl: './clinic-card.component.css'
})
export class ClinicCardComponent implements OnInit {
  router = inject(Router);
  @Input({ required: true }) clinic!: Clinic;
  public scheduelTemplate: sch[] = [];

  ngOnInit(): void {
    //      if(this.clinic.weekScheduleTemplate?.SAT) {
    //    }

  }

  to12AmPM(timeStr: string) {
    let minutes = parseInt(timeStr.split(':')[1]);
    let hours = parseInt(timeStr.split(':')[0]);
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = (hours % 12 || 12);

    //return `${hours.toString().padStart(2, '0')}:${minutes} ${amPm}`;
    return `${hours.toString()}:${minutes} ${amPm}`;
  }

  navigateToClinic() {
    this.router.navigateByUrl(`/clinic/${this.clinic.id}`);
  }

  onLike() {
    console.log('lllll');
  }
}
