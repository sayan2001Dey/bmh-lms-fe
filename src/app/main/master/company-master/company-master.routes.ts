import { Routes } from '@angular/router';
import { CompanyMasterComponent } from './company-master.component';

export const companyMasterRoutes: Routes = [
  {
    path: 'new',
    component: CompanyMasterComponent,
    data: { title: 'New Company Master | LMS' },
  },
  {
    path: 'update/:id',
    component: CompanyMasterComponent,
    data: { title: 'Update Company Master | LMS' },
  },
  { path: '**', redirectTo: './', pathMatch: 'full' },
];
