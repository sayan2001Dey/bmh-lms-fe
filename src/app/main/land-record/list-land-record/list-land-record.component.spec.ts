import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLandRecordComponent } from './list-land-record.component';

describe('ListLandRecordComponent', () => {
  let component: ListLandRecordComponent;
  let fixture: ComponentFixture<ListLandRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLandRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListLandRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
