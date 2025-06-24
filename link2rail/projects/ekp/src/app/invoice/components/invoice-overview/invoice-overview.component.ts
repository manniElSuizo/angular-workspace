import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {CurrencyPipe, DatePipe} from '@angular/common';

import {
    OverviewFilterControlPanelComponent
} from '../../../shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component';
import {
    OverviewResultControlPanelComponent
} from '../../../shared/components/overviews/overview-result-control-panel/overview-result-control-panel.component';
import {InvoiceOverviewFilterComponent} from './invoice-overview-filter/invoice-overview-filter.component';
import {InvoiceOverviewResultsComponent} from './invoice-overview-results/invoice-overview-results.component';

import {SortConditionsModel} from '../../../shared/models/sort.models';
import {FilterCriteria} from '../../../shared/components/overviews/filter-base';
import {
    ListKeyValue
} from '../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';

import {InvoiceSummary, InvoiceSummaryRequestView, InvoiceSummaryResponseView} from '../../models/invoice-summary';
import {InvoicePdfRequest} from '../../models/invoice-view';
import {InvoiceService} from '../../services/invoice.service';
import {ErrorDialogService} from '../../../shared/error-handler/service/api-error-dialog.service';
import {CsvReportBuilder} from "../../../shared/utils/csv-report-builder";
import {TranslateModule, TranslateService} from "@ngx-translate/core";

/**
 * InvoiceOverviewComponent orchestrates the filter panel, result panel, and data retrieval
 * for displaying and exporting a paginated overview of invoices.
 */
@Component({
    selector: 'app-invoice-overview',
    standalone: true,
    imports: [
        TranslateModule,
        OverviewFilterControlPanelComponent,
        OverviewResultControlPanelComponent,
        InvoiceOverviewFilterComponent,
        InvoiceOverviewResultsComponent
    ],
    providers: [
        DatePipe,
        CurrencyPipe
    ],
    templateUrl: './invoice-overview.component.html',
    styleUrls: ['./invoice-overview.component.scss']
})
export class InvoiceOverviewComponent implements AfterViewInit {
    @ViewChild(InvoiceOverviewFilterComponent) filter!: InvoiceOverviewFilterComponent;
    @ViewChild(InvoiceOverviewResultsComponent) results!: InvoiceOverviewResultsComponent;
    @ViewChild(OverviewFilterControlPanelComponent) filterControlPanel!: OverviewFilterControlPanelComponent;
    @ViewChild(OverviewResultControlPanelComponent) resultControlPanel!: OverviewResultControlPanelComponent;

    isLoading = new Subject<boolean>();
    tableData: InvoiceSummary[] = [];
    numberOfResults = 0;
    totalNumberOfResults = 0;
    protected downloadInProgress = false;
    public activeFilterCount = 0;
    private selectedFilterCriteria!: FilterCriteria;
    private request!: InvoiceSummaryRequestView;

    constructor(
        private service: InvoiceService,
        private cd: ChangeDetectorRef,
        private datePipe: DatePipe,
        private apiErrorDialogService: ErrorDialogService,
        protected translate: TranslateService
    ) {
        this.isLoading.next(false);
    }

    ngAfterViewInit(): void {
        this.updateActiveFilterCount();
        this.cd.detectChanges();
    }

    onFilterCriteriaChange(criteria: FilterCriteria): void {
        this.selectedFilterCriteria = criteria;
        this.clearResults();
        this.updateActiveFilterCount();
        this.prepareRequest();
        this.fetchData();
    }

    handleResetFilters(): void {
        this.filter.resetFilter();
        this.updateActiveFilterCount();
    }

    handleDownloadReport(): void {
        this.downloadInProgress = true;
        this.prepareRequest();
        this.request.limit = 10_000;
        this.isLoading.next(true);

        this.service.searchInvoices(this.request).subscribe({
            next: data => this.onReportData(data),
            error: err => this.onReportError(err)
        });
    }

    loadMoreResults(): void {
        this.request.offset += this.request.limit;
        this.fetchData();
    }

    onSortConditionsChange(conditions: SortConditionsModel[]): void {
        const filterCriteria = this.filter.filterCriteria;
        filterCriteria.sort = this.mapSortConditionsToString(conditions);
        filterCriteria.offset = 0;
        this.onFilterCriteriaChange(filterCriteria);
    }

    showInvoice(item: InvoiceSummary): void {
        const req: InvoicePdfRequest = {
            debitorNumber: item.debitorNumber,
            invoiceNumber: item.invoiceNumber,
            repositoryUuid: item.repositoryUuid!,
            documentUuid: item.uuid!
        };
        this.service.getInvoicePdf(req).subscribe(blob => {
            const url = URL.createObjectURL(new Blob([blob], {type: 'application/pdf'}));
            window.open(url, '_blank');
        });
    }

    // === PRIVATE METHODS ===

    private clearResults(): void {
        this.tableData = [];
        this.numberOfResults = 0;
        this.totalNumberOfResults = 0;
    }

    private updateActiveFilterCount(): void {
        if (!this.filter) return
        this.activeFilterCount = this.filter.countActiveFilters();
    }

    private prepareRequest(): void {
        const {
            invoiceDateFrom = null,
            invoiceDateTo = null,
            invoiceNumber = null,
            debitorNumber = null,
            sort = '',
            offset = 0,
            limit = 25
        } = this.selectedFilterCriteria;

        this.request = {
            invoiceDateFrom: this.toStartOfDay(invoiceDateFrom),
            invoiceDateTo: this.toEndOfDay(invoiceDateTo),
            debitorNumbers: this.toDebitorKeys(debitorNumber),
            invoiceNumber,
            sort,
            offset,
            limit
        } as InvoiceSummaryRequestView;
    }

    private fetchData(): void {
        this.isLoading.next(true);
        this.service.searchInvoices(this.request).subscribe({
            next: resp => this.onFetchSuccess(resp),
            error: err => this.onFetchError(err)
        });
    }

    private onFetchSuccess(resp: InvoiceSummaryResponseView): void {
        if (this.request.offset === 0) {
            this.tableData = [];
        }
        this.totalNumberOfResults = +resp.total;
        this.tableData.push(...(resp.summaries || []));
        this.numberOfResults = this.tableData.length;
        this.isLoading.next(false);
    }

    private onFetchError(err: any): void {
        this.apiErrorDialogService.openApiErrorDialog(err);
        this.isLoading.next(false);
        this.downloadInProgress = false;
    }

    /**
     * Prepares CSV headers and rows from response, then triggers download.
     * Currency is now the last column, and amounts are decimal only.
     *
     * @param resp The full response containing invoice summaries
     */
    private onReportData(resp: InvoiceSummaryResponseView): void {
        // Remove 'link' and 'currency' from headers if present, add 'Currency' as last column
        const headers = this.results.tableHeaders
                            .filter(h => h.fieldName !== 'link')
                            .map(h => h.headerText);
        headers.push(this.translate.instant(this.results.translationKey + '.currency'));

        const rows = (resp.summaries || []).map(inv => [
            inv.invoiceNumber,
            this.formatDate(inv.invoiceDate),

            inv.referenceInvoiceNumber,
            inv.recipientCompany,
            inv.debitorNumber,
            this.formatDate(inv.dueDate),
            this.formatCurrency(inv.netAmount),
            this.formatCurrency(inv.vatAmount),
            this.formatCurrency(inv.grossAmount),
            inv.currency || ''
        ]);

        const csvBuilder = new CsvReportBuilder({
            headers,
            rows,
            fileName: 'invoice_report.csv'
        });
        csvBuilder.download();
        this.isLoading.next(false);
        this.downloadInProgress = false;
    }

    private onReportError(err: any): void {
        this.onFetchError(err);
    }

    private formatDate(d: string | Date | null | undefined): string {
        return d ? this.datePipe.transform(d, 'shortDate')! : '';
    }

    /**
     * Formats a numeric amount as a decimal string (no currency symbol).
     *
     * @param amount Numeric value to format
     * @returns Formatted decimal string or empty string if invalid
     */
    private formatCurrency(
        amount: number | null | undefined
    ): string {
        return amount != null
            ? amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
            : '';
    }

    private toStartOfDay(date: string | null): Date | null {
        if (!date) return null;
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private toEndOfDay(date: string | null): Date | null {
        if (!date) return null;
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    private toDebitorKeys(items: ListKeyValue[] | null): string[] | null {
        return items && items.length ? items.map(i => i.key) : null;
    }

    private mapSortConditionsToString(conditions: SortConditionsModel[]): string {
        if (!conditions?.length) {
            return '+invoiceNumber';
        }
        const map = new Map<string, string>([
            ['invoiceNumber', 'invoiceNumber'],
            ['debitorNumber', 'debitorNumber'],
            ['invoiceDate', 'invoiceDate'],
            ['dueDate', 'dueDate'],
            ['referenceInvoiceNumber', 'referenceInvoiceNumber'],
            ['recipientCompany', 'recipientCompany'],
            ['netAmount', 'netAmount'],
            ['grossAmount', 'grossAmount']
        ]);
        return conditions
            .filter(c => map.has(c.field))
            .map(c => `${c.asc ? '+' : '-'}${map.get(c.field)}`)
            .join(',');
    }
}
