import { NgModule } from '@angular/core';
import { CustomerGroupListComponent } from './customer-group-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from '@src/app/shared/shared.module';
import { CustomerGroupListRoutingModule } from './customer-group-list-routing.module';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';

@NgModule({
  declarations: [
    CustomerGroupListComponent,
  ],
  imports: [
    SharedModule,
    CustomerGroupListRoutingModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule ,
    FormDialogModule
  ],
  exports: [
    CustomerGroupListComponent
  ],

})
export class CustomerGroupListModule { }
