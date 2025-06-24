import { NgModule } from '@angular/core';
import { NewOrderCommercialComponent } from './new-order-commercial.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@src/app/shared/shared.module';
@NgModule(
  {
    declarations: [
      NewOrderCommercialComponent
    ],
    imports: [
    SharedModule,
    ReactiveFormsModule
],
    exports: [
      NewOrderCommercialComponent
    ]

  })
export class NewOrderCommercialModule { }
