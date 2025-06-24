import { NgModule } from '@angular/core';
import { UserListRoutingModule } from './user-list-routing.module';
import { UserListComponent } from './user-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from '@src/app/shared/shared.module';
import { RolesPipe } from '@src/app/shared/pipes/roles.pipe';

@NgModule({
  declarations: [
    UserListComponent,
    RolesPipe
  ],
  imports: [
    SharedModule,
    UserListRoutingModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule
  ],
  exports: [
    UserListComponent
  ],
  providers: [
    RolesPipe
  ]
})
export class UserListModule { }
