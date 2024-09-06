import {
  Component,
  inject,
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
export class CompanyMasterComponent implements OnInit {
  private readonly companyMasterService: CompanyMasterService =
    inject(CompanyMasterService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  readonly companyList: WritableSignal<Company[]> = signal([]);
  readonly displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'name',
    'action',
  ]);
  readonly listMode: WritableSignal<boolean> = signal(true);
  readonly updateMode: WritableSignal<boolean> = signal(false);
  readonly viewMode: WritableSignal<boolean> = signal(false);
  readonly id: WritableSignal<string> = signal('');

  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
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
    throw new Error('Method not implemented.');
  }

  onUpdateCompany(companyId: string) {
    this.companyForm.reset();
    this.updateMode.set(true);
    this.listMode.set(false);
    this.router.navigate(['master', 'company', 'update', companyId]);
    this.companyForm.patchValue(
      this.companyList().find((c) => c.companyId === companyId) || {}
    );
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
    this.listMode.set(false);
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
    this.route.url.subscribe((data) => {
      this.updateMode.set(data[0].path == 'update');
      this.viewMode.set(data[0].path == 'view');
    });
  }
}
