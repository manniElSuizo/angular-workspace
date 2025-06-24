
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PermissionService } from './PermissionService';

@Injectable({
    providedIn: 'root',
})
export class PermissionGuard implements CanActivate {

    constructor(public router: Router, private permissionService: PermissionService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean> {
        if (route.url.length)
            return this.permissionService.hasPermission(route.url[route.url.length - 1].path);
        return of(false);
    }
}