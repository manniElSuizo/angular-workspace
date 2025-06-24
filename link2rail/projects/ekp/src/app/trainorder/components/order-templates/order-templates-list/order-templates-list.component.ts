import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { OrderDetails, OrderItem } from '@src/app/trainorder/models/ApiOrders.model';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { ApiGoodResponse } from '@src/app/trainorder/models/Cargo.model';
import { OrderStatusHelper } from '@src/app/shared/enums/order-status';
import { NewOrderComponent } from '../../new-order/new-order.component';
import { MatDialog } from '@angular/material/dialog';
import { OrderTemplatesFilterComponent } from '../order-templates-filter/order-templates-filter.component';
import { NhmCodeDetailsComponent } from '../../order/nhm-code-details/nhm-code-details.component';
import { OrderDetailsModalComponent } from '../../order/order-details-modal/order-details-modal.component';
import { OrderTemplateSummary } from '@src/app/trainorder/models/OrderTemplateModels';
import { OrderTemplateDetailsComponent } from '../order-template-details/order-template-details.component';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';


@Component({
  selector: 'app-order-templates-list',
  templateUrl: './order-templates-list.component.html',
  styleUrls: ['./order-templates-list.component.scss']

})
export class OrderTemplatesListComponent implements OnDestroy, AfterViewInit, AfterViewChecked {

  @ViewChild('filter', { static: false }) filter!: OrderTemplatesFilterComponent;

  protected tableHeaders: any[] = [];
  protected loadingInProgress: boolean
  protected showLoadButton: boolean;
  protected authorization = Authorization;

  private subscription: Subscription = new Subscription();

  @ViewChildren('trainRow') trainRows: QueryList<any>;

  constructor(private storageService: LocalStorageService, private cd: ChangeDetectorRef, private translate: TranslateService, private trainorderService: TrainorderService, private modalWindows: ModalWindows, public permissionService: PermissionService, private dialog: MatDialog,) {
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

  protected openNewOrderTemplateModal(): void {
    this.modalWindows.openModalWindowNewOrderTemplate().afterClosed().subscribe(() => {
        this.filter.resetList();
        this.filter.updateOrdersList();
      }
    );
  }

  protected openDetails(templateId: string) {
    this.modalWindows.openModalWindow(OrderTemplateDetailsComponent, {templateId: templateId});
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
        {text: this.translate.instant('Order-templates-component.Template-nr'), value: 'number', sortField: false},
        {text: this.translate.instant('Order-templates-component.Template-name'), value: 'templateName', sortField: true},
        {text: this.translate.instant('Order-templates-component.Sender'), value: 'sender', sortField: true},
        {
            text: this.translate.instant('Order-component.Table-header.Shipping-station'),
            value: 'sendingStation',
            sortField: true
        },
        {text: this.translate.instant('Order-details.Receiver'), value: 'receiver', sortField: true},
        {
            text: this.translate.instant('Order-component.Table-header.Receiving-station'),
            value: 'receivingStation',
            sortField: true
        },
        {text: this.translate.instant('Order-templates-component.Valid-from'), value: 'validFrom', sortField: true},
        {text: this.translate.instant('Order-templates-component.Valid-to'), value: 'validTo', sortField: true},
        {text: ''}
    ];
  }

  protected hasActiveProfile() {
    const ap = this.storageService.getActiveProfiles();
    if(ap != null && ap.length > 0) {
      return ap[0].partnerId && ap[0].partnerId != null && ap[0].partnerId != '';
    }
    return false;
  }

  protected openNewOrderModal(templateId: string) {
    this.modalWindows.openModalWindow(NewOrderComponent, {templateId: templateId});
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

  protected editTemplate(templateId: string) {
    this.modalWindows.openModalWindowNewOrderTemplate({templateId: templateId}).afterClosed().subscribe(() => {
      this.filter.resetList();
      this.filter.updateOrdersList();
    });
  }

  protected deleteTemplate(templateId: string) {
    const ref = this.modalWindows.openConfirmationDialogTemplateDeletion(templateId);
    ref.afterClosed().subscribe((result) => {
        if (result) {
            this.trainorderService.deleteOrderTemplate(templateId).subscribe(() => {
                this.modalWindows.openConfirmationDialog('Order-templates-component.Delete-order-template.Confirmation-text', 3);
            }).add(() => this.filter.updateOrdersList());
        }
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
        next: (orderDetails: OrderDetails) => {
          this.modalWindows.openModalWindow(OrderDetailsModalComponent, { orderDetails: orderDetails, orderNumber: orderItem.orderNumber });
        },
        error: (error: Error) => {
            console.error('Failed to fetch data', error);
        }
    });
  }

  protected get maxDate(): string {
    return this.filter?.maxDate;
  }

  protected get orderTemplatesList(): OrderTemplateSummary[] {
    return this.filter?.orderTemplatesList
  }

  protected get totalOrderTemplates(): number {
    return this.filter?.totalOrderTemplates;
  }

  protected get lengthOfOrderTemplatesList(): number {
    if (this.orderTemplatesList?.length > 0) {
      return this.orderTemplatesList.length;
    }
    return 0;
  }

  protected get sortConditions(): SortConditionsModel {
    let sortConditions;
    if (this.filter?.sortConditions) {
      sortConditions = this.filter?.sortConditions;
    } else {
      sortConditions = {
        asc: true,
        field: 'number'
      }
    }
    return sortConditions;
  }
}
