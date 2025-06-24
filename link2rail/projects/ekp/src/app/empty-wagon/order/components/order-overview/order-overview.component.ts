import {AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild} from '@angular/core';
import {OrderOverviewResultsComponent} from "./order-overview-results/order-overview-results.component";

import {OrderOverviewFilterComponent} from "./order-overview-filter/order-overview-filter.component";
import {FilterCriteria} from "../../../../shared/components/overviews/filter-base";
import {OrderService} from "../../services/order.service";
import {OrderSummaryRequestView, OrderSummaryResponseView, OrderSummaryView} from "../../models/order-summary-view";
import {CommercialLocationView} from "../../../common/models/commercial-location-view";
import {DemandWagonTypeView} from "../../../common/models/demand-wagon-type-view";
import {IdNameType} from "../../../api/generated";

import {Subject} from "rxjs";
import {PermissionService} from "../../../../shared/permission/PermissionService";
import {Authorization} from "../../../../trainorder/models/authorization";
import {OrderDialogService} from "../../services/order-dialog.service";
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';
import {OrderAction} from "../order-creation/order-creation.component";
import {ActivatedRoute} from "@angular/router";
import {StorageKeys} from "../../../../shared/services/storage/storage.service.base";
import {SessionStorageService} from "../../../../shared/services/storage/session-storage.service";
import {
    OverviewFilterControlPanelComponent
} from "../../../../shared/components/overviews/overview-filter-control-panel/overview-filter-control-panel.component";
import {
    OverviewResultControlPanelComponent
} from "../../../../shared/components/overviews/overview-result-control-panel/overview-result-control-panel.component";

@Component({
    selector: 'app-order-overview',
    templateUrl: './order-overview.component.html',
    styleUrl: './order-overview.component.scss',
})

export class OrderOverviewComponent implements AfterViewInit, OnInit {
    @ViewChild(OrderOverviewFilterComponent, {static: false}) filter!: OrderOverviewFilterComponent;
    @ViewChild(OrderOverviewResultsComponent, {static: false}) results: OrderOverviewResultsComponent;
    @ViewChild(OverviewFilterControlPanelComponent, {static: true}) filterControlPanel!: OverviewFilterControlPanelComponent;
    @ViewChild(OverviewResultControlPanelComponent) resultControlPanel!: OverviewResultControlPanelComponent;

    public numberOfResults: number = 0;
    public activeFilterCount: number = 0;
    public totalNumberOfResults: number = 0;
    public selectedFilterCriteria: FilterCriteria;
    public tableData: OrderSummaryView[] = [];
    public response: OrderSummaryResponseView;
    public isLoading: Subject<boolean> = new Subject<boolean>();
    public request: OrderSummaryRequestView;
    protected loadingInProgress: boolean = true;
    protected showLoadButton: boolean = false;
    protected permissionService: PermissionService = inject(PermissionService);
    protected readonly authorization = Authorization;
    protected downloadInProgress: boolean = false;

    constructor(
        private cd: ChangeDetectorRef,
        private orderService: OrderService,
        private dialogService: OrderDialogService,
        private fileExportService: FileExportService,
        private route: ActivatedRoute
    ) {
        this.tableData = [];
        this.isLoading.next(false);
    }

    createOrder() {
        this.dialogService.openOrderCreationDialog(OrderAction.CREATE).subscribe({
            next: (result) => console.log('Order creation dialog closed', result),
            error: (error) => console.error('Error opening order creation dialog', error)
        });
    }

    ngAfterViewInit(): void {
        this.activeFilterCount = this.filter.countActiveFilters();
        this.prepareRequest();
        this.fetchData();
        this.cd.detectChanges();
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['searchReference']) {
                const storage = new SessionStorageService();
                storage.setItem(StorageKeys.EMPTY_WAGON_ORDER_OVERVIEW_FILTER_STORAGE_KEY, JSON.stringify({searchReference: params['searchReference']}))

            }
        });
        this.tableData = [];

        this.numberOfResults = 0;
    }

    handleResetFilters() {
        this.filter.resetFilter();
        this.activeFilterCount = this.filter?.countActiveFilters();
    }

    handleDownloadReport() {
        this.downloadInProgress = true;
        const limit = this.request.limit;
        const offset = this.request.offset;
        this.request.limit = this.totalNumberOfResults;
        this.request.offset = 0;

        this.orderService.searchOrders(this.request).subscribe({
            next: (orders) => {
                const exportData: OrderSummaryView[] = [];
                orders.items.forEach(order => {exportData.push(order); });
                this.fileExportService.exportOrderOverviewToCsv(exportData);
                this.downloadInProgress = false;
            },
            error: (error) => {
                console.error('Error fetching data', error);
                this.isLoading.next(false);
                this.downloadInProgress = false;
            }
        });

        this.request.limit = limit;
        this.request.offset = offset;

    }

    onFilterCriteriaChange(criteria: FilterCriteria) {
        console.log('OrderOverviewComponent onFilterCriteriaChange this.tableData', this.tableData);
        this.tableData = [];
        this.selectedFilterCriteria = criteria;
        this.activeFilterCount = this.filter?.countActiveFilters();
        this.prepareRequest();
        this.fetchData();
    }

    private fetchData() {
        this.isLoading.next(true);

        const orderSummaryResponseViewObservable = this.orderService.searchOrders(this.request);
        if (!orderSummaryResponseViewObservable) return;
        orderSummaryResponseViewObservable.subscribe({
            next: (orders) => {
                if (orders.offset === 0)
                    this.tableData = [];
                this.response = orders;
                this.numberOfResults = Number(orders.offset) + orders.items.length;
                this.totalNumberOfResults = Number(orders.total);
                orders.items.forEach(order => { this.tableData.push(order); });
                this.isLoading.next(false);
            },
            error: (error) => {
                console.error('Error fetching data', error);
                this.isLoading.next(false);
            }
        });
    }

    loadMoreResults() {
        this.request.offset += this.request.limit;
        this.fetchData();
    }

    private prepareRequest() {
        const filter = this.selectedFilterCriteria;
        this.request = {
            templateName: [],
            demandLocations: this.mapDemandLocations(filter?.demandLocation),
            demandWagonTypes: this.mapDemandWagonTypes(filter?.demandWagonType),
            ordererSgvs: this.mapIdNameType(filter?.ordererSgv),
            ordererPartners: this.mapIdNameType(filter?.ordererPartner),
            loadRunCountryCodeIso: this.mapSelectedFilterToArray(filter?.loadRunCountry),
            origin: this.mapSelectedFilterToArray(filter?.origin),
            status: this.mapSelectedFilterToArray(filter?.status),
            deliveryDateTimeFrom: this.mapDemandDateTimeFrom(filter?.demandDateFrom),
            deliveryDateTimeTo: this.mapDemandDateTimeTo(filter?.demandDateTo),
            reference: filter?.searchReference || null,
            offset: this.selectedFilterCriteria?.offset || 0,
            limit: this.selectedFilterCriteria?.limit || 25,
            sort: this.selectedFilterCriteria?.sort || '',
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

    private mapDemandDateTimeFrom(date: string): string {
        if (!date) return null;
        const localDate = new Date(date);
        localDate.setHours(0, 0, 0, 0);
        return localDate.toISOString();
    }

    private mapDemandDateTimeTo(date: string): string {
        if (!date) return null;
        const demandDate = new Date(date);
        demandDate.setHours(23, 59, 59, 999);
        return demandDate.toISOString();
    }

}
