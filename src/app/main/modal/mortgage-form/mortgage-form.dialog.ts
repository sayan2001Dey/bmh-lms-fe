import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  Component,
  Inject,
  inject,
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
import { MortgageData } from '../../../model/mortgage-data.model';
import { MatCardModule } from '@angular/material/card';
import { LandRecordsService } from '../../land-record/land-records.service';

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
  landRecordsService: LandRecordsService = inject(LandRecordsService);
  mortgagedDetails: FormGroup = this.fb.group({
    party: ['', Validators.required],
    mortDate: ['', Validators.required],
    mortQty: [0.0, Validators.required],
  });

  fileRAW: WritableSignal<File> = signal({} as File);
  newFile: WritableSignal<boolean> = signal(false);
  sysIsBusy: WritableSignal<boolean> = signal(false);
  resetFileBtn: WritableSignal<boolean> = signal(false);
  data: MortgageData;
  readonly remainingOldQty: number;
  readonly purQty: number;

  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA)
    public input: {
      data: MortgageData;
      remainingQty: number;
      purQty: number;
    } = {
      data: { party: '', mortDate: '', mortQty: 0.0 },
      remainingQty: 0,
      purQty: 0,
    }
  ) {
    // prettier-ignore
    this.data = input.data ? input.data : { party: '', mortDate: '', mortQty: 0.0 };
    // excludes old qty from remaining for correct calculation
    console.log(input);
    this.remainingOldQty = 1 * input.remainingQty + 1 * this.data.mortQty;
    this.purQty = input.purQty;
  }

  /**
   * Gets the mortgage quantity from the mortgaged details form.
   *
   * @return {number} The mortgage quantity.
   */
  get mortgageQty(): number {
    return parseFloat(this.mortgagedDetails.value.mortQty) || 0.0;
  }

  /**
   * Calculates the remaining quantity by subtracting the mortgaged quantity from the remaining old quantity.
   *
   * @return {number} The remaining quantity after subtracting the mortgaged quantity.
   */
  get remainingQty(): number {
    return this.remainingOldQty - this.mortgageQty;
  }

  /**
   * Handles the file upload event by setting the selected file and updating the newFile flag.
   *
   * @param {Event} event - The file upload event.
   * @return {void}
   */
  onClickUploadFile(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    if (files && files.length > 0) {
      this.fileRAW.set(files[0]);
      this.newFile.set(true);
    }
  }

  /**
   * Clears the file and sets the newFile flag to false.
   *
   * @return {void}
   */
  onFileClear() {
    this.fileRAW.set({} as File);
    this.newFile.set(false);
  }

  /**
   * Opens a new window to display the specified mortgage file.
   *
   * @param {string} fileName - The name of the mortgage file to display.
   * @return {void} This function does not return anything.
   */
  onWindowPopupOpenForMortFile(fileName: string): void {
    this.sysIsBusy.set(true);
    this.landRecordsService
      .getFile('mortDocFile', fileName)
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);

        window.open(
          url,
          'FileViewer',
          'width=1000, height=700, left=24, top=24, scrollbars, resizable'
        );
        window.URL.revokeObjectURL(url);
      })
      .add(() => {
        this.sysIsBusy.set(false);
      });
  }

  /**
   * Sets the old file based on the mortgage document file data.
   *
   * @return {void} This function does not return anything.
   */
  setOldFile(): void {
    if (
      this.data.mortDocFile &&
      this.data.mortDocFile !== '' &&
      !this.data.newFile
    ) {
      this.fileRAW.set(new File([], this.data.mortDocFile));
      this.resetFileBtn.set(true);
      this.newFile.set(false);
    }
  }

  /**
   * Submits the mortgaged details if they are valid and the mortgaged quantity is not zero.
   *
   * @return {void}
   */
  onSubmit(): void {
    if (!this.mortgagedDetails.valid) {
      alert('⛔ ERROR: CAN NOT SUBMIT\n\nInvalid form data. Please check and try again');
      return;
    }
    if(this.remainingQty < 0) {
      alert('⛔ ERROR: CAN NOT SUBMIT\n\nQuantity cannot be greater than remaining quantity');
      return;
    }
    if (this.mortgageQty === 0) {
      alert('⛔ ERROR: CAN NOT SUBMIT\n\nMortgaged quantity cannot be zero');
      return;
    }
    this.dialogRef.close({
      ...this.data,
      ...this.mortgagedDetails.value,
      fileRAW: this.fileRAW(),
      newFile: this.newFile(),
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
    if (!this.data) return;
    this.mortgagedDetails.patchValue({
      ...this.data,
      mortDate: new Date(this.data.mortDate),
    });
    if (this.data.newFile && this.data.fileRAW) {
      this.newFile.set(true);
      this.fileRAW.set(this.data.fileRAW);
    }
    this.setOldFile();
  }
}
