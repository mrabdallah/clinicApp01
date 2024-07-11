import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffClinicCardComponent } from './staff-clinic-card.component';

describe('StaffClinicCardComponent', () => {
  let component: StaffClinicCardComponent;
  let fixture: ComponentFixture<StaffClinicCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffClinicCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaffClinicCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
