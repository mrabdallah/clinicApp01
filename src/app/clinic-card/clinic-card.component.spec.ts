import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicCardComponent } from './clinic-card.component';

describe('ClinicCardComponent', () => {
  let component: ClinicCardComponent;
  let fixture: ComponentFixture<ClinicCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClinicCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
