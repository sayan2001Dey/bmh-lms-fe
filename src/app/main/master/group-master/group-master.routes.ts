import { Routes } from '@angular/router';
import { GroupMasterComponent } from './group-master.component';

export const groupMasterRoutes: Routes = [
  {
    path: 'new',
    component: GroupMasterComponent,
    data: { title: 'New Group Master | LMS' },
  },
  {
    path: 'view/:id',
    component: GroupMasterComponent,
    data: { title: 'View Group Master | LMS' },
  },
  {
    path: 'update/:id',
    component: GroupMasterComponent,
    data: { title: 'Update Group Master | LMS' },
  },
  { path: '**', redirectTo: './', pathMatch: 'full' },
];
