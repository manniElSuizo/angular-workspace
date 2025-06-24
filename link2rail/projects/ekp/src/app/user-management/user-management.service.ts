import { Observable } from "rxjs";
import { PermissionService } from "../shared/permission/PermissionService";
import { Authorization } from "../trainorder/models/authorization";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(private permissionService: PermissionService) { 
  }

  public hasReadPermission(): Observable<boolean> {
    return this.permissionService.hasPermission(null, [Authorization.READ_USERMANAGEMENT]);
  }

  public hasCreatePermission(): Observable<boolean> {
    return this.permissionService.hasPermission(null, [Authorization.CREATE_USERMANAGEMENT]);
  }

  public hasUpdatePermission(): Observable<boolean> {
    return this.permissionService.hasPermission(null, [Authorization.UPDATE_USERMANAGEMENT]);
  }

  public hasDeletePermission(): Observable<boolean> {
    return this.permissionService.hasPermission(null, [Authorization.DELETE_USERMANAGEMENT]);
  }

  public hasChangeAuthPermission(): Observable<boolean> {
    return this.permissionService.hasPermission(null, [Authorization.CHANGE_USER_AUTH]);
  }
}
