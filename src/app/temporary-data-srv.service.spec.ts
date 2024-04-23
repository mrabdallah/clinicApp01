import { TestBed } from '@angular/core/testing';

import { TemporaryDataSrvService } from './temporary-data-srv.service';

describe('TemporaryDataSrvService', () => {
  let service: TemporaryDataSrvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemporaryDataSrvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
