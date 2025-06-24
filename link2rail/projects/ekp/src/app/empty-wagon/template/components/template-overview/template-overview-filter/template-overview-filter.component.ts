import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {FilterBase, FilterCriteria} from "../../../../../shared/components/overviews/filter-base";
import {
    ListKeyValue,
    MultiselectAutocompleteComponent,
    MultiselectAutocompleteParameters
} from "../../../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";
import {StorageKeys} from "../../../../../shared/services/storage/storage.service.base";
import {TemplateFilterParametersService} from "../../../services/template-filter-parameters.service";

@Component({
    selector: 'app-template-overview-filter',
    templateUrl: './template-overview-filter.component.html',
    styleUrl: './template-overview-filter.component.scss'
})
export class TemplateOverviewFilterComponent extends FilterBase implements OnInit, AfterViewInit {
    @ViewChild('templateName') templateNameComponent: MultiselectAutocompleteComponent;
    @ViewChild('ordererPartner') ordererPartnerComponent: MultiselectAutocompleteComponent;
    @ViewChild('ordererSgv') ordererSgvComponent: MultiselectAutocompleteComponent;
    @ViewChild('shipperPartner') shipperPartnerComponent: MultiselectAutocompleteComponent;
    @ViewChild('shipperSgv') shipperSgvComponent: MultiselectAutocompleteComponent;
    @ViewChild('demandLocation') demandLocationComponent: MultiselectAutocompleteComponent;
    @ViewChild('demandWagonType') demandWagonTypeComponent: MultiselectAutocompleteComponent;
    @ViewChild('loadRunCountry') loadRunCountryComponent: MultiselectAutocompleteComponent;

    protected templateNameParameters: MultiselectAutocompleteParameters;
    protected ordererPartnerParameters: MultiselectAutocompleteParameters;
    protected ordererSgvParameters: MultiselectAutocompleteParameters;
    protected shipperPartnerParameters: MultiselectAutocompleteParameters;
    protected shipperSgvParameters: MultiselectAutocompleteParameters;
    protected demandLocationParameters: MultiselectAutocompleteParameters;
    protected demandWagonTypeParameters: MultiselectAutocompleteParameters;
    protected loadRunCountryParameters: MultiselectAutocompleteParameters;

    private readonly searchFields = ['ordererSgv', 'ordererPartner', 'shipperSgv', 'shipperPartner', 'demandLocation', 'demandWagonType', 'templateName', 'loadRunCountry'];

    constructor(
        private parametersService: TemplateFilterParametersService,
        private translate: TranslateService,
        private cdr: ChangeDetectorRef
    ) {
        super(StorageKeys.EMPTY_WAGON_TEMPLATE_OVERVIEW_FILTER_STORAGE_KEY);
    }

    ngOnInit(): void {
        this.createFilterForm();
        this.restoreFilterState();
        this.initializeParameters();
    }

    ngAfterViewInit(): void {
        this.addMultiSelectComponents();
        this.restoreMultiSelectComponentsValues();
        this.cdr.detectChanges();
    }

    protected createFilterForm(): void {
        this.filterForm = new FormGroup({});
    }

    protected filterFormToRequest4Storage(): void {
        if (this.filterForm) {
            this.filterCriteria = this.filterForm.value;
        }
    }

    protected setStorageValuesInForm(): void {
        if (this.filterCriteria) {
            this.filterForm.patchValue(this.filterCriteria);
        }
    }

    protected afterRestoreFilterFromStorage(): void {
        this.restoreMultiSelectComponentsValues();
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
        return this.translate.instant(`ewd.template.overview.filter.${fieldName}`);
    }

    private getComponent(fieldName: string): MultiselectAutocompleteComponent {
        return this[`${fieldName}Component`];
    }

    private initializeParameters(): void {
        // Initialize search components parameters
        this.searchFields.forEach(fieldName => {
            this.initSearchComponent(fieldName, `${fieldName}Parameters`);
        });
    }

    private restoreMultiSelectComponentsValues(): void {
        [...this.searchFields].forEach(fieldName => {
            const component = this.getComponent(fieldName);
            if (component && component.multiselectForm) {
                const storedValue = this.filterCriteria[fieldName];
                if (storedValue?.length) {

                    component.multiselectForm.get(fieldName).setValue(storedValue);
                }
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
            demandDateFrom: null,
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
        [...this.searchFields].forEach(fieldName => {
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
