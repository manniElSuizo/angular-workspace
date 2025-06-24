import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerReferenceComponent } from './customer-reference.component';

@NgModule({
  declarations: [
    CustomerReferenceComponent
  ],
  imports: [
    ReactiveFormsModule, 
    SharedModule
  ],
  exports: [
    CustomerReferenceComponent
  ]
})
export class CustomerReferenceModule { }