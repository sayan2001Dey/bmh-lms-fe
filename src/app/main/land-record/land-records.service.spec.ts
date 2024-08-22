import { TestBed } from '@angular/core/testing';

import { LandRecordsService } from './land-record/land-records.service';

describe('LandRecordsService', () => {
  let service: LandRecordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LandRecordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
