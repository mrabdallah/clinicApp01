import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'patient-schedule-current-entry',
  standalone: true,
  imports: [MatIconModule, MatExpansionModule],
  templateUrl: './patient-schedule-current-entry.component.html',
  styles: `
  .elems-container {
    background: linear-gradient(270deg, #8EE0FB, #FFB2E6, #F7E3AF);
    background-size: 600% 600%;

    -webkit-animation: AnimationName 5s ease infinite;
    -moz-animation: AnimationName 5s ease infinite;
    animation: AnimationName 5s ease infinite;
  }

  @keyframes AnimationName {
      0%{background-position:0% 50%}
      50%{background-position:100% 50%}
      100%{background-position:0% 50%}
  }
  
  ::ng-deep .specific-class > .mat-expansion-indicator:after {
      color: red !important;
    }

  .object-contain{
    max-height: 2.5rem;
    object-fit: contain;
  }
  .icon-btn{
    transform: scale(1.2);
  }
  `
})
export class PatientScheduleCurrentEntryComponent {
  @Input() patient: any;
  panelOpenState = false;
  isOpen = true;
  toggle(){
    this.isOpen = !this.isOpen;
  }
}
