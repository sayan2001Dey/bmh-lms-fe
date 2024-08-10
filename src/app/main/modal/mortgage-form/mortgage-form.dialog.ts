import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MortgageData } from '../../../model/mortgage-data.model';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'dialog-mortgage-form',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatIconModule,
    MatIconButton,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
  templateUrl: './mortgage-form.dialog.html',
  styleUrl: './mortgage-form.dialog.scss',
})
export class DialogMortgageFormComponent {
  fb: FormBuilder = inject(FormBuilder);
  mortgagedDetails: FormGroup = this.fb.group({
    party: ['', Validators.required],
    mortDate: ['', Validators.required],
    mortQty: [0.0, Validators.required],
  });

  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA) public data: MortgageData = { party: '', mortDate: '', mortQty: 0.0 }
  ) {}
  
  onClickUploadFile($event: Event, arg1: string) {
    throw new Error('Method not implemented.');
  }
  
/**
 * Submits the mortgaged details if they are valid and the mortgaged quantity is not zero.
 *
 * @return {void}
 */
  onSubmit(): void {
    if (!this.mortgagedDetails.valid) {
      return;
    }
    if(this.mortgagedDetails.value.mortQty === 0) {
      alert('Mortgaged quantity cannot be zero');
      return;
    }
    this.dialogRef.close(this.mortgagedDetails.value);
  }

  /**
   *  Closes the dialog.
   *
   *  @return {void} No return value.
   */
  onCancel() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.mortgagedDetails.patchValue(this.data);
  }
}
