import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChainGraphComponent } from './history-chain-graph.component';

describe('HistoryChainGraphComponent', () => {
  let component: HistoryChainGraphComponent;
  let fixture: ComponentFixture<HistoryChainGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryChainGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryChainGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
