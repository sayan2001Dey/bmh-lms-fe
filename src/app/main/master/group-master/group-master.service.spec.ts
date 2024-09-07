import { TestBed } from '@angular/core/testing';

import { GroupMasterService } from './group-master.service';

describe('GroupMasterService', () => {
  let service: GroupMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
