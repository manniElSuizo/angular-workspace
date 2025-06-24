import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderOverviewComponent} from "./order-overview.component";
import {SharedModule} from "../../../../shared/shared.module";
import {ReactiveFormsModule} from "@angular/forms";
import {FormDialogModule} from "../../../../shared/components/form-dialog/form-dialog.module";
import {RouterModule} from "@angular/router";
import {orderOverviewRoutes} from "./order-overview.routes";
import {PopupMenuModule} from "../../../../shared/components/popup-menu/popup-menu.module";
import {MatDialogModule} from "@angular/material/dialog";
import {OrderOverviewFilterComponent} from "./order-overview-filter/order-overview-filter.component";
import {OrderOverviewResultsComponent} from "./order-overview-results/order-overview-results.component";

import {MatTooltipModule} from "@angular/material/tooltip";
import {
    OverviewFilterControlPanelComponent
} from "../../../../shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component";
import {
    OverviewResultControlPanelComponent
} from "../../../../shared/components/overviews/overview-result-control-panel/overview-result-control-panel.component";

@NgModule({
    declarations: [
        OrderOverviewComponent,
        OrderOverviewFilterComponent,
        OrderOverviewResultsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        FormDialogModule,
        MatDialogModule,
        RouterModule.forChild(orderOverviewRoutes),
        PopupMenuModule,
        OverviewFilterControlPanelComponent,
        OverviewResultControlPanelComponent,
        MatTooltipModule
    ],
    exports: [
        OrderOverviewComponent,
        OrderOverviewFilterComponent,
        OrderOverviewResultsComponent
    ]

})
export class OrderOverviewModule {
}
