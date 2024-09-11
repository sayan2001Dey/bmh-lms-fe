import { TestBed } from '@angular/core/testing';

import { MouzaMasterService } from './mouza-master.service';

describe('MouzaMasterService', () => {
  let service: MouzaMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MouzaMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
