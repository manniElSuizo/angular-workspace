import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserGroupListComponent } from './user-group-list.component';

const routes: Routes = [
  {
    path: '',
    component: UserGroupListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserGroupListRoutingModule { }
