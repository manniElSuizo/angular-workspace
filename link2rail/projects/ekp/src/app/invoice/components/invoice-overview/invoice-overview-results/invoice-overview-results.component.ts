import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PopupMenuModule} from '../../../../shared/components/popup-menu/popup-menu.module';
import {SharedPipesModule} from '../../../../shared/pipes/shared-pipes.module';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {InvoiceSummary} from '../../../models/invoice-summary';
import {
    HeaderConfig
} from '@src/app/shared/components/overviews/overwview-result-table-header/overview-result-table-header.component';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {OverviewResultsBase} from "../../../../shared/components/overviews/overview-results-base";

/**
 * InvoiceOverviewResultsComponent is responsible for displaying a list of invoice summaries
 * along with their header configuration and sort functionality.
 *
 * It uses the OverviewResultTableHeaderComponent to render the table headers and emits updated sort conditions
 * to the parent component.
 */
@Component({
    selector: 'app-invoice-overview-results',
    standalone: true,
    imports: [
        MatTooltipModule,
        PopupMenuModule,
        SharedPipesModule,
        TranslateModule,
        NgForOf,
        NgIf,
        DatePipe,
        CurrencyPipe
    ],
    templateUrl: './invoice-overview-results.component.html',
    styleUrls: ['./invoice-overview-results.component.scss']
})
export class InvoiceOverviewResultsComponent extends OverviewResultsBase<InvoiceSummary> {
    /**
     * Configuration for the table headers.
     * @type {HeaderConfig[]}
     */
    headersConfig: HeaderConfig[] = [
        {fieldName: 'invoiceNumber', sortable: true, width: '150px'},
        {fieldName: 'invoiceDate', sortable: true, width: '150px'},
        {fieldName: 'referenceInvoiceNumber', sortable: true, width: '150px'},
        {fieldName: 'recipientCompany', sortable: true, width: '150px'},
        {fieldName: 'debitorNumber', sortable: true, width: '80px'},
        {fieldName: 'dueDate', sortable: true, width: '150px'},
        {fieldName: 'netAmount', sortable: true, width: '100px', textAlign: 'right'},
        {fieldName: 'vatAmount', sortable: false, width: '100px', textAlign: 'right'},
        {fieldName: 'grossAmount', sortable: true, width: '100px', textAlign: 'right'},
        {fieldName: 'link', sortable: false, width: '50px', textAlign: 'center'}
    ];

    /**
     * Translation key used for header label translations.
     * @type {string}
     */
    translationKey: string = 'inv.invoice.overview.table.header';

    /**
     * Array of invoice summaries to be displayed.
     * @type {InvoiceSummary[]}
     */
    @Input() tableData: InvoiceSummary[] = [];

    /**
     * Emits selected invoice for viewing.
     * @type {EventEmitter<InvoiceSummary>}
     */
    @Output() showSelectedInvoice: EventEmitter<InvoiceSummary> = new EventEmitter();

    /**
     * Creates an instance of InvoiceOverviewResultsComponent.
     *
     * @param {TranslateService} translate - Translation service for label translations.
     */
    constructor(
        protected translate: TranslateService,
    ) {
        super(translate);
        this.tableHeaders = this.buildTableHeaders(this.headersConfig, this.translationKey);
    }

    /**
     * Emits the selected invoice for viewing.
     *
     * Retrieves the invoice from the tableData array based on the provided index and emits it.
     * Throws an error if the index is out of bounds.
     *
     * @param {number} index - The index of the selected invoice in the tableData array.
     * @throws {Error} When the provided index is invalid.
     */
    showInvoice(index: number): void {
        if (index < 0 || index >= this.tableData.length) {
            throw new Error(`Invalid invoice index: ${index}`);
        }
        const selectedInvoice = this.tableData[index];
        this.showSelectedInvoice.emit(selectedInvoice);
    }
}
