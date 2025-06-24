import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'wagon-view-list', pathMatch: 'prefix' },
  { path: 'wagon-view-list', loadChildren: () => import('./components/wagon-view/wagon-view-list/wagon-view-list.module').then(m => m.WagonViewListModule) },
  { path: 'new-order-main', loadChildren: () => import('./components/new-order/new-order-main/new-order-main.module').then(m => m.NewOrderMainModule) },
  { path: 'order-management-order-list', loadChildren: () => import('./components/order-view/order-view-list/order-view-list.module').then(m => m.OrderViewListModule) },
  { path: 'order-management-order-code-list', loadChildren: () => import('./components/order-code-view/order-code-view-list/order-code-view-list.module').then(m => m.OrderCodeViewListModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderManagementRoutingModule { }