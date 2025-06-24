import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { PermissionService } from '../permission/PermissionService';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const permissionService: PermissionService = inject(PermissionService);
  return permissionService.loadPermissions4User();
};
