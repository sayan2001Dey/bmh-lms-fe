import { Routes } from '@angular/router';
import { NewLandRecordComponent } from './main/land-record/new-land-record/new-land-record.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard, loginGuard } from './auth/auth.guard';
import { ListLandRecordComponent } from './main/land-record/list-land-record/list-land-record.component';
import { LandRecordComponent } from './main/land-record/land-record.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: '/land-record',
  },
  {
    path: 'land-record',
    component: LandRecordComponent,
    data: { title: 'Land Record | LMS' },
    canActivate: [authGuard],
    children: [
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
      }
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login | LMS' },
    canActivate: [loginGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: 'Register | LMS' },
    canActivate: [loginGuard]
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
