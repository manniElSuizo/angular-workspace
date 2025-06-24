import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WagonholderRoutingModule } from './wagonholder-routing.module';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '@src/app/shared/shared.module';
/*import { WagonholderComponent } from './wagonholder/wagonholder.component';*/
import { WagonholderListComponent } from './wagonholderlist/wagonholder-list.component';
import { WagonholderListFilterComponent } from "./wagonholderlist/wagonholder-list-filter/wagonholder-list-filter.component";
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';

@NgModule({
  declarations: [
    WagonholderListComponent,
    WagonholderListFilterComponent
  ],
  imports: [
    CommonModule,
    WagonholderRoutingModule,
    FormDialogModule,
    SharedModule,
],
  providers: [
    TranslatePipe
  ],
  exports: [
    /*WagonholderComponent*/
    WagonholderListComponent
  ]

})
export class WagonholderModule { }
