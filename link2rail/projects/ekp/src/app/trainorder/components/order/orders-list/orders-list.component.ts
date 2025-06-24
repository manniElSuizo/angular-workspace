import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { OrderItem } from '@src/app/trainorder/models/ApiOrders.model';
import { BasicTrainInfoData } from '@src/app/trainorder/models/ApiTrainsList.models';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { ApiGoodResponse } from '@src/app/trainorder/models/Cargo.model';
import { OrderStatusHelper } from '@src/app/shared/enums/order-status';
import { NhmCodeDetailsComponent } from '../nhm-code-details/nhm-code-details.component';
import { OrderDetailsModalComponent } from '../order-details-modal/order-details-modal.component';
import { NewOrderComponent } from '../../new-order/new-order.component';
import { OrderFilterComponent } from '../order-filter/order-filter.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OrderCancellationService } from '../order-cancellation/service/order-cancellation.service';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { TrainDetailsService } from '@src/app/shared/components/train-details/service/train-details.service';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})

export class OrdersListComponent implements OnDestroy, AfterViewInit, AfterViewChecked {

  @ViewChild('filter', { static: false }) filter!: OrderFilterComponent;

  protected tableHeaders: any[] = [];
  protected loadingInProgress: boolean
  protected showLoadButton: boolean;
  protected authorization = Authorization;

  private newOrderDialogRef: MatDialogRef<NewOrderComponent> = null;
  private subscription: Subscription = new Subscription();

  @ViewChildren('trainRow') trainRows: QueryList<any>;

  constructor(private storageService: LocalStorageService, private cd: ChangeDetectorRef, private translate: TranslateService, private trainorderService: TrainorderService, private modalWindows: ModalWindows, public permissionService: PermissionService, private dialog: MatDialog, private orderCancellationService: OrderCancellationService, private trainDetailsService: TrainDetailsService) {
    this.loadingInProgress = true;
    this.createTableHeaders();
  }

  ngAfterViewInit(): void {
    this.registerForLoadMoreButtonStatusChanges();
    this.registerForLoadingStatusChanges();
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private registerForLoadingStatusChanges(): void {
    this.filter?.loadingInProgress$.subscribe(loading => {
      this.loadingInProgress = loading;
    });
  }

  private registerForLoadMoreButtonStatusChanges(): void {
    this.filter?.showLoadMoreButton$.subscribe(showButton => {
      this.showLoadButton = showButton;
    });
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      { text: '', value: '' },
      { text: this.translate.instant('Order-component.Table-header.Customer-reference'), value: 'customerReference', sortField: true },
      { text: this.translate.instant('Order-component.Table-header.Order-number'), value: 'orderNumber', sortField: true },
      { text: this.translate.instant('Order-component.Table-header.Order-status'), value: 'orderStatus', sortField: true },
      { text: this.translate.instant('Order-component.Table-header.Shipping-date'), value: 'shipmentDate', sortField: true },
      { text: this.translate.instant('Order-component.Table-header.Train-Number'), value: 'trainNumber', sortField: true },
      { text: this.translate.instant('Order-component.Table-header.Shipping-station'), value: 'sendingStation', sortField: true },
      { text: this.translate.instant('Order-component.Table-header.Receiving-station'), value: 'receivingStation', sortField: true },
      { text: this.translate.instant('Order-component.Table-header.NHM-Code'), value: '' },
      { text: this.translate.instant('Order-component.Table-header.Length-in-m'), value: 'length', sortField: false },
      { text: this.translate.instant('Order-component.Table-header.Amount-in-tons'), value: 'weight', sortField: false },
      { text: '', value: '' },
      { text: '', value: '' },
    ];
  }

  protected hasActiveProfile() {
    const ap = this.storageService.getActiveProfiles();
    if(ap != null && ap.length > 0) {
      return ap[0].partnerId && ap[0].partnerId != null && ap[0].partnerId != '';
    }
    return false;
  }

  protected openNewOrderModal() {
    this.newOrderDialogRef = this.modalWindows.openModalWindow(NewOrderComponent);
    this.newOrderDialogRef.afterClosed().subscribe({
      next: omitListReload => {
        console.log(omitListReload);
        if(!omitListReload) {
          this.filter.updateOrdersList();
        }
      }
    });
  }

  protected openFileUploadModal(): void {
    this.modalWindows.openModalWindowFileUpload();
  }

