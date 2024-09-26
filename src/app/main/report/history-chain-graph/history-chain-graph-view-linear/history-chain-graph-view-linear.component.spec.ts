import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChainGraphViewLinearComponent } from './history-chain-graph-view-linear.component';

describe('HistoryChainGraphViewLinearComponent', () => {
  let component: HistoryChainGraphViewLinearComponent;
  let fixture: ComponentFixture<HistoryChainGraphViewLinearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryChainGraphViewLinearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryChainGraphViewLinearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
