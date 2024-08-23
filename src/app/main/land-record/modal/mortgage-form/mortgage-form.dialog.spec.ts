import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMortgageFormComponent } from './mortgage-form.dialog';

describe('MortgageFormComponent', () => {
  let component: DialogMortgageFormComponent;
  let fixture: ComponentFixture<DialogMortgageFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogMortgageFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogMortgageFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
