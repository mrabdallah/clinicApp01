import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientScheduleEntryComponent } from './patient-schedule-entry.component';

describe('PatientScheduleEntryComponent', () => {
  let component: PatientScheduleEntryComponent;
  let fixture: ComponentFixture<PatientScheduleEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientScheduleEntryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientScheduleEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
