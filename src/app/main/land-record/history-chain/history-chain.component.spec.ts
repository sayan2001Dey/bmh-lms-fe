import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChainComponent } from './history-chain.component';

describe('HistoryChainComponent', () => {
  let component: HistoryChainComponent;
  let fixture: ComponentFixture<HistoryChainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryChainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
