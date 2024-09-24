import { DeedMasterService } from './../../master/services/deed-master.service';
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
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { State } from '../../../model/state.model';
import { statesCollection } from '../../../data/states.collection';
import { LandRecordsService } from '../land-records.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { Dialog } from '@angular/cdk/dialog';
import { Company } from '../../../model/company.model';
import { CompanyMasterService } from '../../master/services/company-master.service';
import { Deed } from '../../../model/deed.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ChainDeedData } from '../../../model/chain-deed-data.model';

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
    ReactiveFormsModule,
    MatTooltipModule,
    MatButtonToggleModule,
  ],
  templateUrl: './new-land-record.component.html',
  styleUrl: './new-land-record.component.scss',
})
export class NewLandRecordComponent implements OnInit {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly landRecordsService = inject(LandRecordsService);
  private readonly companyMasterService: CompanyMasterService =
    inject(CompanyMasterService);
  private readonly deedMasterService: DeedMasterService =
    inject(DeedMasterService);

  private readonly dialog: Dialog = inject(Dialog);
  states: WritableSignal<State[]> = signal(statesCollection);
  cities: WritableSignal<string[]> = signal([]);
  sysIsBusy: WritableSignal<boolean> = signal(false);
  serverUnreachable: WritableSignal<boolean> = signal(false);
  id: string = '';

  updateMode: WritableSignal<boolean> = signal(false);
  disableFileRemoval: WritableSignal<boolean> = signal(false);
  viewMode: WritableSignal<boolean> = signal(false);

  newLandRecordForm: FormGroup = this.fb.group({
    companyId: ['', Validators.required],
    deedId: ['', Validators.required],
    deedType: ['main-deed', Validators.required],
    remarks: [''],
    historyChain: ['', Validators.required],
  });

  chainDeedForms: WritableSignal<FormGroup[]> = signal([
    this.fb.group({
      deedId: ['', Validators.required],
      deedType: ['chain-deed', Validators.required],
      order: [NaN, Validators.required],
    }),
  ]);

  mortgagedDisplayedColumns: string[] = [
    'slno',
    'party',
    'mortQty',
    'mortDateStr',
    'actions',
  ];
  partlySoldDisplayedColumns: string[] = [
    'slno',
    'sale',
    'dateStr',
    'qty',
    'deedLink',
    'actions',
  ];

  get form() {
    return this.newLandRecordForm.controls;
  }

  get chainDeedFormsArray(): {
    [key: string]: AbstractControl<any, any>;
  }[] {
    return this.chainDeedForms().map((formGroup) => formGroup.controls);
  }

  get chainDeedDataArray(): ChainDeedData[] {
    return this.chainDeedForms().map((formGroup) => formGroup.value);
  }

  chainDeedForm(index: number): {
    [key: string]: AbstractControl<any, any>;
  } {
    return this.chainDeedForms()[index].controls;
  }

  chainDeedData(index: number): ChainDeedData {
    return this.chainDeedForms()[index].value;
  }

  onAddChainDeed(
    initialValues: ChainDeedData = {
      deedId: '',
      deedType: 'chain-deed',
      order: NaN,
    }
  ): void {
    this.chainDeedForms.update((formsArray: FormGroup[]) => {
      formsArray.push(
        this.fb.group({
          deedId: [initialValues.deedId, Validators.required],
          deedType: [initialValues.deedType, Validators.required],
          order: [
            initialValues.order,
            [Validators.required, Validators.min(1)],
          ],
        })
      );
      return formsArray;
    });
  }

  onRemoveChainDeed(index: number): void {
    const oldFormsArray: FormGroup[] = this.chainDeedForms();
    if (oldFormsArray.length > 1) {
      oldFormsArray.splice(index, 1);
      this.chainDeedForms.set(oldFormsArray);
    }
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
    return this.purQty - this.partlySoldQty - this.mortgagedQty;
  }

  /**
   * Calculates the total quantity sold by summing up the quantities of all partly sold data
   * and subtracting the quantity entered in the partly sold details form.
   *
   * @return {number} The total quantity sold.
   */
  get partlySoldQty(): number {
    // return this.partlySoldData().reduce((accumulator: number, current: any) => {
    //   return accumulator + (parseFloat(current.qty) || 0);
    // }, 0);
    return 0;
  }

  /**
   * Calculates the total mortgaged quantity by summing up the mortgaged quantities of all mortgaged data.
   *
   * @return {number} The total mortgaged quantity.
   */
  get mortgagedQty(): number {
    // return this.mortgagedData().reduce((accumulator: number, current: any) => {
    //   return accumulator + (parseFloat(current.mortQty) || 0);
    // }, 0);
    return 0;
  }

  readonly companyList: WritableSignal<Company[]> = signal<Company[]>([]);
  readonly deedList: WritableSignal<Deed[]> = signal<Deed[]>([]);

