import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {path: '', redirectTo: 'invoice-overview', pathMatch: 'prefix'},
    {
        path: 'invoice-overview',
        loadChildren: () => import('./components/invoice-overview/invoice-overview.module').then(m => m.InvoiceOverviewModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InvoiceRoutingModule {

}