import { Routes } from '@angular/router';
import { authGuard } from '../../auth/auth.guard';
import { HistoryChainReportComponent } from './history-chain-report/history-chain-report.component';

export const reportRoutes: Routes = [
  {
    path: 'get-history-chain',
    component: HistoryChainReportComponent,
    data: { title: 'Get History Chain Graph | LMS' },
    canActivate: [authGuard],
  },
];
