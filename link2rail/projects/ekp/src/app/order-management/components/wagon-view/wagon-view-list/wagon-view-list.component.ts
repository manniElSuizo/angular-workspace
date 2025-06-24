import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WagonSearchSummary, OrderKey } from '../models/api-wagon-list';
import { WagonViewFilterComponent } from './wagon-view-filter/wagon-view-filter.component';
import { AutoUnsubscribe } from '@src/app/shared/decorater/auto-unsubscribe.decorater';
import { TableHeader } from '@src/app/order-management/models/table-header';
import { TrackingHistoryWagonDialogService } from '@src/app/shared/components/tracking-history-wagon/service/tracking-history-wagon-dialog.service';
import { VehicleDetailsDialogService } from '@src/app/shared/components/vehicle-details/service/vehicle-details-dialog.service';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { OrderDetailsDialogService } from '@src/app/shared/components/order-details/service/order-details-dialog.service';

@Component({
  selector: 'app-wagon-view-list',
  templateUrl: './wagon-view-list.component.html',
  styleUrl: './wagon-view-list.component.scss'
})
@AutoUnsubscribe
export class WagonViewListComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild(WagonViewFilterComponent, { static: false }) filter!: WagonViewFilterComponent;

  protected loadingInProgress: boolean = true;
  protected showLoadButton: boolean = false;
  protected tableHeaders: TableHeader[] = [];
  protected tableData: WagonSearchSummary[] = [];

  constructor(
    private translate: TranslateService,
    public permissionService: PermissionService,
    private cd: ChangeDetectorRef,
    private trackingHistoryWagonDialogService: TrackingHistoryWagonDialogService,
    private orderDetailsDialogService: OrderDetailsDialogService,
    private vehicleDetailsDialogService: VehicleDetailsDialogService
  ) {
    this.createTableHeaders();
  }

  ngOnDestroy(): void {
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    this.filter?.loadingInProgress$.subscribe(b => {
      this.loadingInProgress = b;
    });
    this.registerForLoadMoreButtonStatusChanges();
  }

  createTableHeaders() {
    const widthIconHeader = '25px';
    this.tableHeaders = [
      {
        value: 'wagonNumber',
        text: this.translate.instant('Wagon-overview.Table-header.Wagon-number'),
        minWidth: '140px',
        maxWidth: '140px',
        textAlign: 'left',
        sortable: true
      },
      {
        value: 'loadingStatus',
        minWidth: widthIconHeader,
        maxWidth: widthIconHeader,
        textAlign: 'center',
      },
      {
        value: 'hasDamage',
        minWidth: widthIconHeader,
        maxWidth: widthIconHeader,
      },
      {
        value: 'shippingTime',
        text: this.translate.instant('Wagon-overview.Table-header.Date-of-dispatch'),
        minWidth: '120px',
        maxWidth: '120px',
        textAlign: 'center',
        sortable: true
      },
      {
        value: 'expectedArrivalTime',
        text: this.translate.instant('Wagon-overview.Table-header.Expected-arrival'),
        minWidth: '105px',
        maxWidth: '105px',
        textAlign: 'center',
        sortable: true
      },
      {
        value: 'sendingStation',
        text: this.translate.instant('Wagon-overview.Table-header.Forwarding-yard'),
        minWidth: '150px',
        maxWidth: '200px',
        textAlign: 'left',
        sortable: true
      },
      {
        value: 'receivingStation',
        text: this.translate.instant('Wagon-overview.Table-header.Destination-yard'),
        minWidth: '150px',
        maxWidth: '200px',
        textAlign: 'left',
        sortable: true
      },
      {
        value: 'consignorName',
        text: this.translate.instant('Wagon-overview.Table-header.Consignor'),
        minWidth: '150px',
        maxWidth: '200px',
        textAlign: 'left',
        sortable: true
      },
      {
        value: 'consigneeName',
        text: this.translate.instant('Wagon-overview.Table-header.Consignee'),
        minWidth: '150px',
        maxWidth: '200px',
        textAlign: 'left',
        sortable: true
      },
      {
        value: 'location',
        text: this.translate.instant('Wagon-overview.Table-header.Location'),
        minWidth: '250px',
        maxWidth: '250px',
        textAlign: 'center'
      },
      // {
      //   value: 'trafficlight',
      //   minWidth: widthIconHeader,
      //   maxWidth: widthIconHeader,
      //   textAlign: 'center',
      // },
      {
        value: 'orderNumber',
        text: this.translate.instant('Wagon-overview.Table-header.Zab-order-number'),
        minWidth: '160px',
        maxWidth: '160px',
        textAlign: 'center',
        sortable: true
      },
    ];
  }

  protected loadMore(): void {
    this.filter.limit += 25;
    this.filter.loadMore(this.filter.limit);
  }

  private registerForLoadMoreButtonStatusChanges(): void {
    this.filter?.showLoadMoreButton$.subscribe(showButton => {
      this.showLoadButton = showButton;
    });
  }

  get wagonSummarys(): WagonSearchSummary[] {
    return this.filter?.wagonSummarys;
  }

  protected sortTable(fieldName: string): void {
    this.filter?.sort(fieldName);
  }

  get sortConditions(): SortConditionsModel | null | undefined {
    return this.filter?.sortConditions[0];
  }

  get totalNumberOfWagons(): number {
    return this.filter?.totalNumberOfWagons;
  }

  protected openPopupTrackingHistory(wagon: WagonSearchSummary) {
    this.trackingHistoryWagonDialogService.showWagonTrackingHistoryDialog(wagon.orderId, wagon.wagonNumber, wagon.orderKey)
  }

  protected openPopupOrderDetails(wagon: WagonSearchSummary ) {
    this.orderDetailsDialogService.showOrderDetailsDialog(wagon.orderId, wagon.orderKey, wagon.wagonNumber);
  }


  protected openPopupVehicleDetails(selectedWagonNumber: string) {
    this.vehicleDetailsDialogService.showVehicleDetalsDialog(selectedWagonNumber)
  }

  protected hasWagonLimitedRunability(damageType: string): boolean {
    const limitedRunabilityTypes = new Set(['3', '5']);
    return limitedRunabilityTypes.has(damageType);
  }

  protected hasWagonNoRunability(damageType: string): boolean {
    const nonRunnableDamageTypes = new Set(['1', '2', '4', '6']);
    return nonRunnableDamageTypes.has(damageType);
  }
}
