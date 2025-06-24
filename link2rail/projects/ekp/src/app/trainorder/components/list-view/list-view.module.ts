import { NgModule } from "@angular/core";
import { ListViewComponent } from "./list-view.component";
import { RouterModule } from "@angular/router";
import { listViewRoutes } from "./list-view.routes";
import { ReactiveFormsModule } from "@angular/forms";
import { ListViewFilterComponent } from "./list-view-filter/list-view-filter.component";
import { SharedModule } from "@src/app/shared/shared.module";
import { TrainorderPipesModule } from "../../pipes/trainorder-pipes.module";
import { OverviewFilterControlPanelComponent } from '@src/app/shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component';
import { ElSAutocompleteModule } from "@src/app/shared/components/form-dialog/el-s-autocomplete/el-s-autocomplete.module";
@NgModule({
  declarations: [
    ListViewComponent,
    ListViewFilterComponent
  ],
  imports: [
    OverviewFilterControlPanelComponent,
    RouterModule.forChild(listViewRoutes),
    ReactiveFormsModule,
    SharedModule,
    TrainorderPipesModule,
    ElSAutocompleteModule
  ],
  exports: [
    ListViewComponent
  ]
})
export class ListViewModule {

}
