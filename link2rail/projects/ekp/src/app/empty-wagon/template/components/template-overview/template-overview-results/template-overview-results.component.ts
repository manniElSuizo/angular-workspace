import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Authorization} from "../../../../../trainorder/models/authorization";
import {TemplateSummaryView} from "../../../models/template-symmary-view";
import {OrderDialogService} from "../../../../order/services/order-dialog.service";
import { OrderAction } from '@src/app/empty-wagon/order/components/order-creation/order-creation.component';
import {TemplateDialogService} from "../../../services/template-dialog.service";
import {HeaderConfig, OverviewResultsBase} from "../../../../../shared/components/overviews/overview-results-base";

/**
 * Component for displaying template overview results.
 * Extends the OverviewResultsBase to reuse shared functionality such as table headers and sorting.
 */

@Component({
    selector: 'app-template-overview-results',
    templateUrl: './template-overview-results.component.html',
    styleUrls: ['./template-overview-results.component.scss']
})
export class TemplateOverviewResultsComponent extends OverviewResultsBase<TemplateSummaryView> {
    @Input() tableData: TemplateSummaryView[] = [];
    @Output() refresh = new EventEmitter<unknown>();

    protected showLoadButton: boolean = false;
    protected readonly authorization = Authorization;

    /**
     * Constructor for TemplateOverviewResultsComponent.
     * @param translate - Service for translation.
     * @param dialogService - Service to open order dialogs.
     * @param templateDialogService - Service to open modification dialogs.
     */
    constructor(
        protected translate: TranslateService,
        private dialogService: OrderDialogService,
        private templateDialogService: TemplateDialogService
    ) {
        super(translate);
        const key = 'ewd.template.overview.table.header';
        const headersConfig: HeaderConfig[] = [
            {fieldName: 'templateName', sortable: true, width: '150px'},
            {fieldName: 'ordererSgv', sortable: true, width: '150px'},
            {fieldName: 'ordererPartner', sortable: true, width: '150px'},
            {fieldName: 'shipperSgv', sortable: true, width: '150px'},
            {fieldName: 'shipperPartner', sortable: true, width: '150px'},
            {fieldName: 'viewTemplate', sortable: false, width: '100px', textAlign: 'center'},
            {fieldName: 'editTemplateName', sortable: false, width: '100px', textAlign: 'center'},
            {fieldName: 'createOrder', sortable: false, width: '100px', textAlign: 'center'}
        ];
        this.tableHeaders = this.buildTableHeaders(headersConfig, key);
    }

    /**
     * Opens the order creation dialog for the given template.
     * @param templateName - The name of the template for which to create an order.
     */
    createOrder(templateName: string): void {
        this.dialogService.openOrderCreationDialog(OrderAction.CREATE, templateName).subscribe({
            error: err => console.error('Error occurred while creating order:', err)
        });
    }

    /**
     * Opens the order view dialog for the given template.
     * @param templateName - The name of the template to view.
     */
    viewTemplate(templateName: string): void {
        this.dialogService.openOrderCreationDialog(OrderAction.VIEW, templateName).subscribe({
            next: result => console.log(`Template ${templateName} viewed.`, result),
            error: err => console.error(`Error occurred while viewing template ${templateName}:`, err)
        });
    }

    /**
     * Opens the template modification dialog and emits a refresh event upon successful modification.
     * @param templateName - The name of the template to modify.
     * @param customerTemplateName - The customer-specific template name.
     */
    editTemplate(templateName: string, customerTemplateName: string): void {
        this.templateDialogService.openTemplateModificationDialog(templateName, customerTemplateName).subscribe({
            next: result => {
                console.log('Template modified successfully', result);
                this.refresh.emit();
            },
            error: error => console.error('Template modification failed', error)
        });
    }
}
