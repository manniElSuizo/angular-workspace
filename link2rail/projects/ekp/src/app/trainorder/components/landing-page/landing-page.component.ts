import { Component, OnInit } from '@angular/core';
import { PermissionType } from '@src/app/trainorder/models/permission';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})

export class LandingPageComponent implements OnInit {
    permissionType = PermissionType;
    protected loadingInProgress = true;
    constructor(
        public permissionService: PermissionService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.loadingInProgress = false;
    }
}
