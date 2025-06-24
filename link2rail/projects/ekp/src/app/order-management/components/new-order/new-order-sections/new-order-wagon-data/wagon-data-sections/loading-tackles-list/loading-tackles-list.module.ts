import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingTacklesListComponent } from './loading-tackles-list.component';
import { NumericInputModule } from '@src/app/shared/components/form-dialog/numeric-input/numeric-input.module';

@NgModule({
  declarations: [
    LoadingTacklesListComponent
  ],
  imports: [
    ReactiveFormsModule, 
    SharedModule,
    NumericInputModule
  ],
  exports: [
    LoadingTacklesListComponent
  ]
})
export class LoadingTacklesListModule { }