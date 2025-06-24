import {Component, Inject} from '@angular/core';
import {DatePipe, NgForOf} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";
import {SharedPipesModule} from "../../../../shared/pipes/shared-pipes.module";
import {TranslateModule} from "@ngx-translate/core";
import {OrderStatusHistoryView} from "../../models/order-view";

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [
        DatePipe,
        MatDialogClose,
        NgForOf,
        SharedPipesModule,
        TranslateModule
    ],
    templateUrl: './order-history.component.html',
    styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent {
    data: OrderStatusHistoryView;

    constructor(
        @Inject(MAT_DIALOG_DATA) data: OrderStatusHistoryView
    ) {
        console.log('OrderHistoryComponent', data);
        this.data = data;
    }

}
