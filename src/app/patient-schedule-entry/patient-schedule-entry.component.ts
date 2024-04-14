import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'patient-schedule-entry',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './patient-schedule-entry.component.html',
  styles: ``
})
export class PatientScheduleEntryComponent {
  @Input() patient: any;

}
