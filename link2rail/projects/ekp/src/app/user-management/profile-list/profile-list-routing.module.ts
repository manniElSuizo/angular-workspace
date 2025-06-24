import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileListComponent } from './profile-list.component';
import { DBUIElementsModule } from '@db-ui/ngx-elements-enterprise/dist/lib';

const routes: Routes = [
  {
    path: '',
    component: ProfileListComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DBUIElementsModule
  ],
  exports: [RouterModule]
})
export class ProfileListRoutingModule { }
