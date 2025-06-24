import { NgModule } from '@angular/core';
import { NewOrderConsignorConsigneeComponent } from './new-order-consignor-consignee.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputFieldModule } from '@src/app/shared/components/form-dialog/input-field/input-field.module';
import { SelectFieldModule } from '@src/app/shared/components/form-dialog/select-field/select-field.module';



@NgModule({
  declarations: [
    NewOrderConsignorConsigneeComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    InputFieldModule,
    SelectFieldModule
],
  exports: [
    NewOrderConsignorConsigneeComponent,
  ]

})
export class NewOrderConsignorConsigneeModule {

}
