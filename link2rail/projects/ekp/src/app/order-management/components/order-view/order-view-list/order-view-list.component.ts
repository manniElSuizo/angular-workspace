import { AfterViewInit, ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { TableHeader } from '@src/app/shared/models/table';
import { OrderViewFilterComponent } from './order-view-filter/order-view-filter.component';
import { RailOrderSearchSummary } from '@src/app/trainorder/models/ApiRailOrder.model';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WagonNumberModalComponent } from '../wagon-number-modal/wagon-number-modal.component';
import { PopupMenuComponent } from '@src/app/shared/components/popup-menu/popup-menu.component';
import { RailOrderDialogService } from '../../new-order/service/railorder-order-dialog.service';
import { Action, RailOrderStatus } from '@src/app/order-management/models/general-order';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { TimeUtilities } from '@src/app/shared/utils/time.utils';
import { LastStatusModalComponent } from './last-status-modal/last-status-modal.component';
import { RailOrderBillOfLadingService } from './services/rail-order-bill-of-loading.service';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';

export enum Destination {
  EDIT,
  CANCEL,
  //SUBSEQUENT_DISPOSITION,
  CONSIGMENT_NOTE,
  ORDER_DETAILS
}
@Component({
  selector: 'app-order-view-list',
  templateUrl: './order-view-list.component.html',
  styleUrl: './order-view-list.component.scss'
})
export class OrderViewListComponent implements AfterViewInit {

