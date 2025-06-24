import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WagonholderListComponent } from './wagonholderlist/wagonholder-list.component';
const routes: Routes = [
    {path: 'list',
    component: WagonholderListComponent,
    pathMatch: 'prefix',
    canActivate: []}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WagonholderRoutingModule { }
