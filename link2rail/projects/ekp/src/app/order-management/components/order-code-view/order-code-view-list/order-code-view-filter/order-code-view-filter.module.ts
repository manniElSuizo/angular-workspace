import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderCodeViewFilterComponent } from './order-code-view-filter.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiselectAutocompleteModule } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.module';
import { OverviewFilterControlPanelComponent } from '@src/app/shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component';

@NgModule({
  declarations: [
    OrderCodeViewFilterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MultiselectAutocompleteModule,
    OverviewFilterControlPanelComponent
  ],
  exports:[
    OrderCodeViewFilterComponent
  ]
})
export class OrderCodeViewFilterModule { }
