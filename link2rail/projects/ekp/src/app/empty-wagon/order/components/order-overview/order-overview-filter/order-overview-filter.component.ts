import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {FilterBase, FilterCriteria} from "../../../../../shared/components/overviews/filter-base";
import {
    ListKeyValue,
    MultiselectAutocompleteComponent,
    MultiselectAutocompleteParameters
} from "../../../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";
import {OrderFilterParametersService} from "../../../services/order-filter-parameters.service";
import {StorageKeys} from "../../../../../shared/services/storage/storage.service.base";
import moment from 'moment';

@Component({
    selector: 'app-order-overview-filter',
    templateUrl: './order-overview-filter.component.html',
    styleUrl: './order-overview-filter.component.scss'
})
export class OrderOverviewFilterComponent extends FilterBase implements OnInit, AfterViewInit {
    @ViewChild('ordererPartner') ordererPartnerComponent: MultiselectAutocompleteComponent;
    @ViewChild('ordererSgv') ordererSgvComponent: MultiselectAutocompleteComponent;
    @ViewChild('demandLocation') demandLocationComponent: MultiselectAutocompleteComponent;
    @ViewChild('loadRunCountry') loadRunCountryComponent: MultiselectAutocompleteComponent;
    @ViewChild('status') statusComponent: MultiselectAutocompleteComponent;
    @ViewChild('demandWagonType') demandWagonTypeComponent: MultiselectAutocompleteComponent;
    @ViewChild('origin') originComponent: MultiselectAutocompleteComponent;

    protected demandLocationParameters: MultiselectAutocompleteParameters;
    protected ordererPartnerParameters: MultiselectAutocompleteParameters;
    protected ordererSgvParameters: MultiselectAutocompleteParameters;
    protected loadRunCountryParameters: MultiselectAutocompleteParameters;
    protected demandWagonTypeParameters: MultiselectAutocompleteParameters;
    protected statusParameters: MultiselectAutocompleteParameters;
    protected originParameters: MultiselectAutocompleteParameters;

    private readonly searchFields = ['ordererSgv', 'ordererPartner', 'demandLocation', 'demandWagonType', 'loadRunCountry'];
    private readonly selectFields = ['status', 'origin'];

    constructor(
        private parametersService: OrderFilterParametersService,
        private translate: TranslateService,
        private cdr: ChangeDetectorRef
    ) {
        super(StorageKeys.EMPTY_WAGON_ORDER_OVERVIEW_FILTER_STORAGE_KEY);
    }

