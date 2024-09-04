import { Routes } from '@angular/router';
import { MouzaMasterComponent } from './mouza-master.component';

export const mouzaMasterRoutes: Routes = [
  {
    path: 'new',
    component: MouzaMasterComponent,
    data: { title: 'New Mouza Master | LMS' },
  },
  {
    path: 'update/:id',
    component: MouzaMasterComponent,
    data: { title: 'Update Mouza Master | LMS' },
  },
  { path: '**', redirectTo: './', pathMatch: 'full' },
];