  protected sortTable(value: string): void {
    this.filter?.updateSortConditions(value);
  }

  protected createTrainNumber(order: OrderItem): string {
    if (!order || !order.carrierRoute || order.carrierRoute.length === 0 || !order.carrierRoute[0] || !order.carrierRoute[0].trainNumber) {
      return '-';
    }
    if (order.carrierRoute.length === 1) {
      return order.carrierRoute[0].trainNumber;
    }

    const arr: string[] = [];
    for (let carrierRoute of order.carrierRoute) {
      if (carrierRoute.trainNumber) {
        const tm = arr.find(x => { return x === carrierRoute.trainNumber });
        if (!tm) {
          arr.push(carrierRoute.trainNumber);
        }
      }
    }
    switch(arr.length) {
      case 0: return '-'; break;
      case 1: return arr[0]; break;
      default: return '[...]';
    }
  }

  protected openNhmDetailsModal(nhmCodes: string[], orderNumber: string): void {
    const strArr: string[] = [];
    nhmCodes.forEach(el => {
      strArr.push(el.padEnd(8,'0'));
    });
    this.trainorderService.getNHMCodeDetails(strArr).subscribe((result: ApiGoodResponse) => {
      this.modalWindows.openModalWindow(NhmCodeDetailsComponent, { nhmCodes: result, orderNumber: orderNumber });
    });
  }

  // protected openModalModifyOrder(orderItem: OrderItem): void {
  //   this.modalWindows.openModalWindow(CapacityReductionComponent, { orderItem: orderItem });
  // }

  protected openModalCancelOrder(order: OrderItem): void {
    this.orderCancellationService.cancelOrder(order).afterClosed().subscribe((result) => {
      this.filter.resetList(this.filter.offset + this.filter.limit);
      this.filter.updateOrdersList();
    });
  }

  protected loadMore(): void {
    this.filter.offset += 25;
    this.filter?.updateOrdersList();
  }

  protected showTrains(arrowIcon: HTMLElement, trainRowIndex: number): void {
    arrowIcon.classList.toggle('arrow-up');
    const row = this.trainRows.filter(item => item.nativeElement.attributes['data-train-row'].value == trainRowIndex)[0];
    row.nativeElement.classList.toggle('train-row-show');
  }

  protected isCancellationAllowed(order: OrderItem): boolean {
    if((new Date(order.shipmentDate).getTime() >= new Date().getTime() && OrderStatusHelper.getOrderAcceptedStatusArray().includes(order.orderStatus)) &&
        (this.permissionService.hasDynamicPermission(order.authorization, [this.authorization.CANCEL_SPECIAL_TRAIN]) ||
            this.permissionService.hasDynamicPermission(order.authorization, [this.authorization.REDUCTION]))) {
      return true;
    }
    return false;
  }

  protected openOrderDetails(orderItem: OrderItem) {
    this.trainorderService.sendOrderDetailsRequest(orderItem.orderNumber).subscribe({
        next: (orderDetails) => {
          console.log(orderDetails);
          this.modalWindows.openModalWindow(OrderDetailsModalComponent, { orderDetails: orderDetails, orderNumber: orderItem.orderNumber });
        },
        error: (error: Error) => {
            console.error('Failed to fetch data', error);
        }
    });
  }

  protected openTrainInfoModal(trainNumber: string, productionDate: Date): void {
    const trains = [{trainNumber: trainNumber , productionDate : productionDate, startDate: undefined, trainId: ''}];
    const basicTrainInfo :BasicTrainInfoData = { trains: trains };
    this.trainDetailsService.trainDetails(basicTrainInfo);
  }

  get maxDate(): string {
    return this.filter?.maxDate;
  }

  get ordersList(): OrderItem[] {
    return this.filter?.ordersList;
  }

  get totalOrders(): number {
    return this.filter?.totalOrders;
  }

  get lengthOfOrdersList(): number {
    if (this.ordersList?.length > 0) {
      return this.ordersList.length;
    }
    return 0;
  }

  get sortConditions(): SortConditionsModel {
    let sortConditions;
    if (this.filter?.sortConditions) {
      sortConditions = this.filter?.sortConditions;
    } else {
      sortConditions = {
        asc: true,
        field: 'shipmentDate'
      }
    }
    return sortConditions;
  }
}
