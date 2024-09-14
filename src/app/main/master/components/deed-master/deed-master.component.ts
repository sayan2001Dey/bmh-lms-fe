import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { DeedMasterService } from '../../services/deed-master.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Deed } from '../../../../model/deed.model';
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
  ],
  templateUrl: './deed-master.component.html',
  styleUrl: './deed-master.component.scss',
})
export class DeedMasterComponent implements OnInit {
  private readonly deedMasterService: DeedMasterService =
    inject(DeedMasterService);
  private readonly fileUploadService: FileUploadService =
    inject(FileUploadService);

  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly dialog: Dialog = inject(Dialog);

  readonly deedList: WritableSignal<Deed[]> = signal([]);
  readonly listMode: WritableSignal<boolean> = signal(true);
  readonly updateMode: WritableSignal<boolean> = signal(false);
  readonly viewMode: WritableSignal<boolean> = signal(false);
  readonly id: WritableSignal<string> = signal('');

  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);

  readonly deedForm: FormGroup<any> = this.fb.group({
    deedId: [''],
    deedNo: ['', Validators.required],
    deedDate: ['', Validators.required],
    totalQty: [NaN, Validators.required],
    purQty: [NaN, Validators.required],
    mutedQty: [NaN, Validators.required],
    unMutedQty: [NaN, Validators.required],
    landStatus: ['', Validators.required],
    landType: ['', Validators.required],
    conversionLandStatus: ['', Validators.required],
    deedLoc: ['', Validators.required],
    photoLoc: ['', Validators.required],
    govtRec: ['', Validators.required],
    remarks: ['', Validators.required],
    khazanaStatus: ['', Validators.required],
    tax: [NaN, Validators.required],
    dueDate: ['', Validators.required],
    legalMatters: ['', Validators.required],
    ledueDate: ['', Validators.required],
    lelastDate: ['', Validators.required],
    mortgaged: [false],
    partlySold: [false],
  });

  mortgagedData: WritableSignal<MortgageData[]> = signal([]);
  partlySoldData: WritableSignal<PartlySoldData[]> = signal([]);

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
    const data = this.formData;

    data.deedDate = this.formatDateForBackend(data.deedDate);
    data.dueDate = this.formatDateForBackend(data.dueDate);
    data.ledueDate = this.formatDateForBackend(data.ledueDate);
    data.lelastDate = this.formatDateForBackend(data.lelastDate);

    if (data.mortgaged) data.mortgagedData = this.mortgagedData();
    else data.mortgaged = false;

    if (data.partlySold) data.partlySoldData = this.partlySoldData();
    else data.partlySold = false;

    return data;
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
    // if (this.deedForm.invalid) return;
    console.log('on form submit: ', this.deedForm.value);
    this.sysIsBusy.set(true);
    const formData = this.preparedFormData;
    if (this.runFormValidation()) {
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
                  if (data.deedId === this.id()) {
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
    if (alertMsg.length) {
      alert('⛔ ERROR: CAN NOT SUBMIT\n' + alertMsg);
      return false;
    }
    return true;
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

  onNewDeed(): void {
    this.router.navigate(['master', 'deed', 'new']);
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
    this.oldFileInfoArray.scanCopyFile = [];
    this.oldFileInfoArray.mutationFile = [];
    this.oldFileInfoArray.conversionFile = [];
    this.oldFileInfoArray.documentFile = [];
    this.oldFileInfoArray.hcdocumentFile = [];
    this.oldFileInfoArray.parchaFile = [];
  }

  formPatchHelper(deed: Partial<Deed>): void {
    this.deedForm.patchValue(deed);
    this.deedForm.patchValue({
      deedDate: this.getDateFromString(deed.deedDate!),
      dueDate: this.getDateFromString(deed.dueDate!),
      ledueDate: this.getDateFromString(deed.ledueDate!),
      lelastDate: this.getDateFromString(deed.lelastDate!),
    });

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
    if (deed.hcdocumentFile) {
      deed.hcdocumentFile.forEach((fileName: string) => {
        this.oldFileInfoArray.hcdocumentFile.push({
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

  ngOnInit(): void {
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
  // I think i need to make my own framework and ditch angular  huh!!!!!!!!!!!!
}
