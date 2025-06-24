import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OverviewResultTableHeaderComponent} from './overview-result-table-header.component';
import {TranslateService} from '@ngx-translate/core';

describe('OverviewResultTableHeaderComponent', () => {
    let component: OverviewResultTableHeaderComponent;
    let fixture: ComponentFixture<OverviewResultTableHeaderComponent>;
    let translateServiceStub: Partial<TranslateService>;

    beforeEach(async () => {
        // Creating a stub for the TranslateService
        translateServiceStub = {
            // This stub returns a mock translation.
            // If key includes 'object', it returns an object else returns key string.
            instant: (key: string) => {
                // If a key contains "object", return object with text and title.
                if (key.includes('object')) {
                    return {text: key + '_text', title: key + '_title'};
                }
                return key;
            }
        };

        await TestBed.configureTestingModule({
            imports: [OverviewResultTableHeaderComponent],
            providers: [
                {provide: TranslateService, useValue: translateServiceStub}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OverviewResultTableHeaderComponent);
        component = fixture.componentInstance;
        // set up default inputs
        component.translationKey = 'test';
        component.headersConfig = [
            {fieldName: 'name', sortable: true, width: '100px', textAlign: 'center'},
            {fieldName: 'age', sortable: false, width: '50px'}
        ];
        // Spy on EventEmitter emit function
        spyOn(component.sortConditionsChange, 'emit');
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should build table headers on initialization', () => {
        // Since ngOnInit is called, tableHeaders should be populated.
        expect(component.tableHeaders.length).toBe(2);
        // Check if header properties are properly set.
        const headerName = component.tableHeaders[0];
        expect(headerName.fieldName).toBe('name');
        // Using provided translation stub, the translation key becomes 'test.name'
        expect(headerName.headerText).toBe('test.name');
        // Default textAlign overridden by input value
        expect(headerName.textAlign).toBe('center');

        const headerAge = component.tableHeaders[1];
        expect(headerAge.fieldName).toBe('age');
        expect(headerAge.headerText).toBe('test.age');
        // Default textAlign should be equal to 'left' as not provided
        expect(headerAge.textAlign).toBe('left');
    });

    it('should update sort conditions and emit event on click sort field when no prior conditions exist', () => {
        // Initially, sortConditions should be empty.
        expect(component.sortConditions.length).toBe(0);
        // Call click sort field for 'name'
        component.onClickSortField('name');
        // Should add a sort condition for 'name'
        expect(component.sortConditions.length).toBe(1);
        expect(component.sortConditions[0]).toEqual({asc: true, field: 'name'});
        // Verify event emission.
        expect(component.sortConditionsChange.emit).toHaveBeenCalled();
    });

    it('should reverse sort order if the same field is clicked again as first sorted field', () => {
        // Initialize with a condition for 'name'
        component.sortConditions = [{asc: true, field: 'name'}];
        // Call click sort field for 'name' again
        component.onClickSortField('name');
        // It should reverse the sorting flag.
        expect(component.sortConditions[0].asc).toBe(false);
        // Verify event emission.
        expect(component.sortConditionsChange.emit).toHaveBeenCalled();
    });

    it('should unshift new sort condition if field is not the first sorted condition', () => {
        // Start with a condition from a different field.
        component.sortConditions = [{asc: true, field: 'age'}];
        // Click on a new field 'name'
        component.onClickSortField('name');
        // The new condition should be added at beginning.
        expect(component.sortConditions[0]).toEqual({asc: true, field: 'name'});
        // If more than one condition exists, the older one might be popped as per implementation.
        expect(component.sortConditions.length).toBeLessThanOrEqual(2);
        expect(component.sortConditionsChange.emit).toHaveBeenCalled();
    });

    it('should return sorted condition for a given field', () => {
        component.sortConditions = [
            {asc: false, field: 'name'},
            {asc: true, field: 'age'}
        ];
        const sortedCondition = component.getSortedCondition('name');
        expect(sortedCondition).toEqual({asc: false, field: 'name'});
        const undefinedCondition = component.getSortedCondition('unknown');
        expect(undefinedCondition).toBeUndefined();
    });
});
