import { NgModule } from '@angular/core';
import { SharedModule } from '@src/app/shared/shared.module';
import { NewOrderWagonDataComponent } from './new-order-wagon-data.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GoodsInformationListModule } from './wagon-data-sections/goods-information-list/goods-information-list.module';
import { CustomerReferenceModule } from './wagon-data-sections/customer-reference/customer-reference.module';
import { SealingListModule } from './wagon-data-sections/sealing-list/sealing-list.module';
import { LoadingTacklesListModule } from './wagon-data-sections/loading-tackles-list/loading-tackles-list.module';
import { AuthorizationListModule } from './wagon-data-sections/authorization-list/authorization-list.module';
import { NewOrderWagonDetailDialogComponent } from './new-order-wagon-detail-dialog/new-order-wagon-detail-dialog.component';
import { NewOrderWagonImportDialogComponent } from './new-order-wagon-import-dialog/new-order-wagon-import-dialog.component';
import { ElSAutocompleteModule } from "../../../../../shared/components/form-dialog/el-s-autocomplete/el-s-autocomplete.module";

@NgModule({
  declarations: [
    NewOrderWagonDataComponent,
    NewOrderWagonDetailDialogComponent,
    NewOrderWagonImportDialogComponent
  ],
  imports: [
    ReactiveFormsModule,
    SharedModule,
    GoodsInformationListModule,
    GoodsInformationListModule,
    CustomerReferenceModule,
    SealingListModule,
    LoadingTacklesListModule,
    AuthorizationListModule,
    ElSAutocompleteModule
],
  exports: [
    NewOrderWagonDataComponent,
    NewOrderWagonDetailDialogComponent,
    NewOrderWagonImportDialogComponent
  ]
})
export class NewOrderWagonDataModule { }
