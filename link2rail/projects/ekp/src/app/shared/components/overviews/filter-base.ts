import {BehaviorSubject} from 'rxjs';
import {FormGroup} from '@angular/forms';
import {StorageServiceBase} from "../../services/storage/storage.service.base";
import {SessionStorageService} from "../../services/storage/session-storage.service";
import {Component, EventEmitter, Inject, Output} from "@angular/core";

export interface FilterCriteria {
    [key: string]: any;
}

@Component({
    template: '<div></div>' // Add a basic template to resolve the error
})
export abstract class FilterBase {
    @Output() filterChange = new EventEmitter<FilterCriteria>();
    filterForm: FormGroup;
    protected storage: StorageServiceBase;
    filterCriteria: FilterCriteria;
    private readonly classStyle = 'focused';
    protected storageKey: string;
    protected activeFilterCount = 0;

    public activeFilters$ = new BehaviorSubject<number>(0);
    public isFilterActive$ = new BehaviorSubject<boolean>(false);

    protected constructor(
            @Inject('STORAGE_KEY') storageKey: string
        ) {
            this.storage = new SessionStorageService();
            this.storageKey = storageKey;
            this.initializeFilter();
        }

    protected abstract createFilterForm(): void;

    protected abstract initializeFilterCriteria(): FilterCriteria;

    /**
     * Basic focus handler for date fields.
     * If this behavior is common in many components, consider extracting it as a directive.
     *
     * @param event Focus event
     */
    protected onFocus(event: any): void {
        event.target.classList.add(this.classStyle);
    }

    /**
     * Basic blur handler for date fields.
     * If this behavior is common in many components, consider extracting it as a directive.
     *
     * @param event Blur event
     */
    protected onBlur(event: any): void {
        if (!event.target.value) {
            event.target.classList.remove(this.classStyle);
        }
    }

    public countActiveFilters(): number {
        if (!this.filterForm) return 0;

        return Object.keys(this.filterForm.controls)
                     .filter(key => {
                         const control = this.filterForm.get(key);
                         return control && control.value &&
                             (Array.isArray(control.value) ? control.value.length > 0 : !!control.value);
                     }).length;
    }

    public onFilterChange($event: Event): void {
        this.updateFilterCriteria();
        this.saveFilterState();
        this.updateActiveFilters();
        this.emitFilterChanged();
    }

    public resetFilter(): void {
        this.filterForm.reset();
        this.filterCriteria = this.initializeFilterCriteria();
        // Ensure form values are set to initial criteria
        this.setFormValues(this.filterCriteria);
        this.storage.removeItem(this.storageKey);
        this.updateActiveFilters();
        this.emitFilterChanged();
    }

    /**
     * Relays multi-select change events to filter change processing.
     *
     * @param $event Multi-select event.
     */
    multiselectChangeEventListener($event: Event): void {
        this.onFilterChange($event);
    }

    /**
     * Converts the current filter form values to filter criteria for storage.
     */
    protected filterFormToRequest4Storage(): void {
        if (this.filterForm) {
            this.filterCriteria = this.filterForm.value;
        }
    }

    /**
     * Emits the updated filter criteria.
     */
    protected emitFilterChange(): void {
        this.filterChange.emit(this.filterCriteria);
    }

    /**
     * Stores the current filter criteria in storage.
     */
    protected storeFilterState(): void {
        this.filterFormToRequest4Storage();
        this.storage.setItem(this.storageKey, JSON.stringify(this.filterCriteria));
    }

    protected restoreFilterState(): void {
        const savedState = this.storage.getItem(this.storageKey);
        if (savedState) {
            this.filterCriteria = JSON.parse(savedState);
            this.setFormValues(this.filterCriteria);
            this.updateActiveFilters();
        }
        if (!savedState || !this.activeFilterCount) this.resetFilter();
        this.emitFilterChanged();

    }

    private initializeFilter(): void {
        this.createFilterForm();
        this.filterCriteria = this.initializeFilterCriteria();
        this.restoreFilterState();
    }

    updateFilterCriteria(): void {
        console.log('Updating filter criteria');
        console.log("filterForm", this.filterForm);
        Object.keys(this.filterForm.controls).forEach(controlName => {
            const controlValue = this.getControlValue(controlName);
            this.updateCriteriaForControl(controlName, controlValue);
        });
    }

    private getControlValue(controlName: string): any {

        const control = this.filterForm.get(controlName);
        return control.value;
    }

    private updateCriteriaForControl(controlName: string, controlValue: any): void {
        if (this.isValidValue(controlValue)) {
            this.filterCriteria[controlName] = controlValue;

        } else {
            delete this.filterCriteria[controlName];
        }
    }

    private isValidValue(value: any): boolean {
        return value !== null && value !== undefined && value !== '';
    }

    private updateActiveFilters(): void {
        this.activeFilterCount = this.countActiveFilters();
        this.activeFilters$.next(this.activeFilterCount);
        this.isFilterActive$.next(this.activeFilterCount > 0);
    }

    private saveFilterState(): void {
        this.storage.setItem(this.storageKey, JSON.stringify(this.filterCriteria));
    }

    private setFormValues(criteria: FilterCriteria): void {
        Object.keys(criteria).forEach(key => {
            if (this.filterForm.contains(key)) {
                this.filterForm.get(key).setValue(criteria[key], {emitEvent: false});
            }
        });
    }

    protected emitFilterChanged(): void {
        this.filterChange.emit(this.filterCriteria);
    }
}
