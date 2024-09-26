import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChainGraphViewOPMCComponent } from './history-chain-graph-view-opmc.component';

describe('HistoryChainGraphViewOPMCComponent', () => {
  let component: HistoryChainGraphViewOPMCComponent;
  let fixture: ComponentFixture<HistoryChainGraphViewOPMCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryChainGraphViewOPMCComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryChainGraphViewOPMCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
