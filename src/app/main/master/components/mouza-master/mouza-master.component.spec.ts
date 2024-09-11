import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MouzaMasterComponent } from './mouza-master.component';

describe('MouzaMasterComponent', () => {
  let component: MouzaMasterComponent;
  let fixture: ComponentFixture<MouzaMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MouzaMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MouzaMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
