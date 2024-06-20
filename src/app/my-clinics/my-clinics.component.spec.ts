import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyClinicsComponent } from './my-clinics.component';

describe('MyClinicsComponent', () => {
  let component: MyClinicsComponent;
  let fixture: ComponentFixture<MyClinicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyClinicsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyClinicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
