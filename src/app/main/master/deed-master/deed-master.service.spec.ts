import { TestBed } from '@angular/core/testing';

import { DeedMasterService } from './deed-master.service';

describe('DeedMasterService', () => {
  let service: DeedMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeedMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
