import {
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';

import { State } from '../../../model/state.model';
import { statesCollection } from '../../../data/states.collection';
import { LandRecordsService } from '../../land-records.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-new-land-record',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatCardModule,
    MatDividerModule,
    MatSelectModule,
    MatIconModule,
    MatIconButton,
    ReactiveFormsModule,
    MatListModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatTableModule,
    RouterLink,
  ],
  templateUrl: './new-land-record.component.html',
  styleUrl: './new-land-record.component.scss',
})
export class NewLandRecordComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private landRecordsService = inject(LandRecordsService);
  states: WritableSignal<State[]> = signal(statesCollection);
  cities: WritableSignal<string[]> = signal([]);
  sysIsBusy: WritableSignal<boolean> = signal(false);
  newLandRecordForm: FormGroup;
  mortgagedDetails: FormGroup;
  partlySoldDetails: FormGroup;
  id: string = '';
  updateMode: WritableSignal<boolean> = signal(false);
  disableFileRemoval: WritableSignal<boolean> = signal(false);
  viewMode: WritableSignal<boolean> = signal(false);
  mortgagedData: WritableSignal<
    {
      mortId?: string;
      party: string;
      mortDate: string;
      docFile?: string[];
      docFileRAW?: File;
    }[]
  > = signal([]);
  partlySoldData: WritableSignal<
    {
      partId?: string;
      sale: string;
      date: string;
      qty: string;
      deedLink: string;
    }[]
  > = signal([]);
  mortgagedDisplayedColumns: string[] = [
    'slno',
    'party',
    'mortDate',
    'actions',
  ];
  partlySoldDisplayedColumns: string[] = [
    'slno',
    'sale',
    'date',
    'qty',
    'deedLink',
    'actions',
  ];

  constructor(private fb: FormBuilder) {
    this.newLandRecordForm = fb.group({
      groupName: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      mouza: ['', Validators.required],
      block: ['', Validators.required],
      jlno: ['', Validators.required],
      buyerOwner: ['', Validators.required],
      sellers: this.fb.array([]),
      deedName: ['Main Deed', Validators.required],
      deedNo: ['', Validators.required],
      deedDate: ['', Validators.required],
      oldRsDag: ['', Validators.required],
      newLrDag: ['', Validators.required],
      oldKhatian: ['', Validators.required],
      newKhatian: ['', Validators.required],
      currKhatian: ['', Validators.required],
      totalQty: ['', Validators.required],
      purQty: ['', Validators.required],
      mutedQty: ['', Validators.required],
      unMutedQty: ['', Validators.required],
      landStatus: ['Vested', Validators.required],
      conversionLandStus: ['Converted', Validators.required],
      deedLoc: ['', Validators.required],
      photoLoc: ['', Validators.required],
      govtRec: ['', Validators.required],
      locationAndPropRemarks: [''],
      khazanaStatus: ['', Validators.required],
      dueDate: ['', Validators.required],
      legalMatters: ['', Validators.required],
      ledueDate: ['', Validators.required],
      historyChain: ['', Validators.required],
      mortgaged: [false, Validators.required],
      partlySold: [false, Validators.required],
    });
    this.mortgagedDetails = fb.group({
      party: ['', Validators.required],
      mortDate: ['', Validators.required],
    });
    this.partlySoldDetails = fb.group({
      sale: ['', Validators.required],
      date: ['', Validators.required],
      qty: ['', Validators.required],
      deedLink: ['', Validators.required],
    });
    this.onAddSeller();
  }

  get mortgageDetailsForm() {
    return this.mortgagedDetails.controls;
  }

  get partlySoldDetailsForm() {
    return this.partlySoldDetails.controls;
  }

  get form() {
    return this.newLandRecordForm.controls;
  }

  get sellerForms() {
    return this.form['sellers'] as FormArray;
  }

  get sellerFormControls() {
    return this.sellerForms.controls as FormControl[];
  }

  /**
   * Calculates the purchased quantity or returns 0 if the value is not a number.
   *
   * @return {number} The purchased quantity, or 0 if the value is not a number.
   */
  get purQty(): number {
    return parseFloat(this.form['purQty'].value) || 0;
  }

  /**
   * Calculates the remaining quantity based on the purchased quantity and the quantity sold.
   *
   * @return {number} The remaining quantity after subtracting the quantity sold from the purchased quantity.
   */
  get remainingQty(): number {
    return this.purQty - this.soldQty;
  }

  /**
   * Calculates the total quantity sold by summing up the quantities of all partly sold data
   * and subtracting the quantity entered in the partly sold details form.
   *
   * @return {number} The total quantity sold.
   */
  get soldQty(): number {
    return (
      this.partlySoldData().reduce((accumulator: number, current: any) => {
        return accumulator + (parseFloat(current.qty) || 0);
      }, 0) + (parseFloat(this.partlySoldDetailsForm['qty'].value) || 0)
    );
  }

  /**
   * Updates the list of cities based on the selected state.
   *
   * @return {void} This function does not return a value.
   */
  onStatesChange(): void {
    const state = this.states().find(
      (data) => data.code === this.form['state'].value
    );
    if (state) this.cities.set(state.cities);
    else this.cities.set([]);
  }

  /**
   * Adds a new seller form control to the sellerForms array.
   *
   * @return {void} No return value.
   */
  onAddSeller(): void {
    this.sellerForms.push(this.fb.control('', Validators.required));
  }

  /**
   * Removes a seller from the sellerForms array if there is more than one seller.
   *
   * @param {number} idx - The index of the seller to be removed.
   * @return {void} No return value.
   */
  onRemoveSeller(idx: number): void {
    if (this.sellerForms.length > 1) this.sellerForms.removeAt(idx);
  }

  /**
   * Returns the prepared form data.
   *
   * @return {Object} The prepared form data.
   */
  get preparedForm(): Object {
    const data = this.newLandRecordForm.value;

    if (data.mortgaged || data.mortgaged === 'true')
      data.mortgagedData = this.mortgagedData();

    if (data.partlySold || data.partlySold === 'true')
      data.partlySoldData = this.partlySoldData();

    return data;
  }

  /**
   * Handles the form submission.
   *
   * If the form is valid, it either updates an existing land record or creates a new one.
   * If the form is invalid, it logs an error message and displays an alert.
   * Finally, it logs the form and its value for debugging purposes.
   *
   * @return {void} This function does not return anything.
   */
  onSubmit(): void {
    if (this.newLandRecordForm.valid) {
      if (this.updateMode()) {
        this.landRecordsService.updateLandRecord(
          this.id,
          this.preparedForm,
          this.fileObj,
          this.fileInfoArray,
          this.oldFileInfoArray
        );
      } else {
        this.landRecordsService.newLandRecord(
          this.preparedForm,
          this.fileObj,
          this.fileInfoArray
        );
      }
    } else {
      console.log('Invalid form data');
      alert('Invalid form data');
    }
    console.log(this.newLandRecordForm);
    console.log(this.newLandRecordForm.value);
  }

  fileInfoArray: any = {
    scanCopyFile: [],
    mutationFile: [],
    conversionFile: [],
    documentFile: [],
    hcdocumentFile: [],
    mortDocFile: [],
  };

  fileObj: any = {
    scanCopyFileRAW: [],
    mutationFileRAW: [],
    conversionFileRAW: [],
    documentFileRAW: [],
    hcdocumentFileRAW: [],
    mortDocFileRAW: [],
  };

  oldFileInfoArray: any = {
    scanCopyFile: [],
    mutationFile: [],
    conversionFile: [],
    documentFile: [],
    hcdocumentFile: [],
    mortDocFile: [],
  };

  /**
   * Handles the click event when the user uploads files.
   *
   * @param e The click event.
   * @param key The key of the category for the uploaded files.
   * @returns void
   */
  onClickUploadFiles(e: any, key: string): void {
    const onloadHandler = (e: any) => {
      this.fileObj[key + 'RAW'].push(e.target?.result as string);
    };

    if (e.target.files)
      for (let index = 0; index < e.target.files.length; index++) {
        const reader = new FileReader();
        reader.onload = onloadHandler;

        const file: File = e.target.files[index];

        this.fileInfoArray[key].push(file.name);
        reader.readAsArrayBuffer(file);
      }

    console.log(this.fileObj);
    console.log(this.fileInfoArray);
  }

  /**
   * Toggles the 'markedForDeletion' flag of a file in the oldFileInfoArray at the given index.
   *
   * @param category The category of the file.
   * @param idx The index of the file.
   * @returns void
   */
  removeFromPreviousUploads(category: string, idx: number): void {
    this.disableFileRemoval.set(true);
    if (idx > -1) {
      this.oldFileInfoArray[category][idx].markedForDeletion =
        !this.oldFileInfoArray[category][idx].markedForDeletion;
    }
    this.disableFileRemoval.set(false);
  }

  /**
   * Removes a file from the fileObj and fileInfoArray at the given index.
   *
   * @param category The category of the file to remove.
   * @param idx The index of the file to remove.
   * @returns void
   */
  removeFiles(category: string, idx: number): void {
    this.disableFileRemoval.set(true);
    if (idx > -1) {
      this.fileObj[category + 'RAW'].splice(idx, 1);
      this.fileInfoArray[category].splice(idx, 1);
    }
    this.disableFileRemoval.set(false);
  }

  /**
   * Adds a new mortgaged record to the mortgagedData array.
   *
   * @returns void
   */
  onAddMortgaged(): void {
    if (this.mortgagedDetails.valid) {
      const newMortgagedRecord = {
        party: this.mortgagedDetails.value.party,
        mortDate: this.mortgagedDetails.value.mortDate.toLocaleDateString(),
        mortDocFile: this.fileInfoArray.mortDocFile,
        mortDocFileRAW: this.fileObj.mortDocFileRAW,
      };
      this.mortgagedData.set([...this.mortgagedData(), newMortgagedRecord]);
      this.mortgagedDetails.reset();
      this.fileInfoArray.mortDocFile = [];
      this.fileObj.mortDocFileRAW = [];
    }
  }

  /**
   * Adds a new partly sold record to the partlySoldData array if the form is valid.
   *
   * @return {void} This function does not return anything.
   */
  onAddPartlySold(): void {
    if (this.partlySoldDetails.valid) {
      const newPartlySoldRecord = {
        sale: this.partlySoldDetails.value.sale,
        date: this.partlySoldDetails.value.date.toLocaleDateString(),
        qty: this.partlySoldDetails.value.qty,
        deedLink: this.partlySoldDetails.value.deedLink,
      };
      this.partlySoldData.set([...this.partlySoldData(), newPartlySoldRecord]);
      this.partlySoldDetails.reset();
    }
  }

  /**
   * Removes the mortgaged record at the specified index.
   *
   * @param idx - The index of the mortgaged record to remove.
   * @returns void
   */
  onDeleteMortgaged(idx: number): void {
    this.mortgagedData.set(this.mortgagedData().filter((_, i) => i != idx));
  }

  /**
   * Edits the mortgaged data at the specified index.
   *
   * @param {number} idx - The index of the mortgaged data to edit.
   * @return {void} This function does not return anything.
   */
  onEditMortgaged(idx: number): void {
    //TODO: Add logic to edit mortgaged data
    if (idx > -1) {
      this.mortgagedDetails.patchValue(this.mortgagedData()[idx]);
      this.mortgagedData.set(this.mortgagedData().splice(idx + 1, 1));
    }
  }

  /**
   * Deletes the partly sold data at the specified index.
   *
   * @param {number} idx - The index of the partly sold data to delete.
   * @return {void} No return value.
   */
  onDeletePartlySold(idx: number): void {
    this.partlySoldData.set(this.partlySoldData().filter((_, i) => i != idx));
  }

  /**
   * Updates the form with the details of a partly sold record at the specified index.
   *
   * @param {number} idx - The index of the partly sold record to edit.
   * @return {void} This function does not return anything.
   */
  onEditPartlySold(idx: number): void {
    if (idx > -1) {
      this.partlySoldDetails.patchValue(this.partlySoldData()[idx]);
      this.partlySoldData.set(this.partlySoldData().splice(idx + 1, 1));
    }
  }

  /**
   * Opens a new window to display the specified file from the attachments directory.
   *
   * @param {string} fieldName - The name of the field containing the file.
   * @param {string} fileName - The name of the file to display.
   * @return {void} This function does not return anything.
   */
  onWindowPopupOpenForFiles(fieldName: string, fileName: string): void {
    this.sysIsBusy.set(true);
    this.landRecordsService.getFile(fieldName, fileName).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(
          url,
          'FileViewer',
          'width=1000, height=700, left=24, top=24, scrollbars, resizable'
        );
        window.URL.revokeObjectURL(url);
      }
    ).add(() => {
      this.sysIsBusy.set(false);
    });
  }

  ngOnInit(): void {
    this.route.url.subscribe((data) => {
      this.updateMode.set(data[0].path == 'update');
      this.viewMode.set(data[0].path == 'view');
      if (this.updateMode() || this.viewMode()) {
        this.route.params.subscribe((data) => {
          this.id = data['id'];
          this.landRecordsService.getLandRecord(this.id).subscribe((data) => {
            console.log(data);
            this.mortgagedData.set(data['mortgagedData']);
            this.partlySoldData.set(data['partlySoldData']);
            this.newLandRecordForm.patchValue(data);
            if (data.scanCopyFile) {
              data.scanCopyFile.forEach((fileName: string) => {
                this.oldFileInfoArray.scanCopyFile.push({
                  fileName,
                  markedForDeletion: false,
                });
              });
            }
            if (data.mutationFile) {
              data.mutationFile.forEach((fileName: string) => {
                this.oldFileInfoArray.mutationFile.push({
                  fileName,
                  markedForDeletion: false,
                });
              });
            }
            if (data.conversionFile) {
              data.conversionFile.forEach((fileName: string) => {
                this.oldFileInfoArray.conversionFile.push({
                  fileName,
                  markedForDeletion: false,
                });
              });
            }
            if (data.documentFile) {
              data.documentFile.forEach((fileName: string) => {
                this.oldFileInfoArray.documentFile.push({
                  fileName,
                  markedForDeletion: false,
                });
              });
            }
            if (data.hcdocumentFile) {
              data.hcdocumentFile.forEach((fileName: string) => {
                this.oldFileInfoArray.hcdocumentFile.push({
                  fileName,
                  markedForDeletion: false,
                });
              });
            }
          });
        });
      }
      if (this.viewMode()) {
        this.disableFileRemoval.set(true);
        this.newLandRecordForm.controls['city'].disable();
        this.newLandRecordForm.controls['state'].disable();
        this.newLandRecordForm.controls['deedName'].disable();
        this.newLandRecordForm.controls['landStatus'].disable();
        this.newLandRecordForm.controls['conversionLandStus'].disable();
        this.newLandRecordForm.controls['mortgaged'].disable();
        this.newLandRecordForm.controls['partlySold'].disable();
      }
    });
  }
}
