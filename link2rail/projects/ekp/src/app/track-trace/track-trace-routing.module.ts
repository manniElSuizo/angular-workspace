import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'wagonholder',
    loadChildren: () => import('./wagonholder/wagonholder.module').then(m => m.WagonholderModule),
    canActivate: []
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackTraceRoutingModule { }
