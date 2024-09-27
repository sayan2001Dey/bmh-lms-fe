import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphNodeComponent } from './graph-node.component';

describe('GraphNodeComponent', () => {
  let component: GraphNodeComponent;
  let fixture: ComponentFixture<GraphNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
