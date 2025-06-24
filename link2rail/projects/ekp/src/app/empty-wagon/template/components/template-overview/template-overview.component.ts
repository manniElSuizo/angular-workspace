import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {TemplateOverviewResultsComponent} from "./template-overview-results/template-overview-results.component";

import {FilterCriteria} from "../../../../shared/components/overviews/filter-base";
import {OrderSummaryRequestView} from "../../../order/models/order-summary-view";
import {CommercialLocationView} from "../../../common/models/commercial-location-view";
import {DemandWagonTypeView} from "../../../common/models/demand-wagon-type-view";
import {IdNameType} from "../../../api/generated";

import {Subject} from "rxjs";
import {TemplateOverviewFilterComponent} from "./template-overview-filter/template-overview-filter.component";
import {TemplateService} from "../../services/template.service";
import {TemplateSummaryResponseView, TemplateSummaryView} from "../../models/template-symmary-view";
import {SortConditionsModel} from "../../../../shared/models/sort.models";
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';
import {
    OverviewFilterControlPanelComponent
} from "../../../../shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component";
import {
    OverviewResultControlPanelComponent
} from "../../../../shared/components/overviews/overview-result-control-panel/overview-result-control-panel.component";

@Component({
    selector: 'app-template-overview',
    templateUrl: './template-overview.component.html',
    styleUrl: './template-overview.component.scss',
})

export class TemplateOverviewComponent implements AfterViewInit, OnInit {
    @ViewChild(TemplateOverviewFilterComponent, {static: false}) filter!: TemplateOverviewFilterComponent;
    @ViewChild(TemplateOverviewResultsComponent, {static: false}) results: TemplateOverviewResultsComponent;
    @ViewChild(OverviewFilterControlPanelComponent, {static: true}) filterControlPanel!: OverviewFilterControlPanelComponent;
    @ViewChild(OverviewResultControlPanelComponent) resultControlPanel!: OverviewResultControlPanelComponent;

    public numberOfResults: number = 0;
    public activeFilterCount: number = 0;
    public totalNumberOfResults: number = 0;
    public selectedFilterCriteria: FilterCriteria;
    public tableData: TemplateSummaryView[] = [];
    public response: TemplateSummaryResponseView;
    public isLoading: Subject<boolean> = new Subject<boolean>();
    protected loadingInProgress: boolean = true;
    protected showLoadButton: boolean = false;
    protected downloadInProgress: boolean = false;
    request: OrderSummaryRequestView;

    constructor(
        private cd: ChangeDetectorRef,
        private templateService: TemplateService,
        private fileExportService: FileExportService,
    ) {

        this.isLoading.next(false);
    }

    ngAfterViewInit(): void {
        this.activeFilterCount = this.filter.countActiveFilters();
        this.prepareRequest();
        this.fetchData();
        this.cd.detectChanges();
    }

    ngOnInit(): void {
        this.numberOfResults = 0;
    }

    handleResetFilters() {
        this.filter.resetFilter();
        this.activeFilterCount = 0;
    }

    handleDownloadReport() {
        this.downloadInProgress = true;
        let limit = this.request.limit;
        let offset = this.request.offset;
        this.request.limit = this.totalNumberOfResults;
        this.request.offset = 0;

        this.templateService.searchTemplates(this.request).subscribe({
            next: templates => {
                this.response = templates;
                const exportData: TemplateSummaryView[] = [];
                templates.items.forEach(template => {exportData.push(template);});
                this.fileExportService.exportTemplateOverviewToCsv(exportData);
                this.downloadInProgress = false;
            },
            error: error => {
                this.downloadInProgress = false;
                throw error;
            }
        });
        this.request.limit = limit;
        this.request.offset = offset;

    }

    onFilterCriteriaChange(criteria: FilterCriteria) {
        this.tableData = [];
        this.selectedFilterCriteria = criteria;
        this.activeFilterCount = this.filter?.countActiveFilters();
        this.prepareRequest();
        this.fetchData();
    }

    fetchData() {
        this.isLoading.next(true);
        this.templateService.searchTemplates(this.request).subscribe(templates => {
            if (templates.offset === 0) this.tableData = [];
            this.response = templates;
            this.totalNumberOfResults = Number(templates.total);

            templates.items.forEach(template => {this.tableData.push(template);})
            this.numberOfResults = this.tableData.length;
        });
        this.isLoading.next(false);
    }

    sortResults() {
        const filter = this.filter.filterCriteria;
        filter.offset = 0;
        filter.sort = this.mapSortConditionsToString(this.results.sortConditions);
        this.onFilterCriteriaChange(filter);
    }

    loadMoreResults() {
        this.request.offset += this.request.limit;
        this.fetchData();
    }

    private prepareRequest() {
        const filter = this.selectedFilterCriteria;
        this.request = {
            templateName: this.mapSelectedFilterToArray(filter?.templateName),
            demandLocations: this.mapDemandLocations(filter?.demandLocation),
            demandWagonTypes: this.mapDemandWagonTypes(filter?.demandWagonType),
            ordererSgvs: this.mapIdNameType(filter?.ordererSgv),
            ordererPartners: this.mapIdNameType(filter?.ordererPartner),
            shipperSgvs: this.mapIdNameType(filter?.shipperSgv),
            shipperPartners: this.mapIdNameType(filter?.shipperPartner),
            loadRunCountryCodeIso: this.mapSelectedFilterToArray(filter?.loadRunCountry),
            offset: this.selectedFilterCriteria?.offset || 0,
            limit: this.selectedFilterCriteria?.limit || 25,
            sort: this.selectedFilterCriteria?.sort || '+templateName'
        } as OrderSummaryRequestView;
    }

    private mapDemandLocations(demandLocations: any[]): CommercialLocationView [] {
        if (!demandLocations) return [];

        return demandLocations.map(location => {

            const {key = null} = location;
            const parts = String(key).split('_');

            return {
                number: parts[0],
                owner: parts[1],
                countryCodeUic: parts[2]
            } as CommercialLocationView;
        });
    }

    private mapDemandWagonTypes(demandWagonTypes: any[]): DemandWagonTypeView [] {
        if (!demandWagonTypes) return [];
        return demandWagonTypes.map(wagonType => {

            const {key = null} = wagonType;
            const parts = String(key).split('_');

            return {
                code: parts.length === 1 ? null : parts[1],
                number: parts[0],
            } as DemandWagonTypeView;
        });
    }

    private mapSelectedFilterToArray(values: any[]): string[] {
        if (!values || values.length === 0) return [];
        return values.map(value => {
            return value.key;
        })
    }

    private mapIdNameType(values: any[]): IdNameType[] {
        if (!values || values.length === 0) return [];
        return values.map(value => {
            return {
                id: value.key,
                name: value.value,
            } as IdNameType;

        })
    }

    private mapSortConditionsToString(conditions: SortConditionsModel[]): string {

        if (!conditions || !conditions.length) return '+templateName';
        const sortFields = new Map<string, string>();

        sortFields.set('templateName', 'templateName');
        sortFields.set('ordererSgv', 'orderer.sgvName');
        sortFields.set('ordererPartner', 'orderer.siteName');
        sortFields.set('shipperSgv', 'shipper.sgvName');
        sortFields.set('shipperPartner', 'shipper.siteName');

        return conditions.filter(value => sortFields.has(value.field))
                         .map(value => `${value.asc ? '+' : '-'}${sortFields.get(value.field)}`).join(',');
    }

    refresh() {
        this.prepareRequest();
        this.fetchData();
    }
}
