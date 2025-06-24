import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerGroupListComponent } from './customer-group-list.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerGroupListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerGroupListRoutingModule { }
