import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClinicComponent } from './edit-clinic.component';

describe('EditClinicComponent', () => {
  let component: EditClinicComponent;
  let fixture: ComponentFixture<EditClinicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditClinicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
