import { Routes } from '@angular/router';
import { UserMasterComponent } from './user-master.component';

export const userMasterRoutes: Routes = [
  {
    path: 'new',
    component: UserMasterComponent,
    data: { title: 'New User Master | LMS' },
  },
  {
    path: 'update/:id',
    component: UserMasterComponent,
    data: { title: 'Update User Master | LMS' },
  },
  { path: '**', redirectTo: './', pathMatch: 'full' },
];
