import {ComponentType} from "@angular/cdk/portal";
import {Injectable} from "@angular/core";
import {DialogPosition, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {take} from "rxjs/operators";
import {TrackingHistoryComponent} from "../tracking-history/tracking-history.component";
import {TrainDetailsComponent} from "../train-details/train-details.component";
import {ConfirmationDisplayComponent} from "../confirmation-display/confirmation-display.component";
import { ConfirmationComponent } from "../confirmations/confirmation.component";
import { ConfirmationOrderTemplateComponent } from "../confirmations/confirmation-order-template/confirmation-order-template.component";
import { ErrorDialogComponent } from "../api-error/api-error.component";
import { FileUploadComponent } from "../file-upload/file-upload.component";
import { ErrorData } from "../api-error/ErrorData";
import { ApiInfoComponent } from "../api-info/api-info.component";
import { TrainRemarksComponent } from "@src/app/trainorder/train-remarks/train-remarks.component";
import { VehicleDetailsComponent } from "../vehicle-details/vehicle-details.component";
import { NewOrderComponent } from "@src/app/trainorder/components/new-order/new-order.component";
import { NhmCodeDetailsComponent } from "@src/app/trainorder/components/order/nhm-code-details/nhm-code-details.component";
import { NewOrderTemplateComponent } from "@src/app/trainorder/components/order-templates/new-order-template/new-order-template.component";
import { OrderDetailsModalComponent } from "@src/app/trainorder/components/order/order-details-modal/order-details-modal.component";
import { OrderTemplateDetailsComponent } from "@src/app/trainorder/components/order-templates/order-template-details/order-template-details.component";
import { DeleteOrderTemplateDialogComponent } from "@src/app/trainorder/components/order-templates/delete-order-template-dialog/delete-order-template-dialog.component";
import { TrackingHistoryWagonComponent } from "../tracking-history-wagon/tracking-history-wagon.component";
import { RailorderSummaryComponent } from "@src/app/trainorder/components/railorder-summary/railorder-summary.component";
import { SystemInformationComponent } from "@src/app/system-information/system-information.component";

@Injectable()
export class ModalWindows {
    modalWindows: Map<any, MatDialogRef<any>> = new Map();


    constructor(private dialog: MatDialog) { }

    /**
     * Opens modal window
     * @param modalComponent any component, that is used for modal window
     * @param data any data for modal window (f.e. tracking history)
     */
    openModalWindow(modalComponent: ComponentType<
                                    NewOrderComponent |
                                    TrackingHistoryComponent |
                                    TrainDetailsComponent |
                                    NhmCodeDetailsComponent |
                                    NewOrderTemplateComponent |
                                    ConfirmationComponent |
                                    OrderDetailsModalComponent |
                                    OrderTemplateDetailsComponent |
                                    TrainRemarksComponent |
                                    VehicleDetailsComponent |
                                    TrackingHistoryWagonComponent |
                                    RailorderSummaryComponent |
                                    SystemInformationComponent>, data?: any, width: number = 1000, height?: []): MatDialogRef<any> {
        const scrollPosition = document.body.getBoundingClientRect().y;
        let config = {};
        config = { data: data, width: width + 'px' };
        if (height) {
            config = { data: data, width: width + 'px', height: height + 'px' };
        }
        const ref = this.dialog.open(modalComponent, config);
        this.modalWindows.set(modalComponent, ref);

        this.modalWindows.forEach((value: MatDialogRef<any>, key: any) => {
            value.afterClosed().pipe(take(1)).subscribe(() => {
                window.scrollTo(0, -scrollPosition);
            });
        });
        return ref;
    }

    openModalWindowNewOrderTemplate(data?: any): MatDialogRef<NewOrderTemplateComponent> {
        const scrollPosition = document.body.getBoundingClientRect().y;

        let config: MatDialogConfig;
        const position: DialogPosition = {};
        config = { data: data, position: position, width: '1000px' };
        const ref = this.dialog.open(NewOrderTemplateComponent, config);
        this.modalWindows.set(NewOrderTemplateComponent, ref);

        document.querySelectorAll<HTMLElement>('mat-dialog-container').forEach(element => {
            // element.style.height = '90vh';
            // element.style.marginTop = '5vh';
        });

        // document.body.classList.add("block-scroll"); // Block background scroll when modal window is opened
        this.modalWindows.forEach((value: MatDialogRef<any>, key: any) => {
            value.afterClosed().pipe(take(1)).subscribe(() => {
                // document.body.classList.remove("block-scroll"); // Remove scroll block when modal window is closed
                window.scrollTo(0, -scrollPosition);
                // document.body.style.top = 0 + 'px';
            });
        });
        // document.body.style.top = -scrollPosition + 'px';
        return ref;
    }

    public openConfirmationDialogTemplateDeletion(templateId: string): MatDialogRef<any> {
        console.log(`open dialog for template deletion ${templateId}`);
        const ref = this.dialog.open(DeleteOrderTemplateDialogComponent, {
            data: templateId
        });
        this.modalWindows.set(DeleteOrderTemplateDialogComponent, ref);

        return ref;
    }

    public openConfirmationDialog(text: string, seconds: number): MatDialogRef<ConfirmationDisplayComponent> {
        console.log(`open confirmation dialog`);
        const ref = this.dialog.open(ConfirmationDisplayComponent, {data: text});
        this.modalWindows.set(ConfirmationDisplayComponent, ref);
        setTimeout(() => this.closeAllModalWindows(), seconds * 1000);
        return ref;
    }

    openModalWindowConfirmation(artOfForm: string): void {
        let config: MatDialogConfig;
        const data: DialogPosition = { top: '30vh' };
        config = { position: data, width: '400px', height: '250px' };
        if(artOfForm == "newOrderTemplate") {
            const myModal = this.dialog.open(ConfirmationOrderTemplateComponent, config);
        } else {
            const myModal = this.dialog.open(ConfirmationComponent, config);
        }
        const scrollPosition = window.pageYOffset;
    }

    openModalWindowFileUpload(): void {
        let config: MatDialogConfig;
        const data: DialogPosition = { top: '30vh' };
        config = { position: data, width: '400px', height: '275px' };
        const myModal = this.dialog.open(FileUploadComponent, config);
        this.modalWindows.set(FileUploadComponent, myModal);

        const scrollPosition = window.pageYOffset;
    }


    public openErrorDialog(data: ErrorData) {
        this.modalWindows.set(ErrorDialogComponent, this.dialog.open(ErrorDialogComponent, {data: data}));
    }

    public openInfoDialog(data: ErrorData) {
        this.modalWindows.set(ApiInfoComponent, this.dialog.open(ApiInfoComponent, {data: data}));
    }

    closeAllModalWindows() {
        this.modalWindows.forEach((value: MatDialogRef<any>, key: any) => {
            console.log(value);
            value.close();
        });
    }
}
