import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TemplateOverviewComponent} from './template-overview.component';
import {TemplateService} from '../../services/template.service';
import {of, Subject} from 'rxjs';
import {ChangeDetectorRef} from '@angular/core';
import {TemplateOverviewFilterComponent} from './template-overview-filter/template-overview-filter.component';
import {TemplateOverviewResultsComponent} from './template-overview-results/template-overview-results.component';
import {FilterCriteria} from '../../../../shared/components/overviews/filter-base';
import {OrderSummaryRequestView} from '../../../order/models/order-summary-view';
import {TemplateSummaryResponseView, TemplateSummaryView} from '../../models/template-symmary-view';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import { SharedPipesModule } from '@src/app/shared/pipes/shared-pipes.module';
import { TranslateWagonStatusPipe } from '@src/app/shared/pipes/translate-wagon-status.pipe';
import {ModalWindows} from '../../../../shared/components/modal-windows/modal-windows';
import {
    OverviewFilterControlPanelComponent
} from "../../../../shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component";
import {
    OverviewResultControlPanelComponent
} from "../../../../shared/components/overviews/overview-result-control-panel/overview-result-control-panel.component";

describe('TemplateOverviewComponent', () => {
    let component: TemplateOverviewComponent;
    let fixture: ComponentFixture<TemplateOverviewComponent>;
    let templateService;
    let mockFilterComponent: jasmine.SpyObj<TemplateOverviewFilterComponent>;

    beforeEach(async () => {
        // Mock the TemplateService and its methods
        templateService = jasmine.createSpyObj('TemplateService', ['searchTemplates']);

        // Mock FilterComponent to track calls on methods like resetFilter and countActiveFilters
        mockFilterComponent = jasmine.createSpyObj('TemplateOverviewFilterComponent', ['resetFilter', 'countActiveFilters']);

        // Configure the testing module
        await TestBed.configureTestingModule({
            declarations: [
                TemplateOverviewComponent,
                TemplateOverviewFilterComponent,
                TemplateOverviewResultsComponent,
                // Removed from declarations because it's a standalone component
            ],
            imports: [
                OverviewFilterControlPanelComponent, // Added to imports since it's standalone
                OverviewResultControlPanelComponent, // You can add this too if it's standalone
                TranslateModule.forRoot(),
                HttpClientTestingModule,
                SharedPipesModule
            ],
            providers: [
                {provide: TemplateService, useValue: templateService},
                {provide: ChangeDetectorRef, useValue: {detectChanges: () => {}}},
                TranslateWagonStatusPipe,
                ModalWindows
            ]
        }).compileComponents();

        // Create component instance
        fixture = TestBed.createComponent(TemplateOverviewComponent);
        component = fixture.componentInstance;

        // Inject the mock filter component
        component.filter = mockFilterComponent; // Assign the mock filter component
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.numberOfResults).toBe(0);
        expect(component.activeFilterCount).toBe(0);
        expect(component.totalNumberOfResults).toBe(0);
        expect(component.tableData).toEqual([]);
        expect(component.isLoading).toBeInstanceOf(Subject);
    });

    it('should fetch data on filter criteria change', () => {
        const mockCriteria: FilterCriteria = {offset: 0, limit: 25, sort: ''};
        const mockResponse: TemplateSummaryResponseView = {
            offset: 0,
            total: 100,
            limit: 25,
            items: [{ /* mock template data */} as TemplateSummaryView] // Populate with realistic mock data
        };

        // Make the searchTemplates method return an observable of mockResponse
        templateService.searchTemplates.and.returnValue(of(mockResponse));

        // Call the method to trigger the data fetch
        component.onFilterCriteriaChange(mockCriteria);

        // Validate that searchTemplates method was called with the correct parameters
        expect(templateService.searchTemplates).toHaveBeenCalledWith(component.request);

        // Validate that the component properties are updated with the mock response
        expect(component.numberOfResults).toBe(mockResponse.items.length);
        expect(component.totalNumberOfResults).toBe(mockResponse.total);
        expect(component.tableData.length).toBe(mockResponse.items.length);
    });

    it('should reset filters', () => {
        component.handleResetFilters(); // Trigger the resetFilters method
        expect(component.activeFilterCount).toBe(0); // Validate active filter count
        expect(mockFilterComponent.resetFilter).toHaveBeenCalled(); // Ensure the resetFilter method is called
    });

    it('should load more results', () => {
        component.request = {offset: 0, limit: 25} as OrderSummaryRequestView; // Set the initial request
        spyOn(component, 'fetchData'); // Spy on fetchData method

        // Call the loadMoreResults method
        component.loadMoreResults();

        // Validate that the offset is updated and fetchData method is called
        expect(component.request.offset).toBe(25); // Ensure offset increments
        expect(component.fetchData).toHaveBeenCalled(); // Ensure fetchData is called
    });
});
