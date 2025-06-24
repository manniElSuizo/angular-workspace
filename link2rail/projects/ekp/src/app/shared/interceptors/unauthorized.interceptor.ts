import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError, Observable, of } from "rxjs";
import { PermissionService } from "../permission/PermissionService";
import { inject } from "@angular/core";
import { ErrorDialogService } from "../error-handler/service/api-error-dialog.service";
import { CARGO_AUTH_CONFIG } from "../auth/auth.service";

export class UnauthorizedInterceptor implements HttpInterceptor {
    private permissionService: PermissionService = inject(PermissionService);
    private apiErrorDialogService = inject(ErrorDialogService);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(catchError((error) => {
            if (error.status === 401) {
                if(this.permissionService.permissionsInitialized) {
                    this.apiErrorDialogService.openApiErrorDialog(error, () => document.location.href = CARGO_AUTH_CONFIG.loginRedirectUri);
                    return of();
                }
                console.warn('Unauthorized access detected. Redirecting to login...');
                document.location.href = CARGO_AUTH_CONFIG.loginRedirectUri;
                return of();
            }
            throw error;
        }));
    }
}