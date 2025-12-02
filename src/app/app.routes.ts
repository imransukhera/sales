// OTHER IMPORTS
import { Routes } from '@angular/router';
import { RoutesEnum } from './commons/enums/routes.enum';

// COMPONENTS
import { PageNotFoundComponent } from './pages/components/page-not-found/page-not-found.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminTimeSheetComponent } from './admin/layout/admin-time-sheet/admin-time-sheet.component';
import { ProjectsComponent } from './admin/projects/projects.component';
import { AddUsersComponent } from './admin/layout/add-users/add-users.component';
import { AuthGuard } from './auth.guard';
import { CheckingLayoutComponent } from './pages/components/checkingtime/checking-layout/checking-layout.component';
import { DashboardLayoutComponent } from './pages/components/dashboard/dashboard-layout/dashboard-layout.component';
import { TimeLogsSheetComponent } from './pages/components/dashboard/time-logs-sheet/time-logs-sheet.component';
import { CheckingDetailComponent } from './pages/components/dashboard/checking-detail/checking-detail.component';
import { LeavesComponent } from './pages/components/leaves/leaves.component';
import { TaskManagementComponent } from './pages/components/task-management/task-management.component';
import { TaskComponent } from './pages/components/task-management/components/task/task.component';
import { ProjectsDetailComponent } from './pages/components/task-management/components/projects-detail/projects-detail.component';
import { LeavesLogsComponent } from './admin/leaves-logs/leaves-logs.component';
import { PrivacyPolicyComponent } from './pages/components/policy/privacy-policy/privacy-policy.component';
import { DashboardPageComponent } from './pages/components/dashboard/dashboard-page/dashboard-page.component';
import { IssueReportComponent } from './pages/components/task-management/components/issue-report/issue-report.component';
import { ViewBugDetailComponent } from './pages/components/task-management/components/view-bug-detail/view-bug-detail.component';

export const routes: Routes = [

    {
        path: RoutesEnum.LOGIN,
        loadComponent: () => import('./pages/components/public/login/login.component').then(m => m.LoginComponent),
    },

    {
        path: RoutesEnum.SIGNUP,
        loadComponent: () => import('./pages/components/public/signup/signup.component').then(m => m.SignupComponent),
        // canActivate: [AuthGuard]
    },
    {
        path: RoutesEnum.FORGOT_PASSWORD,
        loadComponent: () => import('./pages/components/public/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        // canActivate: [AuthGuard]
    },

    {
        path: '',
        loadComponent: () => import('./pages/components/dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
        canActivate: [AuthGuard],
        data: { expectedRole: 'user' },
        children: [
            { path: '', redirectTo: ':companyId/' + RoutesEnum.DASHBOARD, pathMatch: 'full' },
            { path: ':companyId/' + RoutesEnum.DASHBOARD, component: DashboardPageComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },
            { path: 'timelogs', component: TimeLogsSheetComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },
            { path: RoutesEnum.CHECKING_DETAIL, component: CheckingDetailComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },
            { path: RoutesEnum.Leaves, component: LeavesComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },
            {
                path: RoutesEnum.Task, component: TaskManagementComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' },
                children: [
                    { path: '', redirectTo: 'projects', pathMatch: 'full' },
                    { path: 'projects', component: ProjectsDetailComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },
                    { path: 'task', component: TaskComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },
                    { path: 'issue-report', component: IssueReportComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },
                    { path: 'issue/:id', component: ViewBugDetailComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },


                ]
            },
            { path: 'privacy-policy', component: PrivacyPolicyComponent, canActivate: [AuthGuard], data: { expectedRole: 'user' } },


        ]
    },

    {
        path: ':companyId/' + RoutesEnum.ADMIN,
        loadComponent: () =>
            import('./admin/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [AuthGuard],
        data: { expectedRole: 'admin' },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } },
            { path: 'time-sheet', component: AdminTimeSheetComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } },
            { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } },
            { path: 'add-users', component: AddUsersComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } },
            { path: 'leaves-logs', component: LeavesLogsComponent, canActivate: [AuthGuard], data: { expectedRole: 'admin' } }
        ]
    },

    {
        path: '**',
        redirectTo: '404'
    }
];