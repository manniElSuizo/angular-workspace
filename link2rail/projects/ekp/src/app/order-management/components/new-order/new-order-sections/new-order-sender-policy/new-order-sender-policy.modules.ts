import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NewOrderSenderPolicyComponent } from './new-order-sender-policy.component';

@NgModule({
  declarations: [
    NewOrderSenderPolicyComponent
  ],
  imports: [
    ReactiveFormsModule,
    SharedModule

  ],
  exports: [
    NewOrderSenderPolicyComponent
  ]

})
export class NewOrderSenderPolicyModule { }
