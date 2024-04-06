import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientScheduleCurrentEntryComponent } from './patient-schedule-current-entry.component';

describe('PatientScheduleCurrentEntryComponent', () => {
  let component: PatientScheduleCurrentEntryComponent;
  let fixture: ComponentFixture<PatientScheduleCurrentEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientScheduleCurrentEntryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientScheduleCurrentEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
