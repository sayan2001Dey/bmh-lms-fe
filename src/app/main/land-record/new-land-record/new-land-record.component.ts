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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private landRecordsService = inject(LandRecordsService);
  states: WritableSignal<State[]> = signal(statesCollection);
  cities: WritableSignal<string[]> = signal([]);
  newLandRecordForm: FormGroup;
  mortgagedDetails: FormGroup;
  partlySoldDetails: FormGroup;
  id: number = -1;
  updateMode: boolean = false;
  disableFileRemoval: WritableSignal<boolean> = signal(false);
  viewMode: boolean = false;
  mortgagedData: WritableSignal<
    { party: string; mortDate: string; docFile?: string[] }[]
  > = signal([]);
  partlySoldData: WritableSignal<
    { sale: string; date: string; qty: string; deedLink: string }[]
  > = signal([]);
  mortgagedDisplayedColumns: string[] = ['slno', 'party', 'mortDate', 'actions'];
  partlySoldDisplayedColumns: string[] = ['slno', 'sale', 'date', 'qty', 'deedLink', 'actions'];

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

  onSubmit(): void {
    if (this.newLandRecordForm.valid) {
      if (this.updateMode) {
        this.landRecordsService.updateLandRecord(
          this.id,
          this.newLandRecordForm.value,
          this.fileObj,
          this.fileInfoArray,
          this.oldFileInfoArray
        );
      } else {
        this.landRecordsService.newLandRecord(
          this.newLandRecordForm.value,
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
  };

  fileObj: any = {
    scanCopyFileRAW: [],
    mutationFileRAW: [],
    conversionFileRAW: [],
    documentFileRAW: [],
    hcdocumentFileRAW: [],
  };

  oldFileInfoArray: any = {
    scanCopyFile: [],
    mutationFile: [],
    conversionFile: [],
    documentFile: [],
    hcdocumentFile: [],
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
    if(this.mortgagedDetails.valid) {
      const newMortgagedRecord = {
        party: this.mortgagedDetails.value.party,
        mortDate: this.mortgagedDetails.value.mortDate.toLocaleDateString(),
      };
      this.mortgagedData.set([...this.mortgagedData(), newMortgagedRecord]);
      this.mortgagedDetails.reset();
    }
  }

  /**
   * Removes the mortgaged record at the specified index.
   *
   * @param idx - The index of the mortgaged record to remove.
   * @returns void
   */
  onDeleteMortgaged(idx: number): void {
    if (idx > -1) {
      this.mortgagedData.set(this.mortgagedData().splice(idx + 1, 1));
    }
  }

  ngOnInit(): void {
    this.route.url.subscribe((data) => {
      this.updateMode = data[0].path == 'update';
      this.viewMode = data[0].path == 'view';
      if (this.updateMode || this.viewMode) {
        this.route.params.subscribe((data) => {
          this.id = data['id'];
          this.landRecordsService.getLandRecord(this.id).subscribe((data) => {
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
      if (this.viewMode) {
        this.newLandRecordForm.disable();
        this.disableFileRemoval.set(true);
      }
    });
  }
}
