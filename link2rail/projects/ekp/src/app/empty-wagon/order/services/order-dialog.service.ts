import {inject, Injectable, OnDestroy, Type} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {TemplateService} from '../../template/services/template.service';
import {OrderService} from './order.service';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';
import {OrderAction, OrderCreationComponent} from '../components/order-creation/order-creation.component';
import {OrderModificationComponent} from '../components/order-modification/order-modification.component';
import {OrderCancellationComponent} from '../components/order-cancellation/order-cancellation.component';
import {OrderHistoryComponent} from "../components/order-history/order-history.component";
import {OrderInquiryView} from '../models/order-inquiry-view';

export interface TemplateData {
    action: OrderAction,
    templateView?: OrderInquiryView
}

@Injectable({
    providedIn: 'root'
})
export class OrderDialogService implements OnDestroy {
    private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);

    constructor(
        private templateService: TemplateService,
        private orderService: OrderService,
        private dialog: MatDialog
    ) {}

    ngOnDestroy(): void {}

    public openOrderCreationDialog(action?: OrderAction, templateName?: string): Subject<Object> {
        const resultSubject = new Subject<Object>;

        const orderTemplateData: TemplateData = {
            action: action,
        };
        if (!templateName) {
            this.openDialog(OrderCreationComponent, orderTemplateData, resultSubject);
            return resultSubject;
        }

        this.templateService.getTemplateByName(templateName).subscribe({
            next: (template: OrderInquiryView) => {
                orderTemplateData.templateView = template;
                this.openDialog(OrderCreationComponent, orderTemplateData, resultSubject)
            },
            error: err => this.apiErrorDialogService.openApiErrorDialog(err)
        });

        return resultSubject;
    }

    public openOrderModificationDialog(action: string, orderIdConsumer: string): Subject<Object> {
        const resultSubject = new Subject<Object>();

        this.orderService.getOrderByIdConsumer(orderIdConsumer).subscribe({
            next: order => this.openDialog(OrderModificationComponent, {action, order}, resultSubject),
            error: err => this.apiErrorDialogService.openApiErrorDialog(err)
        });

        return resultSubject;
    }

    public openOrderCancellationDialog(orderId: string, orderIdConsumer: string): Subject<boolean> {
        const resultSubject = new Subject<boolean>();
        this.openDialog(OrderCancellationComponent, {orderId, orderIdConsumer}, resultSubject, '800px', '40vh');
        return resultSubject;
    }

    public openOrderStatusHistoryDialog(orderIdConsumer: string): Subject<boolean> {
        const resultSubject = new Subject<boolean>();

        this.orderService.getOrderStatusHistory(orderIdConsumer).subscribe({
            next: order => this.openDialog(OrderHistoryComponent, order, resultSubject, '800px'),
            error: err => this.apiErrorDialogService.openApiErrorDialog(err)
        });

        return resultSubject;
    }

    private openDialog<T>(component: Type<T>, data: any, resultSubject: Subject<any>, width: string = '1710px', height: string = '90vh'): void {
        this.dialog.open<T>(component, {
            data,
            width: width,
            height: height,
            disableClose: true,
            panelClass: 'full-screen-modal'
        }).beforeClosed().subscribe({
            next: result => resultSubject.next({"success": !!result, result})
        });
    }

}
