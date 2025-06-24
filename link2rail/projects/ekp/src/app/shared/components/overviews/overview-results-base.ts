import {TranslateService} from '@ngx-translate/core';
import {TableHeader} from "../../models/table";
import {SortConditionsModel} from "../../models/sort.models";
import {Component, EventEmitter, Output} from "@angular/core";

/**
 * Interface defining the configuration for a table header.
 */
export interface HeaderConfig {
    /**
     * The name of the field in the table data.
     */
    fieldName: string;
    /**
     * Indicates if the column is sortable.
     */
    sortable: boolean;
    /**
     * The width of the column.
     */
    width: string;
    /**
     * Optional text alignment for the column.
     */
    textAlign?: string;
    /**
     * Optional label to display in the table header.
     */
    label?: string;
}

/**
 * Abstract base class for overview results components.
 * Provides shared functionality for building table headers and handling sort conditions.
 *
 * @template T - The type of data contained in the table.
 */
@Component({
  template: ''
})
export abstract class OverviewResultsBase<T> {
    tableData: T[] = [];
    tableHeaders: TableHeader[] = [];
    sortConditions: SortConditionsModel[] = [];
    @Output() addSortCondition: EventEmitter<SortConditionsModel[]> = new EventEmitter();

    /**
     * Creates an instance of OverviewResultsBase.
     * @param translate Service for handling translations.
     */
    protected constructor(protected translate: TranslateService) {}

    /**
     * Builds table headers based on the provided configuration and translation key.
     *
     * For each header configuration, it translates the key constructed as `${translationKey}.${config.fieldName}`.
     * If the translated value is an object, it uses its "text" property for headerText and its "title" property for
     * headerTitle; otherwise, it uses the translated value directly for both.
     *
     * @param headersConfig - Array of header configurations.
     * @param translationKey - Translation key used to generate default header labels.
     * @returns An array of TableHeader objects.
     */
    protected buildTableHeaders(headersConfig: HeaderConfig[], translationKey: string): TableHeader[] {
        return headersConfig.map(config => {
            const translation = this.translate.instant(`${translationKey}.${config.fieldName}`);
            const headerText = (typeof translation === 'object' && translation !== null) ? translation.text : translation;
            const headerTitle = (typeof translation === 'object' && translation !== null) ? translation.title : translation;
            return {
                fieldName: config.fieldName,
                headerText: headerText,
                headerTitle: headerTitle,
                minWidth: config.width,
                maxWidth: config.width,
                textAlign: config.textAlign || 'left',
                sortable: config.sortable
            };
        });
    }

    /**
     * Changes the sort criteria based on a field name.
     * If no sort conditions exist, adds a new condition.
     * If the field is already sorted first, reverses the sort direction.
     * Otherwise, pushes the new condition to the start of the array.
     *
     * @param fieldName - The field to sort by.
     */
    protected changeSortCriteria(fieldName: string): void {
        const length = this.sortConditions.length;
        if (length === 0) {
            this.sortConditions.push({asc: true, field: fieldName});
            return;
        }
        const idx = this.sortConditions.findIndex(sc => sc.field === fieldName);
        if (idx === 0) {
            this.sortConditions[0].asc = !this.sortConditions[0].asc;
            return;
        }
        if (length > 1) {
            this.sortConditions.pop();
        }
        this.sortConditions.unshift({asc: true, field: fieldName});
    }

    /**
     * Returns the sort condition for a given field, if one exists.
     *
     * @param fieldName - The field whose sort condition is requested.
     * @returns The SortConditionsModel for the field, or undefined if not set.
     */
    getSortedCondition(fieldName: string): SortConditionsModel | undefined {
        return this.sortConditions.find(sc => sc.field === fieldName);
    }

    /**
     * Handles clicking on a sort field.
     * Updates the sort criteria and emits an event to notify listeners.
     *
     * @param fieldName - The field on which the sort was initiated.
     */
    onClickSortField(fieldName: string): void {
        this.changeSortCriteria(fieldName);
        this.addSortCondition.emit(this.sortConditions);
    }

    /**
     * Checks if the sort condition for the specified field is set to ascending.
     *
     * @param fieldName - The name of the field to check.
     * @returns True if the sort condition is ascending, false otherwise.
     */
    isAscending(fieldName: string): boolean {
        const condition = this.getSortedCondition(fieldName);
        return condition ? condition.asc === true : false;
    }

    /**
     * Checks if the sort condition for the specified field is set to descending.
     *
     * @param fieldName - The name of the field to check.
     * @returns True if the sort condition is descending, false otherwise.
     */
    isDescending(fieldName: string): boolean {
        const condition = this.getSortedCondition(fieldName);
        return condition ? condition.asc === false : false;
    }
}
