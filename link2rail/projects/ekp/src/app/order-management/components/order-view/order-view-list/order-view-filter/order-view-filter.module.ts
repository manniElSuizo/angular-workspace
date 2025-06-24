import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderViewFilterComponent } from './order-view-filter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@src/app/shared/shared.module';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { OverviewFilterControlPanelComponent } from '@src/app/shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component';


@NgModule({
  declarations: [
    OrderViewFilterComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormDialogModule,
    OverviewFilterControlPanelComponent

  ],
  exports: [
    OrderViewFilterComponent
  ]
})
export class OrderViewFilterModule { }
