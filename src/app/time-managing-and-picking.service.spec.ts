import { TestBed } from '@angular/core/testing';

import { TimeManagingAndPickingService } from './time-managing-and-picking.service';

describe('TimeManagingAndPickingService', () => {
  let service: TimeManagingAndPickingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeManagingAndPickingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