  setCompanyList(): void {
    this.sysIsBusy.set(true);
    this.companyMasterService.getCompanyList().subscribe({
      next: (data) => {
        this.companyList.set(data);
      },
      error: () => {
        this.serverUnreachable.set(true);
      },
      complete: () => {
        this.sysIsBusy.set(false);
      },
    });
  }

  setDeedList(): void {
    this.sysIsBusy.set(true);
    this.deedMasterService.getDeedList().subscribe({
      next: (data: Deed[]) => {
        this.deedList.set(data);
      },
      error: () => {
        this.serverUnreachable.set(true);
      },
      complete: () => {
        this.sysIsBusy.set(false);
      },
    });
  }

  /**
   * Returns the name of the given state code from statesCollection.
   * If the code is not found, the given code is returned as is.
   * @param stateCode the state code to find the name for
   * @returns the name of the given state code or the code itself if not found
   */
  getStateName(stateCode: string): string {
    return (
      statesCollection.find((state) => state.code === stateCode)?.name ||
      stateCode
    );
  }

  /**
   * Returns the prepared form data.
   *
   * @return {Object} The prepared form data.
   */
  get preparedForm(): Object {
    const data = this.newLandRecordForm.value;

    let chainDeedData: ChainDeedData[] = [];

    if (data.deedType === 'chain-deed')
      chainDeedData = this.chainDeedDataArray;

    data.chainDeedData = chainDeedData;

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
    if (this.remainingQty < 0) {
      alert(
        '⛔ ERROR: CAN NOT SUBMIT\n\nRemaining asset quantity cannot be less than zero.'
      );
      return;
    }
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
      alert(
        '⛔ ERROR: CAN NOT SUBMIT\n\nInvalid form data. Please check and try again'
      );
    }
    console.log(this.newLandRecordForm);
  }

  fileInfoArray: any = {
    scanCopyFile: [],
    mutationFile: [],
    conversionFile: [],
    documentFile: [],
    hcdocumentFile: [],
    parchaFile: [],
  };

  fileObj: any = {
    scanCopyFileRAW: [],
    mutationFileRAW: [],
    conversionFileRAW: [],
    documentFileRAW: [],
    hcdocumentFileRAW: [],
    parchaFileRAW: [],
  };

  oldFileInfoArray: any = {
    scanCopyFile: [],
    mutationFile: [],
    conversionFile: [],
    documentFile: [],
    hcdocumentFile: [],
    parchaFile: [],
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
   * Opens a new window to display the specified file from the attachments directory.
   *
   * @param {string} fieldName - The name of the field containing the file.
   * @param {string} fileName - The name of the file to display.
   * @return {void} This function does not return anything.
   */
  onWindowPopupOpenForFiles(fieldName: string, fileName: string): void {
    this.sysIsBusy.set(true);
    this.landRecordsService
      .getFile(fieldName, fileName)
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
   * Formats a given date string into a format suitable for backend processing.
   *
   * @param {string} dateString - The date string to be formatted.
   * @return {string} The formatted date string in 'YYYY-MM-DD' format.
   */
  formatDateForBackend(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  /**
   * Converts a date string into an ISO string format.
   *
   * @param {string} dateString - The date string to be converted.
   * @return {string} The ISO string representation of the input date string.
   */
  getDateFromString(dateString: string): string {
    return new Date(dateString).toISOString();
  }

  ngOnInit(): void {
    this.setCompanyList();
    this.setDeedList();

    this.route.url.subscribe((data) => {
      this.updateMode.set(data[0].path == 'update');
      this.viewMode.set(data[0].path == 'view');
      if (this.updateMode() || this.viewMode()) {
        this.route.params.subscribe((data) => {
          this.id = data['id'];
          this.landRecordsService.getLandRecord(this.id).subscribe((data) => {
            console.log(data);
            this.newLandRecordForm.patchValue(data);
            if(data.chainDeedData && data.chainDeedData.length) {
              //reset
              this.chainDeedForms.set([]);
              data.chainDeedData.forEach((item: ChainDeedData) => {
                this.onAddChainDeed(item);
              });
            }
            this.chainDeedForms
            this.newLandRecordForm.patchValue({
              deedDate: this.getDateFromString(data['deedDate']),
              dueDate: this.getDateFromString(data['dueDate']),
              ledueDate: this.getDateFromString(data['ledueDate']),
              lelastDate: this.getDateFromString(data['lelastDate']),
            });
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
        this.newLandRecordForm.controls['companyId'].disable();
        this.newLandRecordForm.controls['deedName'].disable();
        this.newLandRecordForm.controls['mortgaged'].disable();
        this.newLandRecordForm.controls['deedType'].disable();
        this.newLandRecordForm.controls['partlySold'].disable();
      }
    });
  }
}