    ngOnInit(): void {
        this.createFilterForm();
        this.restoreFilterState();
        this.initializeParameters();
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.initializeSelectData(), 0);
        this.addMultiSelectComponents();
        this.restoreMultiSelectComponentsValues();
        this.cdr.detectChanges();
    }

    protected createFilterForm(): void {
        this.filterForm = new FormGroup({
            demandDateFrom: new FormControl(null),
            demandDateTo: new FormControl(null),
            searchReference: new FormControl(''),
        });
    }

    protected filterFormToRequest4Storage(): void {
        if (this.filterForm) {
            this.filterCriteria = this.filterForm.value;
        }
    }

    private initSearchComponent(fieldName: string, parametersName: string): void {
        const translations = this.getMultiselectTranslations(true);
        const label = this.getFieldLabel(fieldName);
        const storedValue = this.filterCriteria[fieldName];
        this[parametersName] = {
            dataCallback: (query: string) => this.handleSearchCallbackData(query, fieldName),
            divId: `${fieldName}Div`,
            fieldId: fieldName,
            fieldName: fieldName,
            formControlName: fieldName,
            i18n: {
                errorText: translations.error,
                fieldText: label,
                labelText: label,
                searchPlaceholderText: translations.search,
                noDataAvailablePlaceholderText: translations.noData,
            },
            selectedItems: storedValue ? storedValue : [],
            allowSearch: true,
            minQueryLength: 1
        };
    }

    private initSelectComponent(fieldName: string, parametersName: string): void {
        const translations = this.getMultiselectTranslations(false);
        const label = this.getFieldLabel(fieldName);

        this[parametersName] = {
            divId: `${fieldName}Div`,
            fieldId: fieldName,
            fieldName: fieldName,
            formControlName: fieldName,
            i18n: {
                errorText: translations.error,
                fieldText: label,
                labelText: label,
                searchPlaceholderText: translations.search,
                noDataAvailablePlaceholderText: translations.noData,
            },
            selectedItems: [],
            allowSearch: false
        };
    }

    private loadSelectData(fieldName: string): void {
        const component = this.getComponent(fieldName);
        if (component) {
            component.dataList = this.parametersService.getDataForSelectField(fieldName);
        }
    }

    private handleSearchCallbackData(query: string, fieldName: string): Observable<ListKeyValue[]> {

        const searchObservable = this.parametersService.getDataForSearchField(fieldName, query);
        searchObservable.subscribe(items => {
            const component = this.getComponent(fieldName);

            if (component) {
                component.dataList = items;
            }
        });

        return searchObservable;
    }

    private getMultiselectTranslations(isSearchable: boolean): MultiselectTranslations {
        const basePath = 'common.components.multiSelect.';
        return {
            noData: this.translate.instant(`${basePath}noDataAvailable`),
            error: this.translate.instant(`${basePath}error`),
            search: this.translate.instant(`${basePath}${isSearchable ? 'search' : 'select'}`)
        };
    }

    private getFieldLabel(fieldName: string): string {
        return this.translate.instant(`ewd.order.overview.filter.${fieldName}`);
    }

    private getComponent(fieldName: string): MultiselectAutocompleteComponent {
        return this[`${fieldName}Component`];
    }

    private initializeParameters(): void {
        // Initialize search components parameters
        this.searchFields.forEach(fieldName => {
            this.initSearchComponent(fieldName, `${fieldName}Parameters`);
        });

        // Initialize select components parameters
        this.selectFields.forEach(fieldName => {
            this.initSelectComponent(fieldName, `${fieldName}Parameters`);
        });
    }

    private initializeSelectData(): void {
        // Load select data after view initialization
        this.selectFields.forEach(fieldName => {
            this.loadSelectData(fieldName);
        });
    }

    private restoreMultiSelectComponentsValues(): void {
        [...this.searchFields, ...this.selectFields].forEach(fieldName => {
            const component = this.getComponent(fieldName);
            if (component && component.multiselectForm) {
                const storedValue = this.filterCriteria[fieldName];
                if (storedValue?.length) component.multiselectForm.get(fieldName).setValue(storedValue);
            }
        });
    }

    countActiveFilters(): number {
        if (!this.filterForm) {
            return 0;
        }

        return Object.keys(this.filterForm.controls)
                     .filter(key => {
                         const control = this.filterForm.get(key);
                         return control && control.value &&
                             (Array.isArray(control.value) ? control.value.length > 0 : !!control.value);
                     }).length;
    }

    protected initializeFilterCriteria(): FilterCriteria {
        return {
            demandDateFrom: moment().subtract(3, 'days').format('YYYY-MM-DD'),
            demandDateTo: null,
            searchReference: '',
            ordererSgv: [],
            ordererPartner: [],
            demandLocation: [],
            loadRunCountry: [],
            demandWagonType: [],
            status: [],
            origin: []
        };
    }

    private addMultiSelectComponents(): void {
        [...this.searchFields, ...this.selectFields].forEach(fieldName => {
            const component = this.getComponent(fieldName);
            if (component && component.multiselectForm) {
                this.filterForm.addControl(fieldName, component.multiselectForm.get(fieldName));
            }
        });
    }

    public onFilterChange(_$event: Event): void {
        this.updateFilterCriteria();
        this.storeFilterState();
        this.emitFilterChange();
    }

    multiselectChangeEventListener($event: Event) {
        this.onFilterChange($event);
    }
}

interface MultiselectTranslations {
    noData: string;
    error: string;
    search: string;
}
