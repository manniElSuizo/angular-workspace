import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {
    MultiselectAutocompleteModule
} from '../../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.module';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../../shared/shared.module';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {
    MultiselectAutocompleteComponent,
    MultiselectAutocompleteParameters
} from '../../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import {FilterBase, FilterCriteria} from '../../../../shared/components/overviews/filter-base';
import {StorageKeys} from '../../../../shared/services/storage/storage.service.base';
import * as moment from 'moment/moment';
import {InvoiceFilterParameterService} from '../../../services/invoice-filter-parameter.service';

/**
 * InvoiceOverviewFilterComponent provides a filter UI for invoices.
 *
 * Note: The focus/blur handlers here are basic. If similar behavior is needed across multiple components,
 * consider extracting them into a reusable directive.
 *
 * Also, common filter state management (storing/restoring state) might be extracted to a helper service.
 */
@Component({
    selector: 'app-invoice-overview-filter',
    standalone: true,
    imports: [
        MultiselectAutocompleteModule,
        ReactiveFormsModule,
        SharedModule,
        TranslateModule
    ],
    templateUrl: './invoice-overview-filter.component.html',
    styleUrls: ['./invoice-overview-filter.component.scss']
})
export class InvoiceOverviewFilterComponent extends FilterBase implements OnInit, AfterViewInit {
    @ViewChild('debitorNumber') debitorNumberComponent: MultiselectAutocompleteComponent;
    protected debitorNumberParameters: MultiselectAutocompleteParameters;
    private readonly debitorFieldName = 'debitorNumber';

    /**
     * Constructor injecting required services.
     *
     * @param service Invoice filter parameter service.
     * @param translate Translation service.
     * @param cdr Change detector reference.
     */
    constructor(
        private service: InvoiceFilterParameterService,
        private translate: TranslateService,
        private cdr: ChangeDetectorRef
    ) {
        super(StorageKeys.INVOICE_OVERVIEW_FILTER_STORAGE_KEY);
    }

    /**
     * Lifecycle hook - component initialization.
     */
    ngOnInit(): void {
        this.createFilterForm();
        this.restoreFilterState();
        this.setupDebitorMultiSelect();
    }

    /**
     * Lifecycle hook - after view initialization.
     */
    ngAfterViewInit(): void {
        // Consolidated multi-select setup is performed in ngOnInit.
        // Here, we add the multi-select control and restore its stored values.
        this.addDebitorControlToForm();
        this.restoreDebitorValue();
        this.cdr.detectChanges();
    }

    /**
     * Creates the filter form controls.
     */
    protected override createFilterForm(): void {
        this.filterForm = new FormGroup({
            invoiceDateFrom: new FormControl(null),
            invoiceDateTo: new FormControl(null),
            invoiceNumber: new FormControl()
        });
    }

    /**
     * Initializes the default filter criteria.
     *
     * @returns The initial filter criteria.
     */
    protected override initializeFilterCriteria(): FilterCriteria {
        return {
            invoiceDateFrom: moment().subtract(1, 'months').format('YYYY-MM-DD'),
            invoiceDateTo: null,
            invoiceNumber: ''
        };
    }

    /**
     * Gets the FormControl for the debitor field from the multiselect component.
     *
     * @returns The FormControl associated with the debitor field.
     */
    get debitorControl(): FormControl {
        return this.debitorNumberComponent.multiselectForm.get(this.debitorFieldName) as FormControl;
    }

    /**
     * Consolidates multi-select related setup for the debitor field, including initialization.
     */
    private setupDebitorMultiSelect(): void {
        const storedValue = this.filterCriteria[this.debitorFieldName];
        this.debitorNumberParameters = {
            dataCallback: (query: string) => this.debtorComponentDataCallback(query),
            divId: `${this.debitorFieldName}Div`,
            fieldId: this.debitorFieldName,
            fieldName: this.debitorFieldName,
            formControlName: this.debitorFieldName,
            selectedItems: storedValue ?? [],
            minQueryLength: 1,
            i18n: this.debitorParameterTranslations()
        };
    }

    /**
     * Adds the debitor control from the multi-select component into the main filter form.
     */
    private addDebitorControlToForm(): void {
        const control = this.debitorNumberComponent.multiselectForm.get(this.debitorFieldName);
        if (control) {
            this.filterForm.addControl(this.debitorFieldName, control);
        }
    }

    /**
     * Restores the stored value for the debitor control.
     */
    private restoreDebitorValue(): void {
        const storedValue = this.filterCriteria[this.debitorFieldName];
        if (storedValue?.length) {
            this.debitorControl.setValue(storedValue);
        }
    }

    /**
     * Retrieves debitor data based on query.
     *
     * @param query Search query.
     */
    private debtorComponentDataCallback(query: string): void {
        this.service.findInvoiceDebitors(query)
            .subscribe(items => this.debitorNumberComponent.dataList = items);
    }

    /**
     * Retrieves translation configuration for the debitor component.
     *
     * @returns An object containing translation strings.
     */
    private debitorParameterTranslations(): any {
        const basePath = 'common.components.multiSelect.';
        const label = this.translate.instant('inv.invoice.overview.filter.debitorNumber');
        return {
            errorText: this.translate.instant(`${basePath}error`),
            fieldText: label,
            labelText: label,
            searchPlaceholderText: this.translate.instant(`${basePath}search`),
            noDataAvailablePlaceholderText: this.translate.instant(`${basePath}noDataAvailable`)
        };
    }
}
