import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, inject, Injectable, NgZone } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ErrorDialogService } from "./service/api-error-dialog.service";
import { GenericErrorComponent } from "./generic-error/generic-error.component";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private modalWindowRef: MatDialogRef<GenericErrorComponent> = null;
    private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);
    
    constructor(private ngZone: NgZone) { }

    handleError(error: any) {
        if (error instanceof HttpErrorResponse) {
            try {
                this.ngZone.run(() => {
                    if (!this.modalWindowRef) {
                        this.modalWindowRef = this.apiErrorDialogService.openApiErrorDialog(error);
                        this.modalWindowRef.afterClosed().subscribe({
                            next: () => this.modalWindowRef = null
                        });
                    }
                });
            } catch (err) {
                console.error(err);
            }
        }
        console.error(error);
    }

    public closeErrorWindow() {
        if (this.modalWindowRef) { this.modalWindowRef.close(); }
    }
}