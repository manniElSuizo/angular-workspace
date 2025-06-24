import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { NewOrderTransportComponent } from './new-order-transport.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    NewOrderTransportComponent
  ],
  imports: [
    ReactiveFormsModule,
    SharedModule

  ],
  exports: [
    NewOrderTransportComponent
  ]

})
export class NewOrderTransportModule { }
