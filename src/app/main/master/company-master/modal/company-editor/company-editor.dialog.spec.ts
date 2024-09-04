import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCompanyEditorComponent } from './company-editor.dialog';

describe('CompanyComponent', () => {
  let component: DialogCompanyEditorComponent;
  let fixture: ComponentFixture<DialogCompanyEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCompanyEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCompanyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
