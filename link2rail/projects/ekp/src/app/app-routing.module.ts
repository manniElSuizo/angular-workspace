import { NgModule } from '@angular/core';
import { ErrorComponent } from './shared/error/error.component';
import { RouterModule, Routes } from '@angular/router';
import {
    TrackingHistoryWagonComponent
} from './shared/components/tracking-history-wagon/tracking-history-wagon.component';
import { authGuard } from './shared/auth/auth.guard';

const routes: Routes = [
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'gzp/trainorder', pathMatch: 'full' },
            {
                path: 'gzp/trainorder',
                loadChildren: () => import('./trainorder/trainorder.module').then(m => m.TrainorderModule)
            },
            {
                path: 'track-trace',
                loadChildren: () => import('./track-trace/track-trace.module').then(m => m.TrackTraceModule),
            },
            {
                path: 'empty-wagon',
                loadChildren: () => import('./empty-wagon/empty-wagon.module').then(m => m.EmptyWagonModule),
            },
            {
                path: 'invoice',
                loadChildren: () => import('./invoice/invoice.module').then(m => m.InvoiceModule),
            },
            {
                path: 'order-management',
                loadChildren: () => import('./order-management/order-management.module').then(m => m.OrderManagmentModule),
            },
            {
                path: 'customer-portal/neworder',
                loadChildren: () => import('./order-management/order-management.module').then(m => m.OrderManagmentModule),
            },
            {
                path: 'customer-portal/wagonview',
                loadChildren: () => import('./order-management/order-management.module').then(m => m.OrderManagmentModule),
            },

            {
                path: 'customer-portal/example',
                loadChildren: () => import('./order-management/order-management.module').then(m => m.OrderManagmentModule),
            },
            {
                path: 'user-management',
                loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
            },
            {
                path: 'trackingHistoryWagon',
                component: TrackingHistoryWagonComponent,
            },
        ]
    },
    {
        path: 'gzp/error/:code',
        component: ErrorComponent,
    },
    {
        path: '**',
        redirectTo: '/gzp/error/404'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {})],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
