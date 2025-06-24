import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { PickListModule } from '../shared/components/pick-list/pick-list.module';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteUserComponent } from './delete-user/delete-user.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DeleteUserComponent
  ],
  imports: [
    CommonModule,
    PickListModule,
    UserManagementRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ]
})
export class UserManagementModule { }
