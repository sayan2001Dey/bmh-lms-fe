import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLandRecordComponent } from './new-land-record.component';

describe('NewLandRecordComponent', () => {
  let component: NewLandRecordComponent;
  let fixture: ComponentFixture<NewLandRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewLandRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewLandRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
