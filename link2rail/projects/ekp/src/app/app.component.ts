import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { LocalStorageService } from './shared/services/local-storage/local-storage.service';
import { PermissionService } from './shared/permission/PermissionService';
import { TOASTER_ELEMENT_ID } from './shared/services/toaster/toaster.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

    @ViewChild('header', { static: false }) header!: HeaderComponent;
     
    protected title = 'Train Management';
    protected permissionsLoaded: boolean = false;
    protected toasterElementId = TOASTER_ELEMENT_ID;

    private storageService: LocalStorageService = inject(LocalStorageService);
    private permissionService: PermissionService = inject(PermissionService);

    constructor() {}
    
    ngOnInit(): void {
        this.permissionService.permissionLoad().subscribe({
            next: (b) => {
                this.permissionsLoaded = b;
            }
        });
    }
}
