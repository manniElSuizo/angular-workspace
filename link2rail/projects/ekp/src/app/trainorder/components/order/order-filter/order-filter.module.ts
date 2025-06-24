import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrderFilterComponent } from './order-filter.component';
import { OverviewFilterControlPanelComponent } from '@src/app/shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component';

@NgModule({
  declarations: [
    OrderFilterComponent,
  ],
  exports: [
    OrderFilterComponent,
  ],
  imports: [
    SharedModule,
    OverviewFilterControlPanelComponent
  ]
})
export class OrderFilterModule {

}
