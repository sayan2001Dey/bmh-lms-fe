import { Routes } from "@angular/router";
import { adminGuard, authGuard } from "../../auth/auth.guard";
import { CompanyMasterComponent } from "./components/company-master/company-master.component";
import { companyMasterRoutes } from "./components/company-master/company-master.routes";
import { DeedMasterComponent } from "./components/deed-master/deed-master.component";
import { deedMasterRoutes } from "./components/deed-master/deed-master.routes";
import { GroupMasterComponent } from "./components/group-master/group-master.component";
import { groupMasterRoutes } from "./components/group-master/group-master.routes";
import { MouzaMasterComponent } from "./components/mouza-master/mouza-master.component";
import { mouzaMasterRoutes } from "./components/mouza-master/mouza-master.routes";
import { UserMasterComponent } from "./components/user-master/user-master.component";
import { userMasterRoutes } from "./components/user-master/user-master.routes";

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
  {
    path: 'deed',
    component: DeedMasterComponent,
    data: { title: 'Deed Master | LMS' },
    canActivate: [authGuard],
    children: deedMasterRoutes,
  },
];
