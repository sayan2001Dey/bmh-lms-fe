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
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './deed-master.component.html',
  styleUrl: './deed-master.component.scss',
})
export class DeedMasterComponent implements OnInit {
  private readonly deedMasterService: DeedMasterService =
    inject(DeedMasterService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  readonly deedList: WritableSignal<Deed[]> = signal([]);
  readonly displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'deedId',
    'deedName',
    'panNumber',
    'deedAddress',
    'action',
  ]);
  readonly listMode: WritableSignal<boolean> = signal(true);
  readonly updateMode: WritableSignal<boolean> = signal(false);
  readonly viewMode: WritableSignal<boolean> = signal(false);
  readonly id: WritableSignal<string> = signal('');

  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);

  deedForm: FormGroup<any> = this.fb.group({
    deedId: [''],
    deedNo: ['', [Validators.required]],
    deedDate: ['', [Validators.required]],
    totalQty: [NaN, [Validators.required]],
    purQty: [NaN, [Validators.required]],
    mutedQty: [NaN, [Validators.required]],
    unMutedQty: [NaN, [Validators.required]],
    landStatus: ['', [Validators.required]],
    landType: ['', [Validators.required]],
  });

  get formData(): Deed {
    return this.deedForm.value;
  }

  onSubmit() {
    if (this.deedForm.invalid) return;
    this.sysIsBusy.set(true);
    const formData = this.formData;
    if (this.updateMode()) {
      //update master
      this.deedMasterService.updateDeed(this.id(), formData).subscribe({
        next: (data) => {
          this.deedList.set(
            this.deedList().map((deed) => {
              if (deed.deedId === this.id()) {
                return data;
              }
              return deed;
            })
          );
          this.onListDeed();
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
      this.deedMasterService.newDeed(this.formData).subscribe({
        next: (data) => {
          this.deedList.set([data, ...this.deedList()]);
          this.onListDeed();
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
    this.deedForm.reset();
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
    this.deedForm.reset();
    this.id.set(deedId);
    this.sysIsBusy.set(true);

    const deed: Deed | undefined = this.deedList().find(
      (c) => c.deedId === deedId
    );

    if (deed) {
      this.deedForm.patchValue(deed);
    } else {
      this.deedMasterService.getDeed(deedId).subscribe({
        next: (data) => {
          this.deedForm.patchValue(data);
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
            alert('⛔ ERROR: CAN NOT DELETE\n\nUser not found.');
          } else {
            alert(
              '⛔ ERROR: CAN NOT DELETE\n\nFailed to delete user. Please try again.'
            );
          }
        },
        complete: () => {
          this.sysIsBusy.set(false);
        },
      });
    }
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
