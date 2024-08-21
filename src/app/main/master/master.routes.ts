import { Routes } from '@angular/router';
import { UserMasterComponent } from './user-master/user-master.component';
import { adminGuard } from '../../auth/auth.guard';

export const masterRoutes: Routes = [
  {
    path: 'user',
    component: UserMasterComponent,
    data: { title: 'User Master | LMS' },
    canActivate: [adminGuard],
  },
];
