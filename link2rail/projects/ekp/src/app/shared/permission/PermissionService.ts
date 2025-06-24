import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import { ApiUrls } from '@src/app/shared/enums/api-urls.enum';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {
    Authorization,
    AuthorizationMapping,
    AuthorizationResponse,
    AUTHORIZATIONS_TM,
    CustomerData
} from '@src/app/trainorder/models/authorization';
import {EnvService} from '../services/env/env.service';
import {LocalStorageService} from '../services/local-storage/local-storage.service';
import {ModalWindows} from '../components/modal-windows/modal-windows';
import {ErrorDialogService} from '../error-handler/service/api-error-dialog.service';

@Injectable({
    providedIn: 'root',
})
export class PermissionService {
    backendUrl: string;
    private immediateAuthorizations: Authorization[];
    /**
     * for customers: join all permissions of all profiles
     * to use in modules outside TM
     */
    private customerAllAuthorizations: Authorization[];
    private customerProfiles: CustomerData[];
    private activeProfiles: CustomerData[];
    private tMUser: boolean = false;
    loadingInitiated: boolean = false;
    permissionsInitialized: boolean = false;

    private permissionLoadSubj: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private permissionChangeSubj: BehaviorSubject<Authorization[]> = new BehaviorSubject<Authorization[]>(null);

    private errorDialogService: ErrorDialogService = inject(ErrorDialogService);

    constructor(
        private httpClient: HttpClient,
        private env: EnvService,
        public router: Router,
        private modalWindows: ModalWindows,
        private storageService: LocalStorageService
    ) {
        this.backendUrl = this.env.backendUrl;
        if (typeof this.backendUrl == 'undefined' || this.backendUrl == null) {
            console.info("no environment setting for backendUrl found!");
        }
    }

    public permissionLoad(): BehaviorSubject<boolean> {
        return this.permissionLoadSubj;
    }

    public permissionChange(): BehaviorSubject<Authorization[]> {
        return this.permissionChangeSubj;
    }

    public resetPermissions4User(): void {
        this.loadingInitiated = false;
        this.permissionsInitialized = false;
        this.immediateAuthorizations = [];
        this.customerProfiles = [];
        this.customerAllAuthorizations = [];
        this.tMUser = false;
        this.loadPermissions4User();
    }

    public loadPermissions4User(): Observable<boolean> {
        const observable = new Observable<boolean>((subscriber) => {
            this.requestPermissions().subscribe({
                next: (authResponse: AuthorizationResponse) => {
                    this.storageService.setUsername(authResponse?.username);
                    this.immediateAuthorizations = [];
                    this.customerProfiles = [];
                    this.customerAllAuthorizations = [];

                    authResponse?.authorization.forEach(a => {
                        this.immediateAuthorizations.push(a);
                        this.customerAllAuthorizations.push(a);
                    });

                    authResponse?.profiles.forEach(p => {
                        this.customerProfiles.push(p);

                        p.authorization.forEach(r => {
                            this.customerAllAuthorizations.includes(r) ? '' : this.customerAllAuthorizations.push(r);
                        });
                    });

                    if (this.customerAllAuthorizations.length && this.customerAllAuthorizations.some(el => AUTHORIZATIONS_TM?.includes(el))) {
                        this.tMUser = true;
                    }

                    if (this.customerProfiles != null) {
                        this.storageService.setCustomerProfiles(this.customerProfiles);
                        this.storageService.setCustomerAllAuthorizations(this.customerAllAuthorizations);
                    }

                    this.permissionsInitialized = true;
                    this.storageService.setImmediateAuthorizations(this.immediateAuthorizations, true);
                    this.permissionLoadSubj.next(true);
                    subscriber.next(true);
                },
                error: e => {throw e;}
            })
        });
        return observable;
    }

    public setActiveProfiles(profiles: CustomerData[]): void {
        if (profiles && profiles.length > 0) {
            this.storageService.storeActiveProfiles(profiles);
            const authorizations: Authorization[] = [];
            profiles.forEach(p => authorizations.concat(p.authorization));
            this.permissionChangeSubj.next(authorizations);
        } else {
            this.storageService.removeActiveProfiles();
        }
    }

    public isTMUser(): boolean {
        return this.tMUser;
    }

