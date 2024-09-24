import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  Component,
  effect,
  EffectRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { DeedMasterService } from '../../services/deed-master.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Deed, DeedMouza } from '../../../../model/deed.model';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { FileUploadService } from '../../../../services/file-upload.service';
import { MatListModule } from '@angular/material/list';
import { MortgageData } from '../../../../model/mortgage-data.model';
import { PartlySoldData } from '../../../../model/partly-sold-data.model';
import { DialogMortgageFormComponent } from './modal/mortgage-form/mortgage-form.dialog';
import { DialogPartlySoldFormComponent } from './modal/partly-sold-form/partly-sold-form.dialog';
import { Dialog } from '@angular/cdk/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GroupMasterService } from '../../services/group-master.service';
import { MouzaMasterService } from '../../services/mouza-master.service';
import { Group } from '../../../../model/group.model';
import { Mouza } from '../../../../model/mouza.model';
import { statesCollection } from '../../../../data/states.collection';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, Observable } from 'rxjs';
import { AreaMapSafePipe } from './pipe/area-map-safe.pipe';
import { SellerType } from '../../../../model/seller-type.model';
import { CompanyMasterService } from '../../services/company-master.service';
import { Company } from '../../../../model/company.model';

@Component({
  selector: 'app-deed-master',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatListModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatTooltipModule,
    AreaMapSafePipe,
  ],
  templateUrl: './deed-master.component.html',
  styleUrl: './deed-master.component.scss',
})
export class DeedMasterComponent implements OnInit, OnDestroy {
  private readonly groupMasterService: GroupMasterService =
    inject(GroupMasterService);
  private readonly companyMasterService: CompanyMasterService =
    inject(CompanyMasterService);
  private readonly mouzaMasterService: MouzaMasterService =
    inject(MouzaMasterService);
  private readonly deedMasterService: DeedMasterService =
    inject(DeedMasterService);
  private readonly fileUploadService: FileUploadService =
    inject(FileUploadService);

  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly dialog: Dialog = inject(Dialog);

  readonly groupList: WritableSignal<Group[]> = signal([]);
  readonly companyList: WritableSignal<Company[]> = signal([]);
  readonly mouzaList: WritableSignal<Mouza[]> = signal([]);

  readonly deedList: WritableSignal<Deed[]> = signal([]);
  readonly listMode: WritableSignal<boolean> = signal(true);
  readonly updateMode: WritableSignal<boolean> = signal(false);
  readonly areaMapGridView: WritableSignal<boolean> = signal(false);
  readonly areaMapExistingFileUrls: WritableSignal<
    { url: string; type: string }[]
  > = signal([]);
  readonly areaMapNewFileUrls: WritableSignal<{ url: string; type: string }[]> =
    signal([]);

  readonly viewMode: WritableSignal<boolean> = signal(false);
  readonly viewModeEffectRef: EffectRef = effect(() => {
    if (this.viewMode()) {
      this.deedForm.controls['groupId'].disable();
      this.deedForm.controls['landStatus'].disable();
      this.deedForm.controls['conversionLandStatus'].disable();
      this.deedForm.controls['mortgaged'].disable();
      this.deedForm.controls['partlySold'].disable();
      this.deedForm.controls['sellerType'].disable();
      this.deedForm.controls['companyId'].disable();
      for (const mouzaDataItem of this.mouzaData()) {
        mouzaDataItem.mouzaForm.disable();
        mouzaDataItem.landSpecifics.forEach((landSpecifics) => {
          landSpecifics.disable();
        });
      }
    } else {
      for (const mouzaDataItem of this.mouzaData()) {
        this.deedForm.controls['groupId'].enable();
        this.deedForm.controls['landStatus'].enable();
        this.deedForm.controls['conversionLandStatus'].enable();
        this.deedForm.controls['mortgaged'].enable();
        this.deedForm.controls['partlySold'].enable();
        this.deedForm.controls['sellerType'].enable();
        this.deedForm.controls['companyId'].enable();
        mouzaDataItem.mouzaForm.enable();
        mouzaDataItem.landSpecifics.forEach((landSpecifics) => {
          landSpecifics.enable();
        });
      }
    }
  });

