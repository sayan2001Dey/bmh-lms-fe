import { Routes } from '@angular/router';
import { UserMasterComponent } from './user-master/user-master.component';

export const masterRoutes: Routes = [
  {
    path: 'user',
    component: UserMasterComponent,
    data: { title: 'User Master | LMS' },
  },
];
