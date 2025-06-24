import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "@src/app/shared/shared.module";
import { MonthViewComponent } from "./month-view.component";
import { MonthFilterComponent } from "./month-filter/month-filter.component";
import { monthViewRoutes } from "./month-view.routes";
import { PopupMenuModule } from "@src/app/shared/components/popup-menu/popup-menu.module";
import { TrainorderPipesModule } from "../../pipes/trainorder-pipes.module";

@NgModule({
  declarations: [
    MonthViewComponent,
    MonthFilterComponent
  ],
  imports: [
    RouterModule.forChild(monthViewRoutes),
    ReactiveFormsModule,
    SharedModule,
    PopupMenuModule,
    TrainorderPipesModule
  ],
  exports: [
    MonthViewComponent
  ]
})
export class MonthViewModule {

}