  readonly id: WritableSignal<string> = signal('');

  readonly selectedGroup: WritableSignal<Group> = signal({
    groupId: '',
    groupName: '',
    state: '',
    city: '',
    pincode: NaN,
  });

  readonly mouzaData: WritableSignal<
    {
      mouzaForm: FormGroup;
      selectedMouza: Mouza;
      landSpecifics: FormGroup[];
    }[]
  > = signal([]);

  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  readonly showGroupDetails: WritableSignal<boolean> = signal(false);

  readonly deedForm: FormGroup<any> = this.fb.group({
    deedId: [''],
    groupId: ['', Validators.required],
    companyId: ['', Validators.required],
    deedNo: ['', Validators.required],
    deedDate: ['', Validators.required],
    sellerType: ['within-group', Validators.required],
    sellers: this.fb.array([]),
    totalQty: [NaN, Validators.required],
    purQty: [NaN, Validators.required],
    mutedQty: [NaN, Validators.required],
    unMutedQty: [NaN, Validators.required],
    landStatus: ['', Validators.required],
    conversionLandStatus: ['', Validators.required],
    deedLoc: ['', Validators.required],
    photoLoc: ['', Validators.required],
    govtRec: ['', Validators.required],
    remarks: ['', Validators.required],
    khazanaStatus: ['', Validators.required],
    tax: [NaN, Validators.required],
    taxDueDate: ['', Validators.required],
    lastUpDate: ['', Validators.required],
    legalMatters: ['', Validators.required],
    ledueDate: ['', Validators.required],
    lelastDate: ['', Validators.required],
    leDescription: ['', Validators.required],
    mortgaged: [false],
    partlySold: [false],
  });

  mortgagedData: WritableSignal<MortgageData[]> = signal([]);
  partlySoldData: WritableSignal<PartlySoldData[]> = signal([]);
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

