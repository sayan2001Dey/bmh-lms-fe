import { Routes } from '@angular/router';
import { DeedMasterComponent } from './deed-master.component';

export const deedMasterRoutes: Routes = [
  {
    path: 'new',
    component: DeedMasterComponent,
    data: { title: 'New Deed Master | LMS' },
  },
  {
    path: 'view/:id',
    component: DeedMasterComponent,
    data: { title: 'View Deed Master | LMS' },
  },
  {
    path: 'update/:id',
    component: DeedMasterComponent,
    data: { title: 'Update Deed Master | LMS' },
  },
  { path: '**', redirectTo: './' },
];
