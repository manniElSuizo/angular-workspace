import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrderDetailsComponent } from './order-details.component';
import { TrainorderPipesModule } from '@src/app/trainorder/pipes/trainorder-pipes.module';

@NgModule({
  declarations: [
    OrderDetailsComponent,
  ],
  exports: [
    OrderDetailsComponent,
  ],
  imports: [
    SharedModule,
    TrainorderPipesModule
  ]
})
export class OrderDetailsModule {

}
