import {RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {invoiceOverviewRoutes} from "./invoice-overview.routes";

@NgModule({
    imports: [RouterModule.forChild(invoiceOverviewRoutes)],
    exports: [RouterModule]
})
export class InvoiceOverviewModule {
}