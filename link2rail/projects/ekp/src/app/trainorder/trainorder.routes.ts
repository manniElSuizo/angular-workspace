import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'prefix' },
  { path: 'trains-week-view', loadChildren: () => import('./components/week-view/week-view.module').then(m => m.WeekViewModule) },
  { path: 'trains-month-view', loadChildren: () => import('./components/month-view/month-view.module').then(m => m.MonthViewModule) },
  { path: 'trains-list-view', loadChildren: () => import('./components/list-view/list-view.module').then(m => m.ListViewModule) },
  { path: 'order', loadChildren: () => import('./components/order/order.module').then(m => m.OrderModule) },
  { path: 'order-templates', loadChildren: () => import('./components/order-templates/order-template.module').then(m => m.OrderTemplateModule) },
  { path: 'home', loadChildren: () => import('./components/landing-page/landing-page.module').then(m => m.LandingPageModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainorderRoutingModule { }
