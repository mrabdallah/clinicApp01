import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHistoryVisitsAppointmentComponent } from './patient-history-visits-appointment.component';

describe('PatientHistoryVisitsAppointmentComponent', () => {
  let component: PatientHistoryVisitsAppointmentComponent;
  let fixture: ComponentFixture<PatientHistoryVisitsAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientHistoryVisitsAppointmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientHistoryVisitsAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
