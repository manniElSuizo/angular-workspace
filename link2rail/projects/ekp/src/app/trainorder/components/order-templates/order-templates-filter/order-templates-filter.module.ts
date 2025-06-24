import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { OrderTemplatesFilterComponent } from './order-templates-filter.component';
import { TrainorderPipesModule } from '@src/app/trainorder/pipes/trainorder-pipes.module';
import { ElSAutocompleteModule } from '@src/app/shared/components/form-dialog/el-s-autocomplete/el-s-autocomplete.module';

@NgModule({
  declarations: [
    OrderTemplatesFilterComponent,
  ],
  exports: [
    OrderTemplatesFilterComponent,
  ],
  imports: [
    SharedModule,
    TrainorderPipesModule,
    ElSAutocompleteModule
  ]
})
export class OrderTemplatesFilterModule {

}
