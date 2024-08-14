import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  Component,
  Inject,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
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
import { MatCardModule } from '@angular/material/card';
import { PartlySoldData } from '../../../model/partly-sold-data.model';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'dialog-partly-sold-form',
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
    MatDividerModule,
  ],
  templateUrl: './partly-sold-form.dialog.html',
  styleUrl: './partly-sold-form.dialog.scss',
})
export class DialogPartlySoldFormComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  sysIsBusy: WritableSignal<boolean> = signal(false);
  partlySoldDetails: FormGroup = this.fb.group({
    sale: ['', Validators.required],
    date: ['', Validators.required],
    qty: ['', Validators.required],
    deedLink: ['', Validators.required],
  });
  data: PartlySoldData;
  readonly remainingOldQty: number;
  readonly purQty: number;

  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA)
    public input: {
      data: PartlySoldData;
      remainingQty: number;
      purQty: number;
    } = {
      data: { sale: '', date: '', qty: 0.0, deedLink: '' },
      remainingQty: 0,
      purQty: 0,
    }
  ) {
    this.data = input.data;
    this.remainingOldQty = input.remainingQty;
    this.purQty = input.purQty;
  }

  /**
   * Calculates the remaining quantity by subtracting the quantity sold from the remaining old quantity.
   *
   * @return {number} The remaining quantity after subtracting the quantity sold.
   */
  get remainingQty(): number {
    return this.remainingOldQty - this.partlySoldDetails.value.qty;
  }

  /**
   * Gets the quantity sold from the partly sold details form.
   *
   * @return {number} The quantity sold.
   */
  get soldQty(): number {
    return this.partlySoldDetails.value.qty;
  }

  /**
   * Submits the partly sold details if they are valid and the sold quantity is not zero.
   *
   * @return {void}
   */
  onSubmit(): void {
    if (!this.partlySoldDetails.valid) {
      return;
    }
    if (this.partlySoldDetails.value.qty === 0) {
      alert('Sold quantity cannot be zero');
      return;
    }
    this.dialogRef.close({
      ...this.data,
      ...this.partlySoldDetails.value,
    });
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
    if (this.data)
      this.partlySoldDetails.patchValue({
        ...this.data,
        date: new Date(this.data.date),
      });
  }
}
