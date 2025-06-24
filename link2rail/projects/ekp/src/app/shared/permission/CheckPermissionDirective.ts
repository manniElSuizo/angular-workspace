import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionType } from '@src/app/trainorder/models/permission';
import { PermissionService } from './PermissionService';

@Directive({
    selector: '[appCheckPermissions]'
})
export class CheckPermissionsDirective implements OnInit {
    @Input() object: string;
    @Input() permissionType: PermissionType | undefined;

    constructor(private permissionService: PermissionService, private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) { }

    ngOnInit(): void {
        console.log("CheckPermissionsDirective.object:", this.object);
        console.log("CheckPermissionsDirective.permissionType:", this.permissionType);
        if (this.permissionService.hasPermission(this.object)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
