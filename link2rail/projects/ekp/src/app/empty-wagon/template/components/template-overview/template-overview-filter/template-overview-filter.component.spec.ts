import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TemplateOverviewFilterComponent} from './template-overview-filter.component';
import {TranslateService} from '@ngx-translate/core';
import {AppService} from '../../../../../app.service';
import {TemplateFilterParametersService} from '../../../services/template-filter-parameters.service';
import {ChangeDetectorRef} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {of} from 'rxjs';
import {
    MultiselectAutocompleteComponent
} from '../../../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';

describe('TemplateOverviewFilterComponent', () => {
    let component: TemplateOverviewFilterComponent;
    let fixture: ComponentFixture<TemplateOverviewFilterComponent>;
    let mockAppService: jasmine.SpyObj<AppService>;
    let mockParametersService: jasmine.SpyObj<TemplateFilterParametersService>;
    let mockTranslateService: jasmine.SpyObj<TranslateService>;
    let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

    beforeEach(async () => {
        mockAppService = jasmine.createSpyObj('AppService', ['getSelectedCustomerProfiles']);
        mockParametersService = jasmine.createSpyObj('TemplateFilterParametersService', ['getDataForSearchField']);
        mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
        mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

        await TestBed.configureTestingModule({
            declarations: [TemplateOverviewFilterComponent, MultiselectAutocompleteComponent],
            providers: [
                {provide: AppService, useValue: mockAppService},
                {provide: TemplateFilterParametersService, useValue: mockParametersService},
                {provide: TranslateService, useValue: mockTranslateService},
                {provide: ChangeDetectorRef, useValue: mockChangeDetectorRef}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TemplateOverviewFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize filter form on init', () => {
        component.ngOnInit();
        expect(component.filterForm instanceof FormGroup).toBe(true);
    });

    it('should emit filter change on filter change', () => {
        spyOn(component.filterChange, 'emit');
        component.onFilterChange(new Event('change'));
        const filterCriteria = (component as any).filterCriteria; // Accessing protected property
        expect(component.filterChange.emit).toHaveBeenCalledWith(filterCriteria);
    });

    it('should count active filters correctly', () => {
        component.filterForm = new FormGroup({
            field1: new FormControl(['value1']),
            field2: new FormControl([]),
            field3: new FormControl('value3')
        });
        const activeFilters = component.countActiveFilters();
        expect(activeFilters).toBe(2);
    });

    /*
    // Test public behavior that relies on handleSearchCallbackData
    it('should update component data list on search', () => {
        const mockData = [{key: '1', value: 'Test'}];
        mockParametersService.getDataForSearchField.and.returnValue(of(mockData));
        component.onFilterChange(new Event('change'));
        fixture.detectChanges();
        // Assuming there's a public method or effect that uses handleSearchCallbackData
        // Verify the expected outcome here
    });
    */
});