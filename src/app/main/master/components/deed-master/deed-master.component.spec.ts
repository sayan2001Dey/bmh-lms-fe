import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeedMasterComponent } from './deed-master.component';

describe('DeedMasterComponent', () => {
  let component: DeedMasterComponent;
  let fixture: ComponentFixture<DeedMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeedMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeedMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
