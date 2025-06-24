import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {TableHeader} from '../../../models/table';
import {SortConditionsModel} from '../../../models/sort.models';
import {NgForOf, NgIf} from '@angular/common';

export interface HeaderConfig {
    fieldName: string;
    sortable: boolean;
    width: string;
    textAlign?: string;
    label?: string;
}

@Component({
    selector: 'app-overview-result-table-header',
    standalone: true,
    templateUrl: './overview-result-table-header.component.html',
    imports: [
        NgForOf,
        NgIf
    ],
    styleUrls: ['./overview-result-table-header.component.scss']
})
export class OverviewResultTableHeaderComponent implements OnInit {
    @Input() headersConfig: HeaderConfig[] = [];
    @Input() translationKey: string = '';

    @Output() sortConditionsChange: EventEmitter<SortConditionsModel[]> = new EventEmitter();

    tableHeaders: TableHeader[] = [];
    sortConditions: SortConditionsModel[] = [];

    constructor(protected translate: TranslateService) {}

    ngOnInit(): void {
        this.tableHeaders = this.buildTableHeaders(this.headersConfig, this.translationKey);
    }

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

    getSortedCondition(fieldName: string): SortConditionsModel | undefined {
        return this.sortConditions.find(sc => sc.field === fieldName);
    }

    onClickSortField(fieldName: string): void {
        this.changeSortCriteria(fieldName);
        this.sortConditionsChange.emit(this.sortConditions);
    }

    getAriaSort(fieldName: string): string {
        const condition = this.getSortedCondition(fieldName);
        if (!condition) {
            return 'none';
        }
        return condition.asc ? 'ascending' : 'descending';
    }

    isAscending(fieldName: string): boolean {
        const condition = this.getSortedCondition(fieldName);
        return condition ? condition.asc === true : false;
    }

    isDescending(fieldName: string): boolean {
        const condition = this.getSortedCondition(fieldName);
        return condition ? condition.asc === false : false;
    }
}