import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizationMatrixComponent } from './authorization-matrix.component';
import { DBUIElementsModule } from '@db-ui/ngx-elements-enterprise/dist/lib';

const routes: Routes = [
  {
    path: '',
    component: AuthorizationMatrixComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DBUIElementsModule
  ],
  exports: [RouterModule]
})
export class AuthorizationMatrixRoutingModule { }
