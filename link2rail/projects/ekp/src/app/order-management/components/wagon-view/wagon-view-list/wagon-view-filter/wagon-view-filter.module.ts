import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { WagonViewFilterComponent } from './wagon-view-filter.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';
import { OverviewFilterControlPanelComponent } from '@src/app/shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component';

@NgModule({
  declarations: [
    WagonViewFilterComponent
  ],
  imports: [
    SharedModule,
    FormDialogModule,
    OverviewFilterControlPanelComponent
  ],
  exports: [
    WagonViewFilterComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class WagonViewFilterModule {

}
