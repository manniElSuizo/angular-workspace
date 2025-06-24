import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../shared/permission/PermissionGuard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'user-list' },
  { path: 'user-list', loadChildren: () => import('./user-list/user-list.module').then(m => m.UserListModule), canActivate: [PermissionGuard] },
  { path: 'user-group-list', loadChildren: () => import('./user-group-list/user-group-list.module').then(m => m.UserGroupListModule), canActivate: [PermissionGuard] },
  { path: 'profile-list', loadChildren: () => import('./profile-list/profile-list.module').then(m => m.ProfileListModule), canActivate: [PermissionGuard] },
  { path: 'authorization-matrix', loadChildren: () => import('./authorization-matrix/authorization-matrix.module').then(m => m.AuthorizationMatrixModule), canActivate: [PermissionGuard] },
  { path: 'customer-group-list', loadChildren: () => import('./customer-group-list/customer-group-list.module').then(m => m.CustomerGroupListModule), canActivate: [PermissionGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
