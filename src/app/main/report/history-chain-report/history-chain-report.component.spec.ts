import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChainReportComponent } from './history-chain-report.component';

describe('HistoryChainReportComponent', () => {
  let component: HistoryChainReportComponent;
  let fixture: ComponentFixture<HistoryChainReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryChainReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryChainReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
