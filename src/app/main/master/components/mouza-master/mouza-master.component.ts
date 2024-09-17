import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Mouza } from '../../../../model/mouza.model';
import { Group } from '../../../../model/group.model';
import { MouzaMasterService } from '../../services/mouza-master.service';
import { GroupMasterService } from '../../services/group-master.service';
import { statesCollection } from '../../../../data/states.collection';
import { MouzaLandSpecifics } from '../../../../model/mouza-land-specifics.model';

@Component({
  selector: 'app-mouza-master',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    RouterLink,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  templateUrl: './mouza-master.component.html',
  styleUrl: './mouza-master.component.scss',
})
export class MouzaMasterComponent implements OnInit {
  private readonly mouzaMasterService: MouzaMasterService =
    inject(MouzaMasterService);
  private readonly groupMasterService: GroupMasterService =
    inject(GroupMasterService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  readonly mouzaList: WritableSignal<Mouza[]> = signal([]);
  readonly groupList: WritableSignal<Group[]> = signal([]);
  readonly selectedGroup: WritableSignal<Group> = signal({
    groupId: '',
    groupName: '',
    state: '',
    city: '',
    pincode: NaN,
  });
  readonly displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'mouzaId',
    'mouzaName',
    'groupName',
    'block',
    'jlno',
    'action',
  ]);
  readonly listMode: WritableSignal<boolean> = signal(true);
  readonly updateMode: WritableSignal<boolean> = signal(false);
  readonly viewMode: WritableSignal<boolean> = signal(false);
  readonly id: WritableSignal<string> = signal('');

  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  readonly landSpecifics: WritableSignal<FormGroup[]> = signal(
    [] as FormGroup[]
  );

  mouzaForm: FormGroup<any> = this.fb.group({
    mouzaId: [''],
    groupId: ['', Validators.required],
    mouza: ['', Validators.required],
    block: ['', Validators.required],
    jlno: ['', Validators.required],
  });

  get form(): {
    [key: string]: AbstractControl<any, any>;
  } {
    return this.mouzaForm.controls;
  }

  get formData(): Mouza {
    return this.mouzaForm.value;
  }

  /**
   * Returns an array of the controls of the land specifics form group array.
   * Each control is of type `AbstractControl<any, any>`.
   * @returns An array of objects with property names corresponding to the
   * control names in the form groups, and property values of type
   * `AbstractControl<any, any>`.
   */
  get landSpecificsFormsArray(): {
    [key: string]: AbstractControl<any, any>;
  }[] {
    return this.landSpecifics().map((formGroup) => formGroup.controls);
  }

  /**
   * Returns an array of the values of the land specifics form group array.
   * The values are of type `MouzaLandSpecifics`.
   * @returns An array of `MouzaLandSpecifics` objects.
   */
  get landSpecificsDataArray(): MouzaLandSpecifics[] {
    return this.landSpecifics().map((formGroup) => formGroup.value);
  }

  /**
   * Returns the controls of the land specifics form at the specified index.
   * @param index The index of the land specifics form to retrieve.
   * @returns The controls of the land specifics form at the specified index.
   */
  landSpecificsForm(index: number): {
    [key: string]: AbstractControl<any, any>;
  } {
    return this.landSpecifics()[index].controls;
  }

  /**
   * Returns the land specifics data at the specified index.
   * @param index The index of the land specifics to retrieve.
   * @returns The land specifics data at the specified index.
   */
  landSpecificsData(index: number): MouzaLandSpecifics {
    return this.landSpecifics()[index].value;
  }

  /**
   * Adds a new land specifics control to the form.
   *
   * @param initialValues Optional object with initial values for the land specifics.
   * The object should have the following properties:
   * - oldRsDag: The old RS Dag no. (string)
   * - newLrDag: The new LR Dag no. (string)
   * - qty: The quantity of land (number)
   *
   * If not provided, the method will use the default values of empty string for
   * both oldRsDag and newLrDag, and NaN for qty.
   */
  onAddLandSpecifics(
    initialValues: MouzaLandSpecifics = {
      oldRsDag: '',
      newLrDag: '',
      qty: NaN,
    }
  ): void {
    this.landSpecifics.update((formsArray: FormGroup[]) => {
      formsArray.push(
        this.fb.group({
          oldRsDag: [initialValues.oldRsDag, [Validators.required]],
          newLrDag: [initialValues.newLrDag, [Validators.required]],
          qty: [initialValues.qty, [Validators.required, Validators.min(1)]],
        })
      );
      return formsArray;
    });
  }

  /**
   * Removes the land specific at the given index from the landSpecificsFormArray.
   * Does nothing if there is only one land specific left.
   * @param index the index of the land specific to remove
   */
  onRemoveLandSpecifics(index: number): void {
    const oldFormsArray: FormGroup[] = this.landSpecifics();
    if (oldFormsArray.length > 1) {
      oldFormsArray.splice(index, 1);
      this.landSpecifics.set(oldFormsArray);
    }
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

  get prepFormData(): Mouza {
    const res: Mouza = this.formData;
    res.landSpecifics = this.landSpecificsDataArray;
    return res;
  }

  runFormValidation(): boolean {
    let alertMsg: string = '';

    for (const controlName in this.form) {
      if (this.form[controlName].invalid) {
        alertMsg += '\n Field ' + controlName + ' is invalid.';
      }
    }
    
    const lsFormGroups = this.landSpecifics();
    
    if (!lsFormGroups.length)
      alertMsg += '\n Land Specifics must have at least 1 row of data.'

    for (let i = 0; i < lsFormGroups.length; i++) {
      for (const controlName in lsFormGroups[i].controls) {
        if (controlName === 'qty' && lsFormGroups[i].value.qty < 1)
          alertMsg += `\n Value of field ${controlName} on row ${i+1} of Land Specifics can not be less than 1.`;
        else if (lsFormGroups[i].controls[controlName].invalid) {
          alertMsg += `\n Field ${controlName} on row ${i+1} of Land Specifics is invalid.`;
        }
      }
    }

    if (alertMsg.length) {
      alert('⛔ ERROR: CAN NOT SUBMIT\n' + alertMsg);
      return false;
    }
    return true;
  }

  onSubmit() {
    if (!this.runFormValidation()) return;
    this.sysIsBusy.set(true);
    if (this.updateMode()) {
      //update master
      this.mouzaMasterService
        .updateMouza(this.id(), this.prepFormData)
        .subscribe({
          next: (data) => {
            this.mouzaList.set(
              this.mouzaList().map((mouza) => {
                if (mouza.mouzaId === this.id()) {
                  return data;
                }
                return mouza;
              })
            );
            this.onListMouza();
          },
          error: () => {
            console.error('error bro error');
          },
          complete: () => {
            this.sysIsBusy.set(false);
          },
        });
    } else {
      // new master
      this.mouzaMasterService.newMouza(this.prepFormData).subscribe({
        next: (data) => {
          this.mouzaList.set([data, ...this.mouzaList()]);
          this.onListMouza();
        },
        error: () => {
          console.error('error bro error');
        },
        complete: () => {
          this.sysIsBusy.set(false);
        },
      });
    }
  }

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

  onNewMouza(): void {
    this.router.navigate(['master', 'mouza', 'new']);
    this.mouzaFormResetFn();
    this.listMode.set(false);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
    this.selectedGroup.set({
      groupId: '',
      groupName: '',
      state: '',
      city: '',
      pincode: NaN,
    });

    this.onAddLandSpecifics();

    this.mouzaForm.controls['groupId'].enable();
    this.mouzaForm.controls['mouzaId'].disable();
  }

  onUpdateMouza(mouzaId: string) {
    console.log('mouza id', mouzaId);
    this.router.navigate(['master', 'mouza', 'update', mouzaId]);
    this.updateMode.set(true);
    this.viewMode.set(false);

    this.mouzaForm.controls['groupId'].enable();
    this.mouzaForm.controls['mouzaId'].disable();

    this.mouzaFormPatchValueOptimized(mouzaId);
    this.listMode.set(false);
  }

  onViewMouza(mouzaId: string): void {
    this.router.navigate(['master', 'mouza', 'view', mouzaId]);
    this.updateMode.set(false);
    this.viewMode.set(true);

    this.mouzaForm.controls['groupId'].disable();
    this.mouzaForm.controls['mouzaId'].disable();

    this.mouzaFormPatchValueOptimized(mouzaId);
    this.listMode.set(false);
  }

  mouzaFormPatchValueOptimized(mouzaId: string): void {
    this.id.set(mouzaId);
    this.sysIsBusy.set(true);

    const mouza: Mouza | undefined = this.mouzaList().find(
      (c) => c.mouzaId === mouzaId
    );

    if (mouza) {
      this.mouzaFormPatchHelperFn(mouza);
      this.onGroupChange();
    } else {
      this.mouzaMasterService.getMouza(mouzaId).subscribe({
        next: (data) => {
          this.mouzaFormPatchHelperFn(data);
        },
        error: () => {
          this.serverUnreachable.set(true);
        },
        complete: () => {
          this.onGroupChange();
          this.sysIsBusy.set(false);
        },
      });
    }

    this.sysIsBusy.set(false);
  }

  mouzaFormPatchHelperFn(mouza: Mouza): void {
    this.mouzaFormResetFn();
    this.mouzaForm.patchValue(mouza);
    mouza.landSpecifics.forEach((item) => {
      this.onAddLandSpecifics(item);
    });
  }

  mouzaFormResetFn(): void {
    this.landSpecifics.set([]);
    this.mouzaForm.reset();
  }

  onListMouza() {
    this.router.navigate(['master', 'mouza']);
    this.listMode.set(true);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
  }

  onDeleteMouza(mouzaId: string) {
    if (
      window.confirm(
        '⚠ CAUTION: ACTION CANNOT BE UNDONE!\n\nDo you really want to delete this mouza master?'
      )
    ) {
      this.sysIsBusy.set(true);
      this.mouzaMasterService.deleteMouza(mouzaId).subscribe({
        next: () => {
          this.mouzaList.set(
            this.mouzaList().filter((mouza) => mouza.mouzaId !== mouzaId)
          );
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            alert('⛔ ERROR: CAN NOT DELETE\n\nMouza not found.');
          } else {
            alert(
              '⛔ ERROR: CAN NOT DELETE\n\nFailed to delete mouza. Please try again.'
            );
          }
        },
        complete: () => {
          this.sysIsBusy.set(false);
        },
      });
    }
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

  ngOnInit(): void {
    this.setMouzaList();
    this.setGroupList();

    if (this.route.children[0]) {
      this.route.children[0].url.subscribe((data) => {
        if (data[0].path) {
          if (data[0].path === 'update') {
            this.onUpdateMouza(data[1].path);
          } else if (data[0].path === 'new') {
            this.onNewMouza();
          } else if (data[0].path === 'view') {
            this.onViewMouza(data[1].path);
          } else {
            this.onListMouza();
          }
        }
      });
    } else {
      this.onListMouza();
    }

    this.mouzaForm.controls['mouzaId'].disable();
  }
  // TODO: if we click on nav item while in new or update etc. i need to go back to list mode. but its not happening
  // I think i need to make my own framework and ditch angular  huh!!!!!!!!!!!!
}
