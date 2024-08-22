import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUserComponent } from './user.dialog';

describe('UserComponent', () => {
  let component: DialogUserComponent;
  let fixture: ComponentFixture<DialogUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
