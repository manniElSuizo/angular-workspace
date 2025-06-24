import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: 'empty-wagon-order-list', pathMatch: 'prefix'},
    {
        path: 'empty-wagon-order-list',
        loadChildren: () => import('./order/components/order-overview/order-overview.module').then(m => m.OrderOverviewModule)
    },
    {
        path: 'empty-wagon-template-list',
        loadChildren: () => import('./template/components/template-overview/template-overview.module').then(m => m.TemplateOverviewModule)
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmptyWagonRoutingModule {

}