import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeedMasterDialogComponent } from './deed-master-dialog.component';

describe('DeedMasterDialogComponent', () => {
  let component: DeedMasterDialogComponent;
  let fixture: ComponentFixture<DeedMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeedMasterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeedMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
