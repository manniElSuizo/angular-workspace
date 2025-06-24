import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { HeaderConfig, OverviewResultsBase } from '@src/app/shared/components/overviews/overview-results-base';
import { OrderSummaryView } from '@src/app/empty-wagon/order/models/order-summary-view';
import { OrderDialogService } from '@src/app/empty-wagon/order/services/order-dialog.service';
import { PopupMenuComponent } from '@src/app/shared/components/popup-menu/popup-menu.component';

/**
 * Component for displaying order overview results.
 * Extends OverviewResultsBase to reuse shared functionality such as table header construction and sorting.
 */
@Component({
    selector: 'app-order-overview-results',
    templateUrl: './order-overview-results.component.html',
    styleUrls: ['./order-overview-results.component.scss']
})
export class OrderOverviewResultsComponent extends OverviewResultsBase<OrderSummaryView> {
    /**
     * Reference to the popup menu used for order processing.
     */
    @ViewChild(PopupMenuComponent) menuProcessOrder: PopupMenuComponent;

    /**
     * Array containing order summary data to be displayed.
     */
    @Input() tableData: OrderSummaryView[] = [];

    /**
     * Emits event to notify parent components to refresh data.
     */
    @Output() refresh = new EventEmitter<unknown>();

    /**
     * Currently selected order for processing.
     */
    protected selectedRailOrder: OrderSummaryView;

    /**
     * Creates an instance of OrderOverviewResultsComponent.
     * @param translate - Translation service.
     * @param orderDialogService - Service for handling order dialogs.
     */
    constructor(
        protected translate: TranslateService,
        private orderDialogService: OrderDialogService
    ) {
        super(translate);
        const key = 'ewd.order.overview.table.header';
        const headersConfig: HeaderConfig[] = [
            {fieldName: 'orderId', sortable: false, width: '84px'},
            {fieldName: 'internalOrderNumber', sortable: false, width: '150px'},
            {fieldName: 'orderer', sortable: false, width: '84px'},
            {fieldName: 'shipper', sortable: false, width: '84px'},
            {fieldName: 'demandLocation', sortable: false, width: '84px'},
            {fieldName: 'freightWagonLocation', sortable: false, width: '84px'},
            {fieldName: 'demandWagonType', sortable: false, width: '84px'},
            {fieldName: 'numberOfWagon', sortable: false, width: '84px'},
            {fieldName: 'status', sortable: false, width: '84px'},
            {fieldName: 'origin', sortable: false, width: '84px'},
            {fieldName: 'demandDateTime', sortable: false, width: '84px'},
            {fieldName: 'loadRunInformation', sortable: false, width: '84px'},
            {fieldName: 'customerCommentsToService', sortable: false, width: '84px'},
            {fieldName: 'customerReference', sortable: false, width: '84px'},
            {fieldName: 'menu', sortable: false, width: '10px', textAlign: 'center'}
        ];
        this.tableHeaders = this.buildTableHeaders(headersConfig, key);
    }

    /**
     * Opens a dialog for modifying an order.
     *
     * This method calls the order dialog service to open the modification dialog in 'edit' mode.
     *
     * @param orderIdConsumer - The unique identifier for the consumer order.
     */
    modifyOrder(orderIdConsumer: string): void {
        this.orderDialogService.openOrderModificationDialog('edit', orderIdConsumer).subscribe({
            next: result => console.log('Order modification dialog', result),
            error: error => console.error('Error opening modification dialog', error)
        });
    }

    /**
     * Opens a dialog for canceling an order.
     *
     * This method calls the order dialog service to open the cancellation dialog.
     *
     * @param orderId - The order's identifier.
     * @param orderIdConsumer - The unique identifier for the consumer order.
     */
    cancelOrder(orderId: string, orderIdConsumer: string): void {
        this.orderDialogService.openOrderCancellationDialog(orderId, orderIdConsumer).subscribe({
            next: result => console.log('Order cancellation dialog', result),
            error: error => console.error('Error opening cancellation dialog', error)
        });
    }

    /**
     * Opens a dialog to view order details.
     *
     * This method calls the order dialog service to open the modification dialog in 'view' mode.
     *
     * @param orderIdConsumer - The unique identifier for the consumer order.
     */
    viewOrder(orderIdConsumer: string): void {
        this.orderDialogService.openOrderModificationDialog('view', orderIdConsumer).subscribe({
            next: result => console.log('Order modification dialog', result),
            error: error => console.error('Error opening modification dialog', error)
        });
    }

    /**
     * Opens the popup menu for order processing.
     *
     * This method sets the selected order and opens the popup menu at the specified mouse event location.
     *
     * @param $event - Mouse event for positioning the popup menu.
     * @param orderSummary - The order summary object for the selected order.
     */
    openMenu($event: MouseEvent, orderSummary: OrderSummaryView): void {
        this.selectedRailOrder = orderSummary;
        this.menuProcessOrder.open($event);
    }

    /**
     * Opens a dialog to display the order status history.
     *
     * This method calls the order dialog service to open the status history dialog.
     *
     * @param orderIdConsumer - The unique identifier for the consumer order.
     */
    viewStatusHistory(orderIdConsumer: string): void {
        this.orderDialogService.openOrderStatusHistoryDialog(orderIdConsumer).subscribe({
            next: result => console.log('Order status history dialog', result),
            error: error => console.error('Error opening status history dialog', error)
        });
    }
}
