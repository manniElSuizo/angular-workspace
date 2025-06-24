import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SealingListComponent } from './sealing-list.component';

@NgModule({
  declarations: [
    SealingListComponent
  ],
  imports: [
    ReactiveFormsModule, 
    SharedModule
  ],
  exports: [
    SealingListComponent
  ]
})
export class SealingListModule { }