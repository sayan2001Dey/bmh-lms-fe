import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard, loginGuard } from './auth/auth.guard';
import { LandRecordComponent } from './main/land-record/land-record.component';
import { MasterComponent } from './main/master/master.component';
import { masterRoutes } from './main/master/master.routes';
import { landRecordRoutes } from './main/land-record/land-record.routes';
import { ReportComponent } from './main/report/report.component';
import { reportRoutes } from './main/report/report.routes';

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
    children: landRecordRoutes,
  },
  {
    path: 'master',
    component: MasterComponent,
    data: { title: 'Master | LMS' },
    canActivate: [authGuard],
    children: masterRoutes,
  },
  {
    path: 'report',
    component: ReportComponent,
    data: { title: 'Report | LMS' },
    canActivate: [authGuard],
    children: reportRoutes,
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login | LMS' },
    canActivate: [loginGuard],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
