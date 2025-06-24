import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { GoodsInformationListComponent } from './goods-information-list.component';
import { AutocompleteModule } from '@src/app/shared/components/form-dialog/autocomplete/autocomplete.module';

@NgModule({
  declarations: [
    GoodsInformationListComponent
  ],
  imports: [
    ReactiveFormsModule,
    SharedModule
],
  exports: [
    GoodsInformationListComponent
  ]
})
export class GoodsInformationListModule { }