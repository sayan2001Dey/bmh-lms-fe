import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
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
import { Group } from '../../../../model/group.model';
import { GroupMasterService } from '../../services/group-master.service';
import { State } from '../../../../model/state.model';
import { statesCollection } from '../../../../data/states.collection';

@Component({
  selector: 'app-group-master',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    RouterLink,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './group-master.component.html',
  styleUrl: './group-master.component.scss',
})
export class GroupMasterComponent implements OnInit {
  private readonly groupMasterService: GroupMasterService =
    inject(GroupMasterService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  readonly states: WritableSignal<State[]> = signal(statesCollection);
  readonly cities: WritableSignal<string[]> = signal([]);
  readonly groupList: WritableSignal<Group[]> = signal([]);
  readonly displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'groupId',
    'groupName',
    'state',
    'city',
    'pincode',
    'action',
  ]);
  readonly listMode: WritableSignal<boolean> = signal(true);
  readonly updateMode: WritableSignal<boolean> = signal(false);
  readonly viewMode: WritableSignal<boolean> = signal(false);
  readonly id: WritableSignal<string> = signal('');

  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);

  groupForm: FormGroup<any> = this.fb.group({
    groupId: [''],
    groupName: ['', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required],
    pincode: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
    ],
  });

  get form(): {
    [key: string]: AbstractControl<any, any>;
  } {
    return this.groupForm.controls;
  }

  get formData(): Group {
    return this.groupForm.value;
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

  onSubmit() {
    if (this.groupForm.invalid) return;
    this.sysIsBusy.set(true);
    if (this.updateMode()) {
      //update master
      this.groupMasterService.updateGroup(this.id(), this.formData).subscribe({
        next: (data) => {
          this.groupList.set(
            this.groupList().map((group) => {
              if (group.groupId === this.id()) {
                return data;
              }
              return group;
            })
          );
          this.onListGroup();
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
      this.groupMasterService.newGroup(this.formData).subscribe({
        next: (data) => {
          this.groupList.set([data, ...this.groupList()]);
          this.onListGroup();
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

  onNewGroup(): void {
    this.router.navigate(['master', 'group', 'new']);
    this.groupForm.reset();
    this.listMode.set(false);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');

    this.groupForm.controls['state'].enable();
    this.groupForm.controls['city'].enable();
    this.groupForm.controls['groupId'].disable();
  }

  onUpdateGroup(groupId: string) {
    console.log('group id', groupId);
    this.router.navigate(['master', 'group', 'update', groupId]);
    this.updateMode.set(true);
    this.viewMode.set(false);

    this.groupForm.controls['state'].enable();
    this.groupForm.controls['city'].enable();
    this.groupForm.controls['groupId'].disable();

    this.groupFormPatchValueOptimized(groupId);
    this.listMode.set(false);
  }

  onViewGroup(groupId: string): void {
    this.router.navigate(['master', 'group', 'view', groupId]);
    this.updateMode.set(false);
    this.viewMode.set(true);

    this.groupForm.controls['state'].disable();
    this.groupForm.controls['city'].disable();
    this.groupForm.controls['groupId'].disable();

    this.groupFormPatchValueOptimized(groupId);
    this.listMode.set(false);
  }

  groupFormPatchValueOptimized(groupId: string): void {
    this.groupForm.reset();
    this.id.set(groupId);
    this.sysIsBusy.set(true);

    const group: Group | undefined = this.groupList().find(
      (c) => c.groupId === groupId
    );

    if (group) {
      this.groupForm.patchValue(group);
    } else {
      this.groupMasterService.getGroup(groupId).subscribe({
        next: (data) => {
          this.groupForm.patchValue(data);
        },
        error: () => {
          this.serverUnreachable.set(true);
        },
        complete: () => {
          this.sysIsBusy.set(false);
        },
      });
    }
    // DON'T REMOVE
    this.onStatesChange();

    this.sysIsBusy.set(false);
  }

  onListGroup() {
    this.router.navigate(['master', 'group']);
    this.listMode.set(true);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
  }

  onDeleteGroup(groupId: string) {
    if (
      window.confirm(
        '⚠ CAUTION: ACTION CANNOT BE UNDONE!\n\nDo you really want to delete this group master?'
      )
    ) {
      this.sysIsBusy.set(true);
      this.groupMasterService.deleteGroup(groupId).subscribe({
        next: () => {
          this.groupList.set(
            this.groupList().filter((group) => group.groupId !== groupId)
          );
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            alert('⛔ ERROR: CAN NOT DELETE\n\nGroup not found.');
          } else {
            alert(
              '⛔ ERROR: CAN NOT DELETE\n\nFailed to delete group. Please try again.'
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

  ngOnInit(): void {
    this.setGroupList();

    if (this.route.children[0]) {
      this.route.children[0].url.subscribe((data) => {
        if (data[0].path) {
          if (data[0].path === 'update') {
            this.onUpdateGroup(data[1].path);
          } else if (data[0].path === 'new') {
            this.onNewGroup();
          } else if (data[0].path === 'view') {
            this.onViewGroup(data[1].path);
          } else {
            this.onListGroup();
          }
        }
      });
    } else {
      this.onListGroup();
    }

    this.groupForm.controls['groupId'].disable();
  }
  // TODO: if we click on nav item while in new or update etc. i need to go back to list mode. but its not happening
  // I think i need to make my own framework and ditch angular  huh!!!!!!!!!!!!
}
