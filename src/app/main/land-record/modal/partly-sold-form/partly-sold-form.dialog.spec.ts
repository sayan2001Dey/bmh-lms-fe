import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPartlySoldFormComponent } from './partly-sold-form.dialog';

describe('PartlySoldFormComponent', () => {
  let component: DialogPartlySoldFormComponent;
  let fixture: ComponentFixture<DialogPartlySoldFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPartlySoldFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPartlySoldFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
