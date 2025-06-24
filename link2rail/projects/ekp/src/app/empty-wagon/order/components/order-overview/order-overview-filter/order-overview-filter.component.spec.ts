import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {ReactiveFormsModule} from '@angular/forms';
import {of} from 'rxjs';

import {OrderOverviewFilterComponent} from './order-overview-filter.component';
import {OrderOverviewModule} from '../order-overview.module';
import {AppService} from '../../../../../app.service';
import {OrderFilterParametersService} from '../../../services/order-filter-parameters.service';
import {StorageKeys} from '../../../../../shared/services/storage/storage.service.base';
import {HttpLoaderFactory} from '../../../../../app.module';
import {
    ListKeyValue
} from '../../../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';

describe('OrderOverviewFilterComponent', () => {
    let component: OrderOverviewFilterComponent;
    let fixture: ComponentFixture<OrderOverviewFilterComponent>;
    let parametersService: jasmine.SpyObj<OrderFilterParametersService>;
    let translateService: TranslateService;

    const mockListKeyValue: ListKeyValue[] = [
        {key: '1', value: 'Test 1'},
        {key: '2', value: 'Test 2'}
    ];

    beforeEach(async () => {
        parametersService = jasmine.createSpyObj('OrderFilterParametersService', [
            'getDataForSearchField',
            'getDataForSelectField',
            'findLoadRunCountries' // Ensure this method is included in the spy
        ]);
        parametersService.getDataForSearchField.and.returnValue(of(mockListKeyValue));
        parametersService.getDataForSelectField.and.returnValue(mockListKeyValue);

        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: HttpLoaderFactory,
                        deps: [HttpClient],
                    },
                }),
                ReactiveFormsModule,
                OrderOverviewModule
            ],
            providers: [
                TranslateService,
                AppService,
                {provide: OrderFilterParametersService, useValue: parametersService},
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(OrderOverviewFilterComponent);
        component = fixture.componentInstance;
        translateService = TestBed.inject(TranslateService);
        fixture.detectChanges();
    });
    describe('Common functionality', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize filter form with correct controls', () => {
            expect(component['filterForm']).toBeDefined();
            expect(component['filterForm'].get('demandDateFrom')).toBeDefined();
            expect(component['filterForm'].get('demandDateTo')).toBeDefined();
            expect(component['filterForm'].get('searchReference')).toBeDefined();
            expect(component['filterForm'].get('ordererSgv')).toBeDefined();
            expect(component['filterForm'].get('ordererPartner')).toBeDefined();
            expect(component['filterForm'].get('demandLocation')).toBeDefined();
            expect(component['filterForm'].get('loadRunCountry')).toBeDefined();
            expect(component['filterForm'].get('demandWagonType')).toBeDefined();
            expect(component['filterForm'].get('status')).toBeDefined();
            expect(component['filterForm'].get('origin')).toBeDefined();
        });

        it('should initialize multiselect components', () => {
            expect(component['ordererSgvParameters']).toBeDefined();
            expect(component['ordererPartnerParameters']).toBeDefined();
            expect(component['demandLocationParameters']).toBeDefined();
            expect(component['loadRunCountryParameters']).toBeDefined();
            expect(component['statusParameters']).toBeDefined();
            expect(component['demandWagonTypeParameters']).toBeDefined();
            expect(component['originParameters']).toBeDefined();
        });

        it('should handle search query correctly', () => {
            const query = 'test';
            const fieldName = 'ordererSgv';

            component['initSearchComponent'](fieldName, 'ordererSgvParameters');
            component['ordererSgvParameters'].dataCallback(query);

            expect(parametersService.getDataForSearchField).toHaveBeenCalledWith(fieldName, query);
        });

        it('should handle select data correctly', () => {
            const fieldName = 'status';

            component['initSelectComponent'](fieldName, 'statusParameters');
            component['loadSelectData'](fieldName);

            expect(parametersService.getDataForSelectField).toHaveBeenCalledWith(fieldName);
        });

        it('should emit filter changes', () => {
            spyOn(component['filterChange'], 'emit');
            component.onFilterChange(event);
            expect(component['filterChange'].emit).toHaveBeenCalled();
        });

        it('should store filter state', () => {
            spyOn(sessionStorage, 'setItem');
            component.onFilterChange(event);
            expect(sessionStorage.setItem).toHaveBeenCalled();
        });

        it('should restore filter state from storage', () => {
            const testState = {
                ordererSgv: mockListKeyValue,
                demandDateFrom: '2023-01-01'
            };
            sessionStorage.setItem(StorageKeys.EMPTY_WAGON_ORDER_OVERVIEW_FILTER_STORAGE_KEY, JSON.stringify(testState));

            component['restoreFilterState']();

            expect(component['filterForm'].get('ordererSgv').value).toEqual(mockListKeyValue);
            expect(component['filterForm'].get('demandDateFrom').value).toEqual('2023-01-01');
        });

        // Im Test
        it('should count active filters correctly', () => {
            component.filterForm.patchValue({
                ordererSgv: mockListKeyValue,
                demandLocation: mockListKeyValue,
                demandDateFrom: null,
                demandDateTo: null,
                searchReference: '',
                ordererPartner: [],
                loadRunCountry: [],
                demandWagonType: [],
                status: [],
                origin: []
            });

            fixture.detectChanges();
            expect(component.countActiveFilters()).toBe(2);
        });

        // Zusätzlicher Test für verschiedene Filtertypen
        it('should count different types of active filters correctly', () => {
            component.filterForm.patchValue({
                ordererSgv: mockListKeyValue,
                demandDateFrom: '2023-01-01',
                searchReference: 'test'
            });

            fixture.detectChanges();
            expect(component.countActiveFilters()).toBe(3);
        });

    });

    describe('Status Multiselect', () => {
        const mockStatusOptions: ListKeyValue[] = [
            {key: 'CREATED', value: 'Created'},
            {key: 'REJECTED', value: 'Rejected'},
            {key: 'IN_PROCESSING', value: 'In Processing'}
        ];

        beforeEach(() => {
            parametersService.getDataForSelectField.withArgs('status').and.returnValue(mockStatusOptions);
            fixture.detectChanges();
        });

        it('should initialize status component on ngOnInit', () => {
            component.ngOnInit();
            fixture.detectChanges();

            expect(component.statusComponent).toBeDefined();
            expect(component['statusParameters']).toBeDefined();
            expect(component.statusComponent.dataList).toEqual([]);
            expect(component.statusComponent.dataList.length).toBe(0);
        });

        it('should set correct initial parameters for status component', () => {
            const translations = component['getMultiselectTranslations'](false);
            const label = component['getFieldLabel']('status');

            expect(component['statusParameters'].fieldName).toBe('status');
            expect(component['statusParameters'].formControlName).toBe('status');
            expect(component['statusParameters'].i18n.fieldText).toBe(label);
            expect(component['statusParameters'].i18n.searchPlaceholderText).toBe(translations.search);
        });

        it('should initialize status form control with empty array', () => {
            expect(component.filterForm.get('status').value).toEqual('');
        });

        it('should load status options after initialization', () => {
            component['loadSelectData']('status');
            fixture.detectChanges();

            expect(component.statusComponent.dataList).toEqual(mockStatusOptions);
            expect(component.statusComponent.dataList.length).toBe(3);
        });

        it('should initialize status component with correct translations', () => {
            const translations = {
                noData: 'No data available',
                error: 'Error occurred',
                search: 'Select'
            };
            spyOn(component['translate'], 'instant').and.returnValues(
                translations.noData,
                translations.error,
                translations.search
            );

            component['initSelectComponent']('status', 'statusParameters');

            expect(component['statusParameters'].i18n.noDataAvailablePlaceholderText)
                .toBe(translations.noData);
            expect(component['statusParameters'].i18n.errorText)
                .toBe(translations.error);
            expect(component['statusParameters'].i18n.searchPlaceholderText)
                .toBe(translations.search);
        });
    });

    describe('OrdererSgv Multiselect', () => {
        const mockSgvOptions: ListKeyValue[] = [
            {key: 'SGV1', value: 'SGV Test 1'},
            {key: 'SGV2', value: 'SGV Test 2'},
            {key: 'SGV3', value: 'SGV Test 3'}
        ];

        beforeEach(() => {
            parametersService.getDataForSearchField
                             .withArgs('ordererSgv', jasmine.any(String))
                             .and.returnValue(of(mockSgvOptions));
            fixture.detectChanges();
        });

        it('should initialize ordererSgv component correctly', () => {

            component.ngOnInit();
            fixture.detectChanges();

            expect(component.ordererSgvComponent).toBeDefined();
            expect(component['ordererSgvParameters']).toBeDefined();
            expect(component.filterForm.get('ordererSgv')).toBeDefined();
        });

        it('should handle valid search query', (done) => {
            const searchQuery = 'test';
            component['ordererSgvParameters'].dataCallback(searchQuery).subscribe(result => {
                expect(result).toEqual(mockSgvOptions);
                expect(parametersService.getDataForSearchField)
                    .toHaveBeenCalledWith('ordererSgv', searchQuery);
                done();
            });
        });

        it('should handle empty search query', (done) => {
            component['ordererSgvParameters'].dataCallback('').subscribe(result => {
                expect(parametersService.getDataForSearchField).toHaveBeenCalled();
                done();
            });
        });

        it('should update dataList when search returns results', (done) => {
            const searchQuery = 'test';

            // First ensure component is initialized
            component.ngOnInit();
            fixture.detectChanges();

            // Then perform search
            component['ordererSgvParameters'].dataCallback(searchQuery).subscribe(() => {
                fixture.detectChanges();

                expect(parametersService.getDataForSearchField)
                    .toHaveBeenCalledWith('ordererSgv', searchQuery);
                expect(component.ordererSgvComponent.dataList).toBeDefined();
                expect(component.ordererSgvComponent.dataList.length).toBe(3);
                expect(component.ordererSgvComponent.dataList).toEqual(mockSgvOptions);
                done();
            });
        });
        it('should handle selection change', () => {
            const selectedSgv = [mockSgvOptions[0]];
            component.filterForm.get('ordererSgv').setValue(selectedSgv);
            component.onFilterChange(event);

            expect(component.filterForm.get('ordererSgv').value).toEqual(selectedSgv);
            expect(component['filterCriteria'].ordererSgv).toEqual(selectedSgv);
        });

        it('should restore ordererSgv from storage', () => {
            const storedSgv = [mockSgvOptions[0]];
            const testState = {ordererSgv: storedSgv};
            sessionStorage.setItem(
                StorageKeys.EMPTY_WAGON_ORDER_OVERVIEW_FILTER_STORAGE_KEY,
                JSON.stringify(testState)
            );

            component['restoreFilterState']();
            expect(component.filterForm.get('ordererSgv').value).toEqual(storedSgv);
        });

        it('should emit filter changes when ordererSgv changes', () => {
            spyOn(component['filterChange'], 'emit');
            const selectedSgv = [mockSgvOptions[0]];

            component.filterForm.get('ordererSgv').setValue(selectedSgv);
            component.onFilterChange(event);

            expect(component['filterChange'].emit).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    ordererSgv: selectedSgv
                })
            );
        });
    });

    describe('ngAfterViewInit', () => {
        it('should load data for select components', fakeAsync(() => {
            component.ngAfterViewInit();
            tick();

            expect(component.statusComponent.dataList).toEqual(mockListKeyValue);
            expect(component.originComponent.dataList).toEqual(mockListKeyValue);

            expect(parametersService.getDataForSelectField).toHaveBeenCalledWith('status');
            expect(parametersService.getDataForSelectField).toHaveBeenCalledWith('origin');
        }));

        it('should restore component values from form', fakeAsync(() => {
            const storedValue = [mockListKeyValue[0]];
            component.filterForm.patchValue({
                status: storedValue
            });

            component.ngAfterViewInit();
            tick();

            expect(component.statusComponent.multiselectForm.get('status').value).toEqual(storedValue);
        }));

        it('should not set selectedItems if form value is empty', fakeAsync(() => {
            component.ngAfterViewInit();
            tick();

            expect(component.statusComponent.selectedItems).toEqual([]);
        }));
    });

});