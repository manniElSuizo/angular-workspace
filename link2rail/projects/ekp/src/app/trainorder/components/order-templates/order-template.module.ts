import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrderTemplatesListModule } from './order-templates-list/order-templates-list.module';
import { orderTemplateRoutes } from './order-template.routes';
import { RouterModule } from '@angular/router';
import { TrainorderPipesModule } from '../../pipes/trainorder-pipes.module';

@NgModule({
  imports: [
    RouterModule.forChild(orderTemplateRoutes),
    OrderTemplatesListModule,
    SharedModule,
    TrainorderPipesModule
  ]
})
export class OrderTemplateModule {

}
