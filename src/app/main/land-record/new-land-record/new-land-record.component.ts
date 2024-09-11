import {
  Component,
  CreateEffectOptions,
  EffectRef,
  OnDestroy,
  OnInit,
  WritableSignal,
  effect,
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
import { LandRecordsService } from '../land-records.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MortgageData } from '../../../model/mortgage-data.model';
import { PartlySoldData } from '../../../model/partly-sold-data.model';
import { DialogMortgageFormComponent } from '../modal/mortgage-form/mortgage-form.dialog';
import { Dialog } from '@angular/cdk/dialog';
import { DialogPartlySoldFormComponent } from '../modal/partly-sold-form/partly-sold-form.dialog';
import { Group } from '../../../model/group.model';
import { GroupMasterService } from '../../master/group-master/group-master.service';
import { Mouza } from '../../../model/mouza.model';
import { MouzaMasterService } from '../../master/mouza-master/mouza-master.service';
import { Company } from '../../../model/company.model';
import { CompanyMasterService } from '../../master/company-master/company-master.service';
import { SellerType } from '../../../model/seller-type.model';

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
  ],
  templateUrl: './new-land-record.component.html',
  styleUrl: './new-land-record.component.scss',
})
export class NewLandRecordComponent implements OnInit, OnDestroy {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  private readonly landRecordsService = inject(LandRecordsService);
  private readonly groupMasterService: GroupMasterService =
    inject(GroupMasterService);
  private readonly mouzaMasterService: MouzaMasterService =
    inject(MouzaMasterService);
  private readonly companyMasterService: CompanyMasterService =
    inject(CompanyMasterService);

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
    groupId: ['', Validators.required],
    mouzaId: ['', Validators.required],
    companyId: ['', Validators.required],
    sellerType: ['within-group', Validators.required],
    sellers: this.fb.array([]),
    deedName: ['Main Deed', Validators.required],
    deedNo: ['', Validators.required],
    deedDate: ['', Validators.required],
    totalQty: ['', Validators.required],
    purQty: ['', Validators.required],
    mutedQty: ['', Validators.required],
    unMutedQty: ['', Validators.required],
    landStatus: ['Vested', Validators.required],
    landType: ['', Validators.required],
    conversionLandStus: ['Converted', Validators.required],
    deedLoc: ['', Validators.required],
    photoLoc: ['', Validators.required],
    govtRec: ['', Validators.required],
    remarks: [''],
    khazanaStatus: ['', Validators.required],
    tax: ['', Validators.required],
    dueDate: ['', Validators.required],
    legalMatters: ['', Validators.required],
    ledueDate: ['', Validators.required],
    lelastDate: ['', Validators.required],
    historyChain: ['', Validators.required],
    mortgaged: [false, Validators.required],
    partlySold: [false, Validators.required],
  });
  sellerTypes: WritableSignal<SellerType[]> = signal([
    {
      name: 'Within Group',
      value: 'within-group',
    },
    {
      name: 'Other',
      value: 'other',
    },
  ]);

  sellerType: WritableSignal<string> = signal('within-group');
  addSellerBtnVisible: WritableSignal<boolean> = signal(true);
  /**
   * DO NOT TRY TO FETCH THE VALUE OF addSellerBtnVisible IN THIS EFFECT.
   * 
   * IT MAY CAUSE AN INFINITE RECURSION.
   * I DID NOT TRY THOUGH. (^_^)?
   */
  sellerTypeEffect: EffectRef = effect(
    () => {
      if (this.sellerType() === 'within-group') {
        while (this.sellerForms.length > 1)
          this.onRemoveSeller(this.sellerForms.length - 1);
        this.addSellerBtnVisible.set(false);
      } else {
        this.addSellerBtnVisible.set(true);
      }
    },
    {
      allowSignalWrites: true,
    }
  );

  mortgagedData: WritableSignal<MortgageData[]> = signal([]);
  partlySoldData: WritableSignal<PartlySoldData[]> = signal([]);

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
    return this.purQty - this.partlySoldQty - this.mortgagedQty;
  }

  /**
   * Calculates the total quantity sold by summing up the quantities of all partly sold data
   * and subtracting the quantity entered in the partly sold details form.
   *
   * @return {number} The total quantity sold.
   */
  get partlySoldQty(): number {
    return this.partlySoldData().reduce((accumulator: number, current: any) => {
      return accumulator + (parseFloat(current.qty) || 0);
    }, 0);
  }

  /**
   * Calculates the total mortgaged quantity by summing up the mortgaged quantities of all mortgaged data.
   *
   * @return {number} The total mortgaged quantity.
   */
  get mortgagedQty(): number {
    return this.mortgagedData().reduce((accumulator: number, current: any) => {
      return accumulator + (parseFloat(current.mortQty) || 0);
    }, 0);
  }

  readonly selectedGroup: WritableSignal<Group> = signal({
    groupId: '',
    groupName: '',
    state: '',
    city: '',
    pincode: NaN,
  });

  readonly groupList: WritableSignal<Group[]> = signal([]);

  setGroupList(): void {
    this.sysIsBusy.set(true);
    this.groupMasterService.getGroupList().subscribe({
      next: (data) => {
        this.groupList.set(data);
      },
      error: () => {
        this.serverUnreachable.set(true);
      },
      complete: () => {
        this.sysIsBusy.set(false);
      },
    });
  }

  onGroupChange(): void {
    const group = this.groupList().find(
      (data) => data.groupId === this.form['groupId'].value
    );
    if (group) {
      group.state = this.getStateName(group.state);
      this.selectedGroup.set(group);
    } else
      this.selectedGroup.set({
        groupId: '',
        groupName: '',
        state: '',
        city: '',
        pincode: NaN,
      });
  }

  readonly selectedMouza: WritableSignal<Mouza> = signal({
    mouzaId: '',
    groupId: '',
    mouza: '',
    block: '',
    jlno: NaN,
    oldRsDag: '',
    newLrDag: '',
    oldKhatian: '',
    newKhatian: '',
    currKhatian: '',
  });

  readonly mouzaList: WritableSignal<Mouza[]> = signal([]);

  // TODO: need to get mouza by groupId also low priority
  setMouzaList(): void {
    this.sysIsBusy.set(true);
    this.mouzaMasterService.getMouzaList().subscribe({
      next: (data) => {
        this.mouzaList.set(data);
      },
      error: () => {
        this.serverUnreachable.set(true);
      },
      complete: () => {
        this.sysIsBusy.set(false);
      },
    });
  }

  onMouzaChange(): void {
    const mouza = this.mouzaList().find(
      (data) => data.mouzaId === this.form['mouzaId'].value
    );
    if (mouza) {
      this.selectedMouza.set(mouza);
    } else
      this.selectedMouza.set({
        mouzaId: '',
        groupId: '',
        mouza: '',
        block: '',
        jlno: NaN,
        oldRsDag: '',
        newLrDag: '',
        oldKhatian: '',
        newKhatian: '',
        currKhatian: '',
      });
  }

  readonly companyList: WritableSignal<Company[]> = signal<Company[]>([]);

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

  /**
   * Returns the name of the given groupId from groupList.
   * If the id is not found, the given id is returned as is.
   * @param groupId the group id to find the name for
   * @returns the name of the given group id or the id itself if not found
   */
  getGroupName(groupId: string): string {
    return (
      this.groupList().find((group) => group.groupId === groupId)?.groupName ||
      groupId
    );
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
   * Adds a new seller form control to the sellerForms array.
   *
   * @return {void} No return value.
   */
  onAddSeller(value: string = ''): void {
    this.sellerForms.push(this.fb.control(value, Validators.required));
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

  onSellerTypeChange(): void {
    this.sellerType.set(this.form['sellerType'].value);
  }

  /**
   * Returns the prepared form data.
   *
   * @return {Object} The prepared form data.
   */
  get preparedForm(): Object {
    const data = this.newLandRecordForm.value;

    data.deedDate = this.formatDateForBackend(data.deedDate);
    data.dueDate = this.formatDateForBackend(data.dueDate);
    data.ledueDate = this.formatDateForBackend(data.ledueDate);
    data.lelastDate = this.formatDateForBackend(data.lelastDate);

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
   * Adds a new mortgaged record to the mortgagedData array.
   *
   * @returns void
   */
  onAddMortgaged(): void {
    const dialogRef = this.dialog.open<MortgageData>(
      DialogMortgageFormComponent,
      {
        maxWidth: '25rem',
        backdropClass: 'light-blur-backdrop',
        disableClose: true,
        data: {
          remainingQty: this.remainingQty,
          purQty: this.purQty,
        },
      }
    );

    dialogRef.backdropClick.subscribe(() => {
      if (
        window.confirm(
          '⚠  CAUTION: ALL CHANGES WILL BE LOST!\n\nDo you really want to leave?'
        )
      )
        dialogRef.close();
    });

    dialogRef.closed.subscribe((res: MortgageData | undefined) => {
      if (res)
        this.mortgagedData.set([
          ...this.mortgagedData(),
          {
            ...res,
            mortDate: this.formatDateForBackend(res.mortDate),
            mortDateStr: new Date(res.mortDate).toLocaleDateString(),
          },
        ]);
    });
  }

  /**
   * Adds a new partly sold record to the partlySoldData array if the form is valid.
   *
   * @return {void} This function does not return anything.
   */
  onAddPartlySold(): void {
    const dialogRef = this.dialog.open<PartlySoldData>(
      DialogPartlySoldFormComponent,
      {
        maxWidth: '25rem',
        backdropClass: 'light-blur-backdrop',
        disableClose: true,
        data: {
          remainingQty: this.remainingQty,
          purQty: this.purQty,
        },
      }
    );

    dialogRef.backdropClick.subscribe(() => {
      if (
        window.confirm(
          '⚠ CAUTION: ALL CHANGES WILL BE LOST!\n\nDo you really want to leave?'
        )
      )
        dialogRef.close();
    });

    dialogRef.closed.subscribe((res: PartlySoldData | undefined) => {
      if (res)
        this.partlySoldData.set([
          ...this.partlySoldData(),
          {
            ...res,
            date: this.formatDateForBackend(res.date),
            dateStr: new Date(res.date).toLocaleDateString(),
          },
        ]);
    });
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
    const dialogRef = this.dialog.open<MortgageData>(
      DialogMortgageFormComponent,
      {
        maxWidth: '25rem',
        backdropClass: 'light-blur-backdrop',
        disableClose: true,
        data: {
          data: this.mortgagedData()[idx],
          remainingQty: this.remainingQty,
          purQty: this.purQty,
        },
      }
    );

    dialogRef.backdropClick.subscribe(() => {
      if (
        window.confirm(
          '⚠ CAUTION: ALL CHANGES WILL BE LOST!\n\nDo you really want to leave?'
        )
      )
        dialogRef.close();
    });

    dialogRef.closed.subscribe((res: MortgageData | undefined) => {
      const newMortgagedData: MortgageData[] = this.mortgagedData();
      if (res)
        newMortgagedData[idx] = {
          ...res,
          mortDate: this.formatDateForBackend(res.mortDate),
          mortDateStr: new Date(res.mortDate).toLocaleDateString(),
        };
      this.mortgagedData.set([...newMortgagedData]);
    });
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
    const dialogRef = this.dialog.open<PartlySoldData>(
      DialogPartlySoldFormComponent,
      {
        maxWidth: '25rem',
        backdropClass: 'light-blur-backdrop',
        disableClose: true,
        data: {
          data: this.partlySoldData()[idx],
          remainingQty: this.remainingQty,
          purQty: this.purQty,
        },
      }
    );

    dialogRef.backdropClick.subscribe(() => {
      if (
        window.confirm(
          '⚠ CAUTION: ALL CHANGES WILL BE LOST!\n\nDo you really want to leave?'
        )
      )
        dialogRef.close();
    });

    dialogRef.closed.subscribe((res: PartlySoldData | undefined) => {
      const newPartlySoldData: PartlySoldData[] = this.partlySoldData();
      if (res)
        newPartlySoldData[idx] = {
          ...res,
          date: this.formatDateForBackend(res.date),
          dateStr: new Date(res.date).toLocaleDateString(),
        };
      this.partlySoldData.set([...newPartlySoldData]);
    });
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
    this.onAddSeller();
    this.setGroupList();
    this.setMouzaList();
    this.setCompanyList();

    this.route.url.subscribe((data) => {
      this.updateMode.set(data[0].path == 'update');
      this.viewMode.set(data[0].path == 'view');
      if (this.updateMode() || this.viewMode()) {
        if (this.viewMode()) {
          this.partlySoldDisplayedColumns.pop();
          this.mortgagedDisplayedColumns.pop();
        }
        this.route.params.subscribe((data) => {
          this.id = data['id'];
          this.landRecordsService.getLandRecord(this.id).subscribe((data) => {
            console.log(data);
            this.newLandRecordForm.patchValue(data);
            this.mortgagedData.set(
              data['mortgagedData'].map((data: MortgageData): MortgageData => {
                return {
                  ...data,
                  mortDateStr: new Date(data.mortDate).toLocaleDateString(),
                };
              })
            );
            this.partlySoldData.set(
              data['partlySoldData'].map(
                (data: PartlySoldData): PartlySoldData => {
                  return {
                    ...data,
                    dateStr: new Date(data.date).toLocaleDateString(),
                  };
                }
              )
            );
            this.newLandRecordForm.patchValue({
              deedDate: this.getDateFromString(data['deedDate']),
              dueDate: this.getDateFromString(data['dueDate']),
              ledueDate: this.getDateFromString(data['ledueDate']),
              lelastDate: this.getDateFromString(data['lelastDate']),
            });
            //seller ?
            this.sellerFormControls.pop();
            data.sellers.forEach((seller: string) => {
              this.onAddSeller(seller);
            });
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
            if (data.parchaFile) {
              data.parchaFile.forEach((fileName: string) => {
                this.oldFileInfoArray.parchaFile.push({
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
        this.newLandRecordForm.controls['groupId'].disable();
        this.newLandRecordForm.controls['mouzaId'].disable();
        this.newLandRecordForm.controls['companyId'].disable();
        this.newLandRecordForm.controls['deedName'].disable();
        this.newLandRecordForm.controls['landStatus'].disable();
        this.newLandRecordForm.controls['conversionLandStus'].disable();
        this.newLandRecordForm.controls['mortgaged'].disable();
        this.newLandRecordForm.controls['partlySold'].disable();
        this.newLandRecordForm.controls['landType'].disable();
      }
    });
  }

  ngOnDestroy(): void {
    this.sellerTypeEffect.destroy();
  }
}
