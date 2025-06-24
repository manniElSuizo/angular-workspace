import { NgModule } from '@angular/core';
import { UserGroupListComponent } from './user-group-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from '@src/app/shared/shared.module';
import { UserGroupListRoutingModule } from './user-group-list-routing.module';
import { FormDialogModule } from '@src/app/shared/components/form-dialog/form-dialog.module';

@NgModule({
  declarations: [
    UserGroupListComponent,
  ],
  imports: [
    SharedModule,
    UserGroupListRoutingModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule ,
    FormDialogModule
  ],
  exports: [
    UserGroupListComponent
  ],

})
export class UserGroupListModule { }
