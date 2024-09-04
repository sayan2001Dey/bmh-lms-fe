import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { DialogCompanyEditorComponent } from './modal/company-editor/company-editor.dialog';
import { Company } from '../../../model/company.model';

@Component({
  selector: 'app-company-master',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './company-master.component.html',
  styleUrl: './company-master.component.scss',
})
export class CompanyMasterComponent {
  private readonly companyMasterService: undefined;
  private readonly dialog: Dialog = inject(Dialog);
  private readonly router: Router = inject(Router);
  readonly companyList: WritableSignal<Company[]> = signal([]);
  readonly displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'name',
    'action',
  ]);
  onDeleteCompany(arg0: any) {
    throw new Error('Method not implemented.');
  }
  onUpdateCompany(arg0: any) {
    throw new Error('Method not implemented.');
  }


  getCompanyList(): void {
    throw new Error('getCompanyList() Method not implemented.');
  }

  onNewCompany(): void {
    const dialogRef = this.dialog.open<DialogCompanyEditorComponent>(
      DialogCompanyEditorComponent,
      {
        maxWidth: '25rem',
        backdropClass: 'light-blur-backdrop',
        disableClose: true,
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

    dialogRef.closed.subscribe(() => {
      this.router.navigate(['master', 'company']);
      this.getCompanyList();
    });
  }
}
