import { Component, Input } from '@angular/core';

@Component({
  selector: 'patient-history-visits-appointment',
  standalone: true,
  imports: [],
  templateUrl: './patient-history-visits-appointment.component.html',
  styles: `
  .circle-div{
    position: relative;
  }
  .dottt{
    position: absolute;
    top: 50%; /* Center vertically */
    left: 50%; /* Center horizontally */
    transform: translate(-50%, -50%); /* Adjust positioning as needed */
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background-color: blue;
  }
  `
})
export class PatientHistoryVisitsAppointmentComponent {
  @Input() layoutDirection?:string;
}
