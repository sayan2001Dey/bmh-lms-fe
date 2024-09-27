import { Routes } from "@angular/router";
import { adminGuard, authGuard } from "../../auth/auth.guard";
import { HistoryChainReportComponent } from "./history-chain-report/history-chain-report.component";

export const reportRoutes: Routes = [
  // {
  //   path: 'user',
  //   component: UserMasterComponent,
  //   data: { title: 'User Master | LMS' },
  //   canActivate: [adminGuard],
  //   children: userMasterRoutes,
  // },
  // {
  //   path: 'company',
  //   component: CompanyMasterComponent,
  //   data: { title: 'Company Master | LMS' },
  //   canActivate: [adminGuard],
  //   children: companyMasterRoutes,
  // },
  // {
  //   path: 'group',
  //   component: GroupMasterComponent,
  //   data: { title: 'Group Master | LMS' },
  //   canActivate: [adminGuard],
  //   children: groupMasterRoutes,
  // },
  // {
  //   path: 'mouza',
  //   component: MouzaMasterComponent,
  //   data: { title: 'Mouza Master | LMS' },
  //   canActivate: [adminGuard],
  //   children: mouzaMasterRoutes,
  // },
  // {
  //   path: 'deed',
  //   component: DeedMasterComponent,
  //   data: { title: 'Deed Master | LMS' },
  //   canActivate: [authGuard],
  //   children: deedMasterRoutes,
  // },

      {
        path: 'get-history-chain',
        component: HistoryChainReportComponent,
        data: { title: 'Get History Chain Graph | LMS' },
        canActivate: [authGuard],
      }
];
