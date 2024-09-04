import { Routes } from '@angular/router';
import { UserMasterComponent } from './user-master/user-master.component';
import { adminGuard } from '../../auth/auth.guard';
import { userMasterRoutes } from './user-master/user-master.routes';
import { CompanyMasterComponent } from './company-master/company-master.component';
import { companyMasterRoutes } from './company-master/company-master.routes';
import { GroupMasterComponent } from './group-master/group-master.component';
import { groupMasterRoutes } from './group-master/group-master.routes';
import { MouzaMasterComponent } from './mouza-master/mouza-master.component';
import { mouzaMasterRoutes } from './mouza-master/mouza-master.routes';

export const masterRoutes: Routes = [
  {
    path: 'user',
    component: UserMasterComponent,
    data: { title: 'User Master | LMS' },
    canActivate: [adminGuard],
    children: userMasterRoutes,
  },
  {
    path: 'company',
    component: CompanyMasterComponent,
    data: { title: 'Company Master | LMS' },
    canActivate: [adminGuard],
    children: companyMasterRoutes,
  },
  {
    path: 'group',
    component: GroupMasterComponent,
    data: { title: 'Group Master | LMS' },
    canActivate: [adminGuard],
    children: groupMasterRoutes,
  },
  {
    path: 'mouza',
    component: MouzaMasterComponent,
    data: { title: 'Mouza Master | LMS' },
    canActivate: [adminGuard],
    children: mouzaMasterRoutes,
  },
];
