import { Component } from '@angular/core';
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


  /*.actions-btns-container {
    border-top-right-radius: 4rem;
    border-bottom-right-radius: 4rem;
    border-top-left-radius: 7rem;
    border-bottom-left-radius: 7rem;
  }*/
  .object-contain{
    max-height: 2.5rem;
    object-fit: contain;
  }
  .icon-btn{
    transform: scale(1.2);
  }

  /*.toggling:not(.scale-out-hor-right){
    transition: 00.3s all ease;
    transform: scaleX(1);
  }*/

  
  `
})
export class PatientScheduleCurrentEntryComponent {
  panelOpenState = false;
  isOpen = true;
  toggle(){
    this.isOpen = !this.isOpen;
  }
}
