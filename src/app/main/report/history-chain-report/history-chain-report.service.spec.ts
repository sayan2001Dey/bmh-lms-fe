import { TestBed } from '@angular/core/testing';

import { HistoryChainReportService } from './history-chain-report.service';

describe('HistoryChainReportService', () => {
  let service: HistoryChainReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoryChainReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
