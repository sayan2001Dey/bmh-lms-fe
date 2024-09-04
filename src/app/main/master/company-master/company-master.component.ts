import { Component, signal, WritableSignal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-company-master',
  standalone: true,
  imports: [MatIconModule, MatCardModule, MatTableModule, RouterLink],
  templateUrl: './company-master.component.html',
  styleUrl: './company-master.component.scss',
})
export class CompanyMasterComponent {
  companyList: WritableSignal<any[]> = signal([]);
  displayedColumns: WritableSignal<string[]> = signal([
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

  onNewCompany() {
    throw new Error('Method not implemented.');
  }
}
