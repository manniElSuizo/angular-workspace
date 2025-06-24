import {Component, inject, Inject} from '@angular/core';
import {DBUIElementsModule} from "@db-ui/ngx-elements-enterprise/dist/lib";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {OrderService} from "../../services/order.service";
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {ErrorDialogService} from "../../../../shared/error-handler/service/api-error-dialog.service";

@Component({
    selector: 'app-cancel-data',
    standalone: true,
    imports: [
        DBUIElementsModule,
        FormsModule,
        TranslateModule,
        MatDialogClose
    ],
    templateUrl: './order-cancellation.component.html',
    styleUrl: './order-cancellation.component.scss'
})
export class OrderCancellationComponent {
    orderId: string;
    orderIdConsumer: string;

    constructor(
        private orderService: OrderService,
        private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService),
        private dialogRef: MatDialogRef<OrderCancellationComponent>,
        @Inject(MAT_DIALOG_DATA) data: any
    ) {
        console.log('OrderCreationComponent', data);
        this.orderIdConsumer = data.orderIdConsumer;
        this.orderId = data?.orderId;
    }

    cancelOrderByIdConsumer() {
        this.orderService.cancelOrderByIdConsumer(this.orderIdConsumer).subscribe({
            next: () => {
                console.log('canceled: ', this.orderIdConsumer);
                this.dialogRef.close(true);
            },
            error: err => {
                console.log('canceled: ', this.orderIdConsumer);
                this.dialogRef.close(false);
                this.apiErrorDialogService.openApiErrorDialog(err);
            }
        })
    }

    cancelOrdersByOrderId() {
        this.orderService.cancelOrdersByOrderId(this.orderId).subscribe({
            next: () => {
                console.log('canceled: ', this.orderId);
                this.dialogRef.close(true);
            },
            error: err => {
                console.log('canceled: ', this.orderId);
                this.dialogRef.close(false);
                this.apiErrorDialogService.openApiErrorDialog(err);
            }
        })
    }

}
