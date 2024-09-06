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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Company } from '../../../model/company.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { CompanyMasterService } from './company-master.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-company-master',
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
  ],
  templateUrl: './company-master.component.html',
  styleUrl: './company-master.component.scss',
})
export class CompanyMasterComponent implements OnInit, OnDestroy {
  private readonly companyMasterService: CompanyMasterService =
    inject(CompanyMasterService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  readonly companyList: WritableSignal<Company[]> = signal([]);
  readonly displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'companyId',
    'companyName',
    'panNumber',
    'companyAddress',
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
      this.companyForm.disable();
    } else {
      this.companyForm.enable();
      this.companyForm.controls['companyId'].disable();
    }
  })

  companyForm: FormGroup<any> = this.fb.group({
    companyId: [''],
    companyName: ['', [Validators.required, Validators.minLength(3)]],
    companyAddress: ['', [Validators.required, Validators.minLength(10)]],
    panNumber: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
    ],
  });

  get formData(): Company {
    return this.companyForm.value;
  }

  onSubmit() {
    if(this.companyForm.invalid)
      return;
    this.sysIsBusy.set(true);
    if (this.updateMode()) {
      //update master
      this.companyMasterService
        .updateCompany(this.id(), this.formData)
        .subscribe({
          next: (data) => {
            this.companyList.set(
              this.companyList().map((company) => {
                if (company.companyId === this.id()) {
                  return data;
                }
                return company;
              })
            );
            this.onListCompany();
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
      this.companyMasterService.newCompany(this.formData).subscribe({
        next: (data) => {
          this.companyList.set([data, ...this.companyList()]);
          this.onListCompany();
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

  onNewCompany(): void {
    this.router.navigate(['master', 'company', 'new']);
    this.companyForm.reset();
    this.listMode.set(false);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
  }

  onUpdateCompany(companyId: string) {
    console.log('company id', companyId);
    this.router.navigate(['master', 'company', 'update', companyId]);
    this.updateMode.set(true);
    this.viewMode.set(false);

    this.companyFormPatchValueOptimized(companyId);
    this.listMode.set(false);
  }

  onViewCompany(companyId: string): void {
    this.router.navigate(['master', 'company', 'view', companyId]);
    this.updateMode.set(false);
    this.viewMode.set(true);

    this.companyFormPatchValueOptimized(companyId);
    this.listMode.set(false);
  }

  companyFormPatchValueOptimized(companyId: string): void {
    this.companyForm.reset();
    this.id.set(companyId);
    this.sysIsBusy.set(true);

    const company: Company | undefined = this.companyList().find(
      (c) => c.companyId === companyId
    );

    if (company) {
      this.companyForm.patchValue(company);
    } else {
      this.companyMasterService.getCompany(companyId).subscribe({
        next: (data) => {
          this.companyForm.patchValue(data);
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

  onListCompany() {
    this.router.navigate(['master', 'company']);
    this.listMode.set(true);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
  }

  onDeleteCompany(companyId: string) {
    if (
      window.confirm(
        '⚠ CAUTION: ACTION CANNOT BE UNDONE!\n\nDo you really want to delete this company master?'
      )
    ) {
      this.sysIsBusy.set(true);
      this.companyMasterService.deleteCompany(companyId).subscribe({
        next: () => {
          this.companyList.set(
            this.companyList().filter(
              (company) => company.companyId !== companyId
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
    this.setCompanyList();

    if (this.route.children[0]) {
      this.route.children[0].url.subscribe((data) => {
        if (data[0].path) {
          if (data[0].path === 'update') {
            this.onUpdateCompany(data[1].path);
          } else if (data[0].path === 'new') {
            this.onNewCompany();
          } else if (data[0].path === 'view') {
            this.onViewCompany(data[1].path);
          }
        }
      });
    } else {
      this.onListCompany();
    }
  }

  ngOnDestroy(): void {
    this.sysIsBusy.set(false);
    this.serverUnreachable.set(false);
    this.listMode.set(false);
    this.updateMode.set(false);
    this.viewMode.set(false);
    this.id.set('');
    this.companyForm.reset();
    this.viewModeEffect.destroy();
  }
}
