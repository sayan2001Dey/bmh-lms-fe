import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChainGraphDynamicComponent } from './history-chain-graph-dynamic.component';

describe('HistoryChainGraphDynamicComponent', () => {
  let component: HistoryChainGraphDynamicComponent;
  let fixture: ComponentFixture<HistoryChainGraphDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryChainGraphDynamicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryChainGraphDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
