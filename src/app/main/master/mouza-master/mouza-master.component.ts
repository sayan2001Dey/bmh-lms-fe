import { HttpErrorResponse } from "@angular/common/http";
import { Component, EffectRef, OnDestroy, OnInit, WritableSignal, effect, inject, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Mouza } from "../../../model/mouza.model";
import { MouzaMasterService } from "./mouza-master.service";


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
export class MouzaMasterComponent implements OnInit, OnDestroy {
  private readonly mouzaMasterService: MouzaMasterService =
    inject(MouzaMasterService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  readonly mouzaList: WritableSignal<Mouza[]> = signal([]);
  readonly displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'mouzaId',
    'mouzaName',
    'panNumber',
    'mouzaAddress',
    'action',
  ]);
  readonly listMode: WritableSignal<boolean> = signal(true);
  readonly updateMode: WritableSignal<boolean> = signal(false);
  readonly viewMode: WritableSignal<boolean> = signal(false);
  readonly id: WritableSignal<string> = signal('');

  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);

  private readonly viewModeEffect: EffectRef = effect(() => {
    if (this.viewMode()) {
      this.mouzaForm.disable();
    } else {
      this.mouzaForm.enable();
      this.mouzaForm.controls['mouzaId'].disable();
    }
  })

  //TODO: form 
  mouzaForm: FormGroup<any> = this.fb.group({
    mouzaId: [''],
    mouzaName: ['', [Validators.required, Validators.minLength(3)]],
    mouzaAddress: ['', [Validators.required, Validators.minLength(10)]],
    panNumber: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
    ],
  });

  get formData(): Mouza {
    return this.mouzaForm.value;
  }

  onSubmit() {
    if(this.mouzaForm.invalid)
      return;
    this.sysIsBusy.set(true);
    if (this.updateMode()) {
      //update master
      this.mouzaMasterService
        .updateMouza(this.id(), this.formData)
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
      this.mouzaMasterService.newMouza(this.formData).subscribe({
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
    this.mouzaForm.reset();
    this.listMode.set(false);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
  }

  onUpdateMouza(mouzaId: string) {
    console.log('mouza id', mouzaId);
    this.router.navigate(['master', 'mouza', 'update', mouzaId]);
    this.updateMode.set(true);
    this.viewMode.set(false);

    this.mouzaFormPatchValueOptimized(mouzaId);
    this.listMode.set(false);
  }

  onViewMouza(mouzaId: string): void {
    this.router.navigate(['master', 'mouza', 'view', mouzaId]);
    this.updateMode.set(false);
    this.viewMode.set(true);

    this.mouzaFormPatchValueOptimized(mouzaId);
    this.listMode.set(false);
  }

  mouzaFormPatchValueOptimized(mouzaId: string): void {
    this.mouzaForm.reset();
    this.id.set(mouzaId);
    this.sysIsBusy.set(true);

    const mouza: Mouza | undefined = this.mouzaList().find(
      (c) => c.mouzaId === mouzaId
    );

    if (mouza) {
      this.mouzaForm.patchValue(mouza);
    } else {
      this.mouzaMasterService.getMouza(mouzaId).subscribe({
        next: (data) => {
          this.mouzaForm.patchValue(data);
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
            this.mouzaList().filter(
              (mouza) => mouza.mouzaId !== mouzaId
            )
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
    this.setMouzaList();

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
  }
  // TODO: if we click on nav item while in new or update etc. i need to go back to list mode. but its not happening
  // I think i need to make my own framework and ditch angular  huh!!!!!!!!!!!!
  ngOnDestroy(): void {
    this.sysIsBusy.set(false);
    this.serverUnreachable.set(false);
    this.listMode.set(false);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
    this.mouzaForm.reset();
    this.viewModeEffect.destroy();
  }
}
