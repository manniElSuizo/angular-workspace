import { NgModule } from '@angular/core';
import { CustomerSelectComponent } from './customer-select.component';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [
    CustomerSelectComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    CustomerSelectComponent
  ]        
})
export class CustomerSelectModule {

}