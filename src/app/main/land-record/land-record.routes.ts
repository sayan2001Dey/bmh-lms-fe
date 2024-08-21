import { Routes } from '@angular/router';
import { ListLandRecordComponent } from './list-land-record/list-land-record.component';
import { NewLandRecordComponent } from './new-land-record/new-land-record.component';

export const landRecordRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ListLandRecordComponent,
    data: { title: 'Land Records | LMS' },
  },
  {
    path: 'new',
    component: NewLandRecordComponent,
    data: { title: 'New Land Record | LMS' },
  },
  {
    path: 'update/:id',
    component: NewLandRecordComponent,
    data: { title: 'Update Land Record | LMS' },
  },
  {
    path: 'view/:id',
    component: NewLandRecordComponent,
    data: { title: 'View Land Record | LMS' },
  },
];
