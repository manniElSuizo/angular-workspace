import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TemplateOverviewComponent} from "./template-overview.component";
import {SharedModule} from "../../../../shared/shared.module";
import {ReactiveFormsModule} from "@angular/forms";
import {FormDialogModule} from "../../../../shared/components/form-dialog/form-dialog.module";
import {RouterModule} from "@angular/router";
import {templateOverviewRoutes} from "./template-overview.routes";
import {PopupMenuModule} from "../../../../shared/components/popup-menu/popup-menu.module";
import {MatDialogModule} from "@angular/material/dialog";
import {TemplateOverviewResultsComponent} from "./template-overview-results/template-overview-results.component";

import {MatTooltipModule} from "@angular/material/tooltip";
import {TemplateOverviewFilterComponent} from "./template-overview-filter/template-overview-filter.component";
import { AutocompleteModule } from '@src/app/shared/components/form-dialog/autocomplete/autocomplete.module';
import {
    OverviewFilterControlPanelComponent
} from "../../../../shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component";
import {
    OverviewResultControlPanelComponent
} from "../../../../shared/components/overviews/overview-result-control-panel/overview-result-control-panel.component";

@NgModule({
    declarations: [
        TemplateOverviewComponent,
        TemplateOverviewFilterComponent,
        TemplateOverviewResultsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        FormDialogModule,
        MatDialogModule,
        RouterModule.forChild(templateOverviewRoutes),
        PopupMenuModule,
        OverviewFilterControlPanelComponent,
        OverviewResultControlPanelComponent,
        MatTooltipModule,
        AutocompleteModule
    ],
    exports: [
        TemplateOverviewComponent,
        TemplateOverviewFilterComponent,
        TemplateOverviewResultsComponent
    ]

})
export class TemplateOverviewModule {
}