  @ViewChild(OrderViewFilterComponent, { static: false }) filter!: OrderViewFilterComponent;
  @ViewChild(PopupMenuComponent) menu: PopupMenuComponent
  private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);

  protected tableHeaders: TableHeader[] = [];
  protected loadingInProgress: boolean;
  protected Destination = Destination;

  private railorderDialogService: RailOrderDialogService = inject(RailOrderDialogService);
  protected permissionService: PermissionService = inject(PermissionService);
  protected authorization = Authorization;

  protected selectedRailOrder: RailOrderSearchSummary;
  private billOfLadingUrl: string | null = null; // Store the generated Blob URL
  constructor(private translate: TranslateService, private dialog: MatDialog, private cd: ChangeDetectorRef, private railOrderBillOfLadingService: RailOrderBillOfLadingService) {
    this.createTableHeaders();
  }

  ngAfterViewInit(): void {
    this.registerForLoadingStatusChanges();
    this.cd.detectChanges();
  }

  private registerForLoadingStatusChanges(): void {
    this.filter?.loadingInProgress$.subscribe(loading => {
      this.loadingInProgress = loading;
    });
  }

  protected sortTable(fieldName: string) {
    this.filter.sort(fieldName);
  }

  protected translatedRailOrderStatus(status: RailOrderStatus): string {
    switch (status) {
      case 'CAPTURED': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-status.CAPTURED');
      }
      case 'ACCEPTED': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-status.ACCEPTED');
      }
      case 'SUBMITTED': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-status.SUBMITTED');
      }
      case 'ACTIVE': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-status.ACTIVE');
      }
      case 'CLOSED': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-status.CLOSED');
      }
      case 'CANCELLED': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-status.CANCELLED');
      }
    }
    return '';
  }

  protected loadMore() {
    this.filter.offset += 25;
    this.filter.loadMore(this.filter.limit);
  }

  protected formatWagonNumber(value: string | null): string {
    let output = (!value) ? null : (value + '').replace(/[^0-9]/g, '').slice(0, 12);
    if (output) {
      return output.replace(/^(\d{4})(\d{4})(\d{3})(\d{1})$/g, '$1 $2 $3-$4');
    }
    return "";
  }

  protected getWagonAmount(railOrder: RailOrderSearchSummary): number {
    return railOrder.wagonCount ? railOrder.wagonCount : 0;
  }

  protected showWarning(railOrder: RailOrderSearchSummary): boolean {
    if (railOrder.zabStatus === RailOrderStatus.ACCEPTED) {
      return TimeUtilities.currentDateIsAfterDateAndDiffIsGreaterThan(1440, new Date(railOrder.shippingTime));
    }
    return false;
  }

  protected showWarningOrange(railOrder: RailOrderSearchSummary): boolean {
    if (!this.showWarning(railOrder)) {
      return false;
    }
    return !TimeUtilities.currentDateIsAfterDateAndDiffIsGreaterThan(60, new Date(railOrder.shippingTime));
  }

  protected showWarningRed(railOrder: RailOrderSearchSummary): boolean {
    if (!this.showWarning(railOrder)) {
      return false;
    }
    return TimeUtilities.currentDateIsAfterDateAndDiffIsGreaterThan(60, new Date(railOrder.shippingTime));
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      {
        fieldName: 'orderID',
        headerText: this.translate.instant('Order-Management.order-view-list.Zab-order-number'),
        headerTextrow2: this.translate.instant('Order-Management.order-view-list.template-name'),
        minWidth: '190px',
        maxWidth: '190px',
        textAlign: 'left',
        sortable: false
      },
      {
        fieldName: 'shippingTime',
        headerText: this.translate.instant('Order-Management.order-view-list.shippingTime'),
        minWidth: '60px',
        maxWidth: '60px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'icon',
        headerText: '',
        minWidth: '50px',
        maxWidth: '50px',
        textAlign: 'left',
        sortable: false
      },
      {
        fieldName: 'railOrderStatus',
        headerText: this.translate.instant('Order-Management.order-view-list.railOrderStatus'),
        minWidth: '150px',
        maxWidth: '150px',
        textAlign: 'left',
        sortable: false
      },
      {
        fieldName: 'status',
        headerText: this.translate.instant('Order-Management.order-view-list.status'),
        minWidth: '84px',
        maxWidth: '84px',
        textAlign: 'left',
        sortable: false
      },
      {
        fieldName: 'sendingStation',
        headerText: this.translate.instant('Order-Management.order-view-list.sendingStation'),
        minWidth: '84px',
        maxWidth: '84px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'receivingStation',
        headerText: this.translate.instant('Order-Management.order-view-list.receivingStation'),
        minWidth: '84px',
        maxWidth: '84px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'consignorName',
        headerText: this.translate.instant('Order-Management.order-view-list.consignorName'),
        minWidth: '84px',
        maxWidth: '84px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'consigneeName',
        headerText: this.translate.instant('Order-Management.order-view-list.consigneeName'),
        minWidth: '84px',
        maxWidth: '84px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'waggonamount',
        headerText: this.translate.instant('Order-Management.order-view-list.waggonamount'),
        minWidth: '84px',
        maxWidth: '84px',
        textAlign: 'left',
        sortable: false
      },
      {
        fieldName: 'order',
        headerText: this.translate.instant('Order-Management.order-view-list.order'),
        minWidth: '84px',
        maxWidth: '84px',
        textAlign: 'left',
        sortable: false
      },
      {
        fieldName: 'consignmentNote',
        headerText: this.translate.instant('Order-Management.order-view-list.consignmentNote'),
        minWidth: '84px',
        maxWidth: '84px',
        textAlign: 'left',
        sortable: false
      },
      {
        fieldName: 'menu',
        headerText: '',
        minWidth: '10px',
        maxWidth: '10px',
        textAlign: 'center',
        sortable: false
      }
    ];
  }

  protected doCompletion(): boolean {
    return this.selectedRailOrder?.allowedActions?.some(a => a == Action.BOOK || a == Action.EDIT || a == Action.ORDER) && this.selectedRailOrder.authorization.includes(Authorization.WRITE_OM);
  }

  protected doCancellation(): boolean {
    return this.selectedRailOrder?.allowedActions?.some(a => a == Action.CANCEL) && this.selectedRailOrder.authorization.includes(Authorization.WRITE_OM);
  }

  protected openMenu(e: MouseEvent, railOrder: RailOrderSearchSummary): void {
    this.selectedRailOrder = railOrder;
    this.menu.open(e);
  }

  protected goTo(dest: Destination, railOrder?: RailOrderSearchSummary): void {
    switch (dest) {
      case Destination.EDIT: {
        this.onEdit(this.selectedRailOrder);
      } break;
      case Destination.CANCEL: {
        this.onCancel(this.selectedRailOrder);
      } break;
      //case Destination.SUBSEQUENT_DISPOSITION: {
      //  this.onSubsequentDisposition(this.selectedRailOrder);
      //} break;
      case Destination.CONSIGMENT_NOTE: {
        this.onConsignmentNote(railOrder);
      } break;
      case Destination.ORDER_DETAILS: {
        this.onOrderDetails(railOrder);
      } break;
    }
  }

  protected onOrderDetails(railOrder: RailOrderSearchSummary): void {
    //console.log(railOrder);
    this.railorderDialogService.showNewOrderDialog(railOrder.orderId, false);
  }

  protected onConsignmentNote(railOrder: RailOrderSearchSummary): void {

    this.railOrderBillOfLadingService.getRailOrderBillOfLading(railOrder.orderId).subscribe({
      next: (pdfBlob) => {
        // Create and store the new Blob URL
          this.billOfLadingUrl = URL.createObjectURL(pdfBlob);
          // Open in a new tab
          const newTab = window.open(); // Open blank tab first (bypasses popup blockers)
          if (newTab) {
            newTab.location.href = this.billOfLadingUrl;
          } else {
            this.apiErrorDialogService.openApiErrorDialog(new Error("Popup blocked! Unable to open new tab."));
            console.error("Popup blocked! Unable to open new tab.");
          }
      },
      error: (err) => {
        this.apiErrorDialogService.openApiErrorDialog(err);
        console.log("Error in consignment note download:", err);
      }
    });
  }

  protected onEdit(railOrder: RailOrderSearchSummary): void {
    console.log("onEdit before if(this.doCompletion())");
    if (this.doCompletion()) {
      console.log("onEdit after if(this.doCompletion())");
      this.filter.scrollPosition = document.body.getBoundingClientRect().y;
      this.railorderDialogService.showNewOrderDialog(railOrder.orderId).subscribe({
        next: r => {
          if (r) {
            this.filter.reloadList();
          }
        }
      });
    }

  }

  protected onCancel(railOrder: RailOrderSearchSummary): void {
    if (this.doCancellation()) {
      this.filter.scrollPosition = document.body.getBoundingClientRect().y;
      this.railorderDialogService.openCancellationConfirmation(railOrder).subscribe({
        next: b => {
          if (b) {
            this.filter.reloadList();
          }
        }
      });
    }
  }

  protected onSubsequentDisposition(railOrder: RailOrderSearchSummary): void {
    // console.error('onSubsequentDisposition: Not yet implemented');
    //console.log(railOrder);
  }

  protected onOpenWagonNumberModal(railOrder: RailOrderSearchSummary): void {
    this.openWagonNumberModal(railOrder);
  }

  protected onOpenLastStatusModal(railOrder: RailOrderSearchSummary): void {
    this.openLastStatusModal(railOrder);
  }


  protected openNewOrderModal(): void {
    this.filter.scrollPosition = document.body.getBoundingClientRect().y;
    this.railorderDialogService.showNewOrderDialog(null, true, true).subscribe({
      next: r => {
        if (r) {
          this.filter.reloadList();
        }
      }
    });
  }

  private openWagonNumberModal(data: RailOrderSearchSummary): MatDialogRef<WagonNumberModalComponent> {
    const width = 500;
    let config = {};
    config = { data: data, width: width + 'px' };
    const ref = this.dialog.open(WagonNumberModalComponent, config);
    return ref;
  }

  private openLastStatusModal(data: RailOrderSearchSummary): MatDialogRef<LastStatusModalComponent> {
    const width = 600;
    let config = {};
    config = { data: data, width: width + 'px' };
    return this.dialog.open(LastStatusModalComponent, config);
  }


  get sortConditions(): SortConditionsModel | null | undefined {
    return this.filter?.sortConditions[0];
  }

  get railOrders(): RailOrderSearchSummary[] {
    return this.filter?.railOrders;
  }
}