  readonly displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'deedId',
    'deedName',
    'panNumber',
    'deedAddress',
    'action',
  ]);

  readonly mortgagedDisplayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'party',
    'mortQty',
    'mortDateStr',
    'actions',
  ]);

  readonly partlySoldDisplayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'sale',
    'dateStr',
    'qty',
    'deedLink',
    'actions',
  ]);

  get form() {
    return this.deedForm.controls;
  }

  get formData(): Deed {
    return this.deedForm.value;
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

  /**
   * Returns the prepared form data.
   *
   * @return {Object} The prepared form data.
   */
  get preparedFormData(): Deed {
    const data: Deed = this.formData;

    data.deedDate = this.formatDateForBackend(data.deedDate);
    data.ledueDate = this.formatDateForBackend(data.ledueDate);
    data.lelastDate = this.formatDateForBackend(data.lelastDate);
    data.taxDueDate = this.formatDateForBackend(data.taxDueDate);
    data.lastUpDate = this.formatDateForBackend(data.lastUpDate);

    data.mouza = this.mouzaData().map((mouzaItem) => {
      return {
        mouzaId: mouzaItem.mouzaForm.value.mouzaId,
        landSpecifics: mouzaItem.landSpecifics.map((landSpecificsItem) => {
          return landSpecificsItem.value;
        }),
      };
    });

    if (data.mortgaged) data.mortgagedData = this.mortgagedData();
    else data.mortgaged = false;

    if (data.partlySold) data.partlySoldData = this.partlySoldData();
    else data.partlySold = false;

    return data;
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

  onSubmit() {
    console.log('on form submit: ', this.deedForm.value);
    const formData = this.preparedFormData;
    if (this.runFormValidation()) {
      this.sysIsBusy.set(true);
      if (this.updateMode()) {
        //update master
        this.deedMasterService.updateDeed(
          this.id(),
          formData,
          this.fileObj,
          this.fileInfoArray,
          this.oldFileInfoArray,
          {
            next: (data: Partial<Deed>) => {
              this.deedList.set(
                this.deedList().map((deed) => {
                  if (deed.deedId === this.id()) {
                    return data;
                  }
                  return deed;
                }) as Deed[]
              );
              this.onListDeed();
            },
            error: () => {
              console.error('error bro error');
            },
            complete: () => {
              this.sysIsBusy.set(false);
            },
          }
        );
      } else {
        // new master
        this.deedMasterService.newDeed(
          formData,
          this.fileObj,
          this.fileInfoArray,
          {
            next: (data: Partial<Deed>) => {
              this.deedList.set([{ ...data } as Deed, ...this.deedList()]);
              this.onListDeed();
            },
            error: () => {
              console.error('error bro error');
            },
            complete: () => {
              this.sysIsBusy.set(false);
            },
          }
        );
      }
    }
  }

  runFormValidation(): boolean {
    let alertMsg: string = '';
    if (this.remainingQty < 0) {
      alertMsg += '\nRemaining asset quantity cannot be less than zero.';
    }
    for (const controlName in this.form) {
      if (this.form[controlName].invalid) {
        alertMsg += '\n Field ' + controlName + ' is invalid.';
      }
    }
    const mouzaData = this.mouzaData();
    if (!mouzaData.length) {
      alertMsg += '\n Mouza details must have atleast 1 row of data.';
    }

    for (let i = 0; i < mouzaData.length; i++) {
      const mouzaDataItem = mouzaData[i];
      const landSpecificsArr = mouzaDataItem.landSpecifics;

      if (mouzaDataItem.mouzaForm.controls['mouzaId'].invalid)
        alertMsg += `\n Mouza ID field of mouza details  ${i + 1} is invalid.`;

      if (!landSpecificsArr.length)
        alertMsg += `\n Land Specifics must have atleast 1 row of data in mouza details ${
          i + 1
        }.`;

      for (let j = 0; j < landSpecificsArr.length; j++) {
        const landSpecifics = landSpecificsArr[j];
        for (const controlName in landSpecifics.controls) {
          if (controlName === 'qty') {
            if (landSpecifics.value.qty < 1)
              alertMsg += `\n Value of field ${controlName} on row ${
                j + 1
              } of Land Specifics in mouza details ${
                i + 1
              } can not be less than 1.`;
            else if (landSpecifics.value.qty > landSpecifics.value.maxQty) {
              alertMsg += `\n Value of field ${controlName} on row ${
                j + 1
              } of Land Specifics in mouza details ${
                i + 1
              } can not be more than maxQty.`;
            }
          } else if (landSpecifics.controls[controlName].invalid) {
            alertMsg += `\n Field ${controlName} on row ${
              j + 1
            } of Land Specifics in mouza details ${i + 1} is invalid.`;
          }
        }
      }
    }
    if (alertMsg.length) {
      alert('⛔ ERROR: CAN NOT SUBMIT\n' + alertMsg);
      return false;
    }
    return true;
  }

  onAddMouza(): void {
    this.mouzaData.update((data) => {
      data.push({
        mouzaForm: this.fb.group({
          mouzaId: ['', Validators.required],
        }),
        selectedMouza: {
          mouzaId: '',
          groupId: '',
          mouza: '',
          block: '',
          jlno: NaN,
          landSpecifics: [],
        },
        landSpecifics: [
          this.fb.group({
            oldRsDag: ['', Validators.required],
            newLrDag: ['', Validators.required],
            maxQty: [NaN, Validators.required],
            landType: ['', Validators.required],
            qty: [NaN, Validators.required],
          }),
        ],
      });
      return data;
    });
  }

  setDeedList(): void {
    this.sysIsBusy.set(true);
    this.deedMasterService.getDeedList().subscribe({
      next: (data) => {
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

  setGroupList(): void {
    this.sysIsBusy.set(true);
    this.groupMasterService.getGroupList().subscribe({
      next: (data) => {
        this.groupList.set(data);
        this.onGroupChange();
      },
      error: () => {
        this.serverUnreachable.set(true);
      },
      complete: () => {
        this.sysIsBusy.set(false);
      },
    });
  }

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

  setMouzaList(): void {
    this.sysIsBusy.set(true);
    this.mouzaMasterService.getMouzaList().subscribe({
      next: (data) => {
        this.mouzaList.set(data);
        this.onMouzaChange();
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
   * Updates the selectedGroup property with the group data from groupList that matches
   * the groupId in the form. If no group is found, selectedGroup is set to an empty object.
   * @returns void
   */
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

  /**
   * Updates the selectedMouza property of the mouza at the given index in mouzaData.
   * If idx is undefined, null or negative, all mouza in mouzaData are updated.
   * @param idx the index of the mouza in mouzaData to update
   * @returns void
   */
  onMouzaChange(idx?: number): void {
    if (idx == undefined || idx == null || idx < 0) {
      for (let i = 0; i < this.mouzaData().length; i++) {
        this.mouzaChangeHelper(i);
      }
    } else {
      this.mouzaChangeHelper(idx);
    }
  }

  /**
   * Helper function to set the selectedMouza property of the mouza at the given index in mouzaData.
   * If the mouza is not found in mouzaList, it sets selectedMouza to a default mouza object.
   * @param idx the index of the mouza in mouzaData to update
   * @returns void
   */
  mouzaChangeHelper(idx: number): void {
    const mouza = this.mouzaList().find(
      (data) =>
        data.mouzaId ===
        this.mouzaData()[idx].mouzaForm.controls['mouzaId'].value
    );

    if (mouza) {
      this.mouzaData.update((data) => {
        data[idx].selectedMouza = mouza;
        return data;
      });
    } else {
      this.mouzaData.update((data) => {
        data[idx].selectedMouza = {
          mouzaId: '',
          groupId: '',
          mouza: '',
          block: '',
          jlno: NaN,
          landSpecifics: [],
        };
        return data;
      });
    }
  }

  /**
   * Adds a new land specific form to the land specifics list of the mouza data at the given index.
   * @param {number} idx - The index of the mouza data to add the land specific to.
   * @returns {void} No return value.
   */
  onAddLandSpecifics(idx: number): void {
    this.mouzaData.update((data) => {
      data[idx].landSpecifics.push(
        this.fb.group({
          oldRsDag: ['', Validators.required],
          newLrDag: ['', Validators.required],
          maxQty: [NaN, Validators.required],
          landType: ['', Validators.required],
          qty: [NaN, Validators.required],
        })
      );
      return data;
    });
  }

  /**
   * Removes the land specific at the specified index from the land specifics list.
   *
   * @param {number} idx - The index of the mouza data to remove the land specific from.
   * @param {number} landSpecificsIndex - The index of the land specific to remove.
   * @returns {void} No return value.
   */
  onRemoveLandSpecifics(idx: number, landSpecificsIndex: number): void {
    this.mouzaData.update((data) => {
      data[idx].landSpecifics.splice(landSpecificsIndex, 1);
      return data;
    });
  }

  /**
   * Updates the land specific form values with the corresponding values from the land specifics in the selected mouza.
   * @param {number} idx - The index of the mouza data to update the land specific form values for.
   * @param {number} landSpecificsIndex - The index of the land specific form to update the values for.
   * @returns {void} No return value.
   */
  onChangeOldRsDag(idx: number, landSpecificsIndex: number): void {
    const data = this.mouzaData();
    const fieldVal =
      data[idx].landSpecifics[landSpecificsIndex].controls['oldRsDag'].value;
    const allLandSpecifics = data[idx].selectedMouza.landSpecifics;
    for (const landSpecifics of allLandSpecifics) {
      if (fieldVal === landSpecifics.oldRsDag) {
        data[idx].landSpecifics[landSpecificsIndex].patchValue({
          newLrDag: landSpecifics.newLrDag,
          maxQty: landSpecifics.maxQty,
          landType: landSpecifics.landType,
        });
        break;
      }
    }
    this.mouzaData.set(data);
  }

  /**
   * Updates the land specific form values with the corresponding values from the land specifics in the selected mouza.
   * @param {number} idx - The index of the mouza data to update the land specific form values for.
   * @param {number} landSpecificsIndex - The index of the land specific form to update the values for.
   * @returns {void} No return value.
   */
  onChangeNewLrDag(idx: number, landSpecificsIndex: number): void {
    const data = this.mouzaData();
    const fieldVal =
      data[idx].landSpecifics[landSpecificsIndex].controls['newLrDag'].value;
    const allLandSpecifics = data[idx].selectedMouza.landSpecifics;
    for (const landSpecifics of allLandSpecifics) {
      if (fieldVal === landSpecifics.newLrDag) {
        data[idx].landSpecifics[landSpecificsIndex].patchValue({
          oldRsDag: landSpecifics.oldRsDag,
          maxQty: landSpecifics.maxQty,
          landType: landSpecifics.landType,
        });
        break;
      }
    }
    this.mouzaData.set(data);
  }

  onNewDeed(): void {
    this.router.navigate(['master', 'deed', 'new']);
    this.areaMapGridView.set(false);
    this.formResetHelper();
    this.listMode.set(false);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
  }

  onUpdateDeed(deedId: string) {
    console.log('deed id', deedId);
    this.router.navigate(['master', 'deed', 'update', deedId]);
    this.updateMode.set(true);
    this.viewMode.set(false);

    this.deedForm.controls['deedId'].disable();

    this.deedFormPatchValueOptimized(deedId);
    this.listMode.set(false);
  }

  onViewDeed(deedId: string): void {
    this.router.navigate(['master', 'deed', 'view', deedId]);
    this.updateMode.set(false);
    this.viewMode.set(true);

    this.deedForm.controls['deedId'].disable();

    this.deedFormPatchValueOptimized(deedId);
    this.listMode.set(false);
  }

  deedFormPatchValueOptimized(deedId: string): void {
    this.formResetHelper();
    this.areaMapGridView.set(false);

    this.id.set(deedId);
    this.sysIsBusy.set(true);

    const deed: Deed | undefined = this.deedList().find(
      (c) => c.deedId === deedId
    );

    if (deed) {
      this.formPatchHelper(deed);
    } else {
      this.deedMasterService.getDeed(deedId).subscribe({
        next: (data) => {
          this.formPatchHelper(data);
        },
        error: () => {
          this.serverUnreachable.set(true);
        },
        complete: () => {
          this.sysIsBusy.set(false);
        },
      });
    }

    this.sysIsBusy.set(false);
  }

  formResetHelper(): void {
    this.deedForm.reset();
    this.showGroupDetails.set(false);
    this.mouzaData.set([]);
    this.sellerForms.clear();
    this.onAddSeller();
    this.deedForm.patchValue({
      sellerType: 'within-group',
      mortgaged: false,
      partlySold: false,
    });
    this.onAddMouza();
    this.oldFileInfoArray.scanCopyFile = [];
    this.oldFileInfoArray.mutationFile = [];
    this.oldFileInfoArray.conversionFile = [];
    this.oldFileInfoArray.documentFile = [];
    this.oldFileInfoArray.vestedFile = [];
    this.oldFileInfoArray.areaMapFile = [];
    this.oldFileInfoArray.parchaFile = [];
    this.destroyAreaMapObjs();
    this.areaMapExistingFileUrls.set([]);
    this.areaMapNewFileUrls.set([]);
  }

  formPatchHelper(deed: Partial<Deed>): void {
    let i = deed.sellers?.length || 1;
    if (i > 0) while (--i) this.onAddSeller();
    //Careful

    this.deedForm.patchValue(deed);
    this.deedForm.patchValue({
      deedDate: this.getDateFromString(deed.deedDate!),
      taxDueDate: this.getDateFromString(deed.taxDueDate!),
      lastUpDate: this.getDateFromString(deed.lastUpDate!),
      ledueDate: this.getDateFromString(deed.ledueDate!),
      lelastDate: this.getDateFromString(deed.lelastDate!),
    });

    const deedMouzaArr: DeedMouza[] = deed.mouza || [];
    const mouzaDataArr: {
      mouzaForm: FormGroup;
      selectedMouza: Mouza;
      landSpecifics: FormGroup[];
    }[] = [];

    for (let i = 0; i < deedMouzaArr.length; i++) {
      const deedMouza = deedMouzaArr[i];
      mouzaDataArr.push({
        mouzaForm: this.fb.group({
          mouzaId: [deedMouza.mouzaId, Validators.required],
        }),
        selectedMouza: {
          mouzaId: '',
          groupId: '',
          mouza: '',
          block: '',
          jlno: NaN,
          landSpecifics: [],
        },
        landSpecifics: deedMouza.landSpecifics.map((lsd) =>
          this.fb.group({
            oldRsDag: [lsd.oldRsDag, Validators.required],
            newLrDag: [lsd.newLrDag, Validators.required],
            maxQty: [lsd.maxQty, Validators.required],
            landType: [lsd.landType, Validators.required],
            qty: [lsd.qty, Validators.required],
          })
        ),
      });
    }

    this.mouzaData.set(mouzaDataArr);

    if (deed.scanCopyFile) {
      deed.scanCopyFile.forEach((fileName: string) => {
        this.oldFileInfoArray.scanCopyFile.push({
          fileName,
          markedForDeletion: false,
        });
      });
    }
    if (deed.mutationFile) {
      deed.mutationFile.forEach((fileName: string) => {
        this.oldFileInfoArray.mutationFile.push({
          fileName,
          markedForDeletion: false,
        });
      });
    }
    if (deed.conversionFile) {
      deed.conversionFile.forEach((fileName: string) => {
        this.oldFileInfoArray.conversionFile.push({
          fileName,
          markedForDeletion: false,
        });
      });
    }
    if (deed.documentFile) {
      deed.documentFile.forEach((fileName: string) => {
        this.oldFileInfoArray.documentFile.push({
          fileName,
          markedForDeletion: false,
        });
      });
    }
    if (deed.vestedFile) {
      deed.vestedFile.forEach((fileName: string) => {
        this.oldFileInfoArray.vestedFile.push({
          fileName,
          markedForDeletion: false,
        });
      });
    }
    if (deed.areaMapFile) {
      deed.areaMapFile.forEach((fileName: string) => {
        this.oldFileInfoArray.areaMapFile.push({
          fileName,
          markedForDeletion: false,
        });
      });
    }
    if (deed.parchaFile) {
      deed.parchaFile.forEach((fileName: string) => {
        this.oldFileInfoArray.parchaFile.push({
          fileName,
          markedForDeletion: false,
        });
      });
    }

    this.onGroupChange();
    this.onMouzaChange();
    this.areaMapOldFileUrlsInit();
  }

  onListDeed() {
    this.router.navigate(['master', 'deed']);
    this.listMode.set(true);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
  }

  onDeleteDeed(deedId: string) {
    if (
      window.confirm(
        '⚠ CAUTION: ACTION CANNOT BE UNDONE!\n\nDo you really want to delete this deed master?'
      )
    ) {
      this.sysIsBusy.set(true);
      this.deedMasterService.deleteDeed(deedId).subscribe({
        next: () => {
          this.deedList.set(
            this.deedList().filter((deed) => deed.deedId !== deedId)
          );
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            alert('⛔ ERROR: CAN NOT DELETE\n\nDeed not found.');
          } else {
            alert(
              '⛔ ERROR: CAN NOT DELETE\n\nFailed to delete deed. Please try again.'
            );
          }
        },
        complete: () => {
          this.sysIsBusy.set(false);
        },
      });
    }
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

  disableFileRemoval: WritableSignal<boolean> = signal(false);
  fileInfoArray: any = {
    scanCopyFile: [],
    mutationFile: [],
    conversionFile: [],
    documentFile: [],
    hcdocumentFile: [],
    vestedFile: [],
    areaMapFile: [],
    parchaFile: [],
  };

  fileObj: any = {
    scanCopyFileRAW: [],
    mutationFileRAW: [],
    conversionFileRAW: [],
    documentFileRAW: [],
    hcdocumentFileRAW: [],
    vestedFileRAW: [],
    areaMapFileRAW: [],
    parchaFileRAW: [],
  };

  oldFileInfoArray: any = {
    scanCopyFile: [],
    mutationFile: [],
    conversionFile: [],
    documentFile: [],
    hcdocumentFile: [],
    vestedFile: [],
    areaMapFile: [],
    parchaFile: [],
  };

  /**
   * Opens a new window to display the specified file from the attachments directory.
   *
   * @param {string} fieldName - The name of the field containing the file.
   * @param {string} fileName - The name of the file to display.
   * @return {void} This function does not return anything.
   */
  onWindowPopupOpenForFiles(fieldName: string, fileName: string): void {
    this.sysIsBusy.set(true);
    this.fileUploadService
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

  readonly retryAreaMapFileLoad: WritableSignal<boolean> = signal(false);
  areaMapOldFileUrlsInit(): void {
    const tempObsArr: Observable<Blob>[] = [];

    this.oldFileInfoArray.areaMapFile.forEach(
      (fileInfo: { fileName: string; markedForDeletion: boolean }) => {
        tempObsArr.push(
          this.fileUploadService.getFile('areaMapFile', fileInfo.fileName)
        );
      }
    );

    forkJoin(tempObsArr).subscribe({
      next: (blobArr: Blob[]) => {
        this.retryAreaMapFileLoad.set(false);

        const tempUrlArr: { url: string; type: string }[] = [];
        blobArr.forEach((blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          tempUrlArr.push({ url, type: blob.type });
        });
        this.areaMapExistingFileUrls.set(tempUrlArr);
      },
      error: (err) => {
        this.retryAreaMapFileLoad.set(true);
        console.log(err);
      },
    });
  }

  destroyAreaMapObjs(): void {
    this.areaMapExistingFileUrls().forEach(
      (item: { url: string; type: string }) => {
        window.URL.revokeObjectURL(item.url);
      }
    );
  }

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
    // TODO: add area map logic also add remove logic in removal fn
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

  ngOnInit(): void {
    this.setGroupList();
    this.setCompanyList();
    this.setMouzaList();
    this.setDeedList();

    if (this.route.children[0]) {
      this.route.children[0].url.subscribe((data) => {
        if (data[0].path) {
          if (data[0].path === 'update') {
            this.onUpdateDeed(data[1].path);
          } else if (data[0].path === 'new') {
            this.onNewDeed();
          } else if (data[0].path === 'view') {
            this.onViewDeed(data[1].path);
          } else {
            this.onListDeed();
          }
        }
      });
    } else {
      this.onListDeed();
    }

    this.deedForm.controls['deedId'].disable();
  }
  // TODO: if we click on nav item while in new or update etc. i need to go back to list mode. but its not happening
  // I think i need to make my own framework and ditch angular huh!!!!!!!!!!!!

  ngOnDestroy(): void {
    this.viewModeEffectRef.destroy();
    this.sellerTypeEffect.destroy();
    this.destroyAreaMapObjs();
  }
}
