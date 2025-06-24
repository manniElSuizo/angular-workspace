import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrderTemplatesListComponent } from './order-templates-list.component';
import { OrderTemplatesFilterModule } from '../order-templates-filter/order-templates-filter.module';
import { TrainorderPipesModule } from '@src/app/trainorder/pipes/trainorder-pipes.module';

@NgModule({
  declarations: [
    OrderTemplatesListComponent,
  ],
  exports: [
    OrderTemplatesListComponent,
  ],
  imports: [
    SharedModule,
    TrainorderPipesModule,
    OrderTemplatesFilterModule
  ]
})
export class OrderTemplatesListModule {

}
