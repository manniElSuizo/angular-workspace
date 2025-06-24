import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrdersListComponent } from './orders-list.component';
import { OrderFilterModule } from '../order-filter/order-filter.module';
import { orderListRoutes } from './order-list.routes';
import { RouterModule } from '@angular/router';
import { TrainorderPipesModule } from '@src/app/trainorder/pipes/trainorder-pipes.module';

@NgModule({
  declarations: [
    OrdersListComponent,
  ],
  exports: [
    OrdersListComponent,
  ],
  imports: [
    RouterModule.forChild(orderListRoutes),
    OrderFilterModule,
    SharedModule,
    TrainorderPipesModule
  ]
})
export class OrderListModule {

}
