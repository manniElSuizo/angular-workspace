import { NgModule } from '@angular/core';
import { NewOrderServiceComponent } from './new-order-service.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '@src/app/shared/shared.module';
@NgModule({
  declarations: [
    NewOrderServiceComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatDialogModule
],
  exports: [
    NewOrderServiceComponent
  ]

})
export class NewOrderServiceModule { }