    /**
     * Usage example without routerUrl in *.ts:
     *
     * Constructor:
     * constructor(..., permissionService: PermissionService, ...) {
     * ...
     * }
     *
     * in methods:
     * ...
     * this.permissionService.hasPermission(null, [Authorization.READ_TRACKING],
     * authorizationsOnElement).subscribe(isAllowed => { if(isAllowed) { CODE TO EXECUTE IF PERMISSION IS GRANTED
     *      } else {
     *          CODE TO EXECUTE IF PERMISSION IS NOT GRANTED
     *      }
     * });
     *
     * @param routeUrl
     * @param requiredAuthorizations
     * @param dynamicAuthorizations
     * @param url
     * @returns Observable<boolean>
     */
    public hasPermission(routeUrl: string | null, requiredAuthorizations?: Authorization[], dynamicAuthorizations?: Authorization[]): Observable<boolean> {

        if (!requiredAuthorizations) {
            requiredAuthorizations = AuthorizationMapping.mapFEUrl2AuthorizationFunction(routeUrl);
        }
        const currentPermissions = this.getCurrentPermissions(requiredAuthorizations);

        if (currentPermissions != null) {
            const granted = this.getPermission(routeUrl, requiredAuthorizations, dynamicAuthorizations);
            return of(granted);
        }

        return new Observable<boolean>(observer => {
            this.permissionLoadSubj.subscribe((_) => {
                const granted = this.getPermission(routeUrl, requiredAuthorizations, dynamicAuthorizations);
                observer.next(granted);
                observer.complete();
            });
        });
    }

    private requestPermissions() {
        return this.httpClient.get<AuthorizationResponse>(this.backendUrl + ApiUrls.AUTHORIZATION);
        // const authResponse = PermissionsMock.getDummyAuthResponse();
        // return of(authResponse);
    }

    private getPermission(routeUrl: string | null, requiredAuthorizations?: Authorization[], dynamicAuthorizations?: Authorization[]): boolean {
        let requiredAuthFunctions: Authorization[] = [];
        if (routeUrl) {
            requiredAuthFunctions = AuthorizationMapping.mapFEUrl2AuthorizationFunction(routeUrl);
        } else if (requiredAuthorizations) {
            requiredAuthFunctions = requiredAuthorizations;
        } else {
            return true;
        }
        const hasPermission = requiredAuthFunctions.some(el => this.getCurrentPermissions(requiredAuthFunctions)
                                                                   ?.includes(el));

        const hasDynamicPermission = requiredAuthFunctions.some(el => dynamicAuthorizations?.includes(el));
        return hasPermission || hasDynamicPermission;
    }

    private getCurrentPermissions(requiredAuthorizations: Authorization[]): Authorization[] | null {

        let currentPermissions: Authorization[] = [];
        if (!this.immediateAuthorizations) {
            const ia = this.storageService.getImmediateAuthorizations();

            if (ia == null) return ia;

            this.immediateAuthorizations = ia;
        }

        currentPermissions.push(...this.immediateAuthorizations);

        if (!this.customerProfiles) {
            const cp = this.storageService.getCustomerProfiles();
            if (cp != null) {
                this.customerProfiles = cp;
            }
        }
        if (AUTHORIZATIONS_TM.some(el => requiredAuthorizations?.includes(el))) {
            const ap = this.storageService.getActiveProfiles();
            this.activeProfiles = ap && ap != null ? ap : [];
            this.activeProfiles.forEach(profile => currentPermissions.push(...profile.authorization));
        } else {
            this.storageService.getcustomerAllAuthorizations()?.forEach(el => currentPermissions.push(el));
        }

        const authorizations = [...new Set(currentPermissions)];
        return authorizations;
    }

    public showDeniedError() {
        this.modalWindows.openErrorDialog({text: "Permission denied"});
        setTimeout(() => {
            this.modalWindows.closeAllModalWindows();
            this.router.navigate(['gzp', 'trainorder', 'home']);
        }, 2000);
    }

    public hasDynamicPermission(dynamicAuthorizations: Authorization[], requiredAuthorizations: Authorization[]): boolean {
        return requiredAuthorizations.some(el => dynamicAuthorizations.includes(el));
    }

    public isInternalUser(): Observable<boolean> {
        return this.hasPermission(null, [Authorization.READ_ALL_PROFILES]);
    }

    public isAdmin(): Observable<boolean> {
        return this.hasPermission(null, [Authorization.CREATE_USERMANAGEMENT]);
    }
}
