import {TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FilterBase, FilterCriteria} from './filter-base';
import {AppService} from "../../../app.service";
import {SessionStorageService} from "../../services/storage/session-storage.service";
import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
class TestFilterComponent extends FilterBase {
    constructor() {
        super('test-storage-key');
    }

    protected createFilterForm(): void {
        this.filterForm = new FormGroup({
            testField: new FormControl([])
        });
    }

    protected initializeFilterCriteria(): FilterCriteria {
        return {
            testField: []
        };
    }

    public countActiveFilters(): number {
        return Object.values(this.filterCriteria).filter(value =>
            Array.isArray(value) ? value.length > 0 : !!value
        ).length;
    }
}

describe('FilterBase', () => {
    let component: TestFilterComponent;
    let storageService: SessionStorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            providers: [
                AppService,
                SessionStorageService,
                TestFilterComponent
            ]
        });

        storageService = TestBed.inject(SessionStorageService);
        component = TestBed.inject(TestFilterComponent);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with empty filters', () => {
        component.resetFilter();
        expect(component.activeFilters$.getValue()).toBe(0);
        expect(component.isFilterActive$.getValue()).toBeFalse();
    });

    it('should update active filters count when filter changes', () => {
        const mockEvent = new Event('change');
        component['filterForm'].get('testField').setValue(['test']);
        component.onFilterChange(mockEvent);

        expect(component.activeFilters$.getValue()).toBe(1);
        expect(component.isFilterActive$.getValue()).toBeTrue();
    });

    it('should reset filters', () => {
        const mockEvent = new Event('change');
        component['filterForm'].get('testField').setValue(['test']);
        component.onFilterChange(mockEvent);
        component.resetFilter();

        expect(component.activeFilters$.getValue()).toBe(0);
        expect(component.isFilterActive$.getValue()).toBeFalse();
        expect(component['filterForm'].get('testField').value).toEqual([]);
    });

    it('should restore filter state from storage', () => {
        const testState = {testField: ['savedValue']};
        sessionStorage.setItem('test-storage-key', JSON.stringify(testState));

        component['restoreFilterState']();

        expect(component['filterForm'].get('testField').value).toEqual(['savedValue']);
    });

    it('should save filter state to storage', () => {
        const mockEvent = new Event('change');
        component['filterForm'].get('testField').setValue(['test']);
        component.onFilterChange(mockEvent);

        const savedState = JSON.parse(sessionStorage.getItem('test-storage-key'));
        expect(savedState.testField).toEqual(['test']);
    });
});