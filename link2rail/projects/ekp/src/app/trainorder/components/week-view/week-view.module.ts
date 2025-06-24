import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "@src/app/shared/shared.module";
import { WeekViewComponent } from "./week-view.component";
import { WeekViewFilterComponent } from "./week-view-filter/week-view-filter.component";
import { weekViewRoutes } from "./week-view.routes";
import { TrainorderPipesModule } from "../../pipes/trainorder-pipes.module";

@NgModule({
  declarations: [
    WeekViewComponent,
    WeekViewFilterComponent
  ],
  imports: [
    RouterModule.forChild(weekViewRoutes),
    ReactiveFormsModule,
    SharedModule,
    TrainorderPipesModule
  ],
  exports: [
    WeekViewComponent
  ]
})
export class WeekViewModule {

}
