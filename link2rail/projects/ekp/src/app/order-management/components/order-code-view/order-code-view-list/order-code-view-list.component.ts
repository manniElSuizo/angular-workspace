import { AfterViewInit, ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { OrderCodeViewFilterComponent } from './order-code-view-filter/order-code-view-filter.component';
import { TableHeader } from '@src/app/shared/models/table';
import { TranslateService } from '@ngx-translate/core';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { RailOrderCodeSearchSummary } from '../models/ApiRailOrderCode.model';
import { PopupMenuComponent } from '@src/app/shared/components/popup-menu/popup-menu.component';
import { RailOrderDialogService } from '../../new-order/service/railorder-order-dialog.service';
import { NhmCodeDetailsComponent } from './nhm-code-details/nhm-code-details.component';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { RailOrderBillOfLadingService } from '../../order-view/order-view-list/services/rail-order-bill-of-loading.service';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';
export enum Destination {
  NEW_ORDER,
  EDIT,
  ORDER_DETAILS,
  CONSIGMENT_NOTE
}
@Component({
  selector: 'app-order-code-view-list',
  templateUrl: './order-code-view-list.component.html',
  styleUrl: './order-code-view-list.component.scss'
})
export class OrderCodeViewListComponent implements AfterViewInit {

  @ViewChild(OrderCodeViewFilterComponent, { static: false }) filter!: OrderCodeViewFilterComponent;
  @ViewChild(PopupMenuComponent) menu: PopupMenuComponent
  private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);

  protected hasReadPermission$: any;
  protected hasWritePermission$: any;
  protected tableHeaders: TableHeader[] = [];
  protected loadingInProgress: boolean;
  protected Destination = Destination;

  protected permissionService: PermissionService = inject(PermissionService);
  protected authorization = Authorization;
  private billOfLadingUrl: string | null = null;
  private railOrderDialogService: RailOrderDialogService = inject(RailOrderDialogService);
  protected selectedRailOrderCode: RailOrderCodeSearchSummary;

  constructor(private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private railOrderBillOfLadingService: RailOrderBillOfLadingService,
    private dialog: MatDialog,
    private railorderDialogService: RailOrderDialogService) {
    this.createTableHeaders();
  }
  ngOnInit(): void {
    this.hasReadPermission$ = this.permissionService.hasPermission(null, [this.authorization.READ_OM]);
    this.hasWritePermission$ = this.permissionService.hasPermission(null, [this.authorization.WRITE_OM]);
  }
  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  protected sortTable(fieldName: string) {
    this.filter.sort(fieldName);
  }

  protected loadMore(): void {
    this.filter.offset += 25;
    this.filter.limit += 25;
    this.filter.loadMore(this.filter.limit);
  }

  protected hasWritePermission(): boolean {
    if (this.selectedRailOrderCode) {
      return this.selectedRailOrderCode?.authorization.includes(Authorization.WRITE_OM);
    }
    return false
  }

  protected hasReadPermission(): boolean {
    if (this.selectedRailOrderCode) {
      return this.selectedRailOrderCode?.authorization.includes(Authorization.READ_OM);
    }
    return false
  }

  protected openNhmDetails(railOrderCodeSummary: RailOrderCodeSearchSummary): void {
    let config: MatDialogConfig = { maxWidth: '90vw', maxHeight: '90vh', width: '100%', height: '100%' };
    config.data = railOrderCodeSummary;
    this.openDialog(NhmCodeDetailsComponent, { data: config });
  }

  private openDialog<T>(comp: new (...args: any[]) => T, config: any): void {
    let dialogRef: MatDialogRef<T>;
    dialogRef = this.dialog.open(comp, config);
    dialogRef.afterClosed().subscribe(decision => {
      console.log(decision);
    });
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      {
        fieldName: 'templateNumber',
        headerText: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Order-code-name'),
        minWidth: '180px',
        maxWidth: '240px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'consignorName',
        headerText: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Consignor-name'),
        minWidth: '224px',
        maxWidth: '250px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'sendingStation',
        headerText: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Sending-station'),
        headerTextrow2: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Point-of-loading-name'),
        minWidth: '200px',
        maxWidth: '200px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'consigneeName',
        headerText: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Consignee-name'),
        minWidth: '224px',
        maxWidth: '250px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'receivingStation',
        headerText: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Receiving-station'),
        headerTextrow2: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Point-of-unloading-name'),
        minWidth: '200px',
        maxWidth: '200px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'nhmCodes',
        headerText: this.translate.instant('Order-Management.Order-code-view-list.Table-header.NHM-code-description'),
        minWidth: '250px',
        maxWidth: '250px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'unCodes',
        headerText: this.translate.instant('Order-Management.Order-code-view-list.Table-header.UN-number-description'),
        minWidth: '250px',
        maxWidth: '250px',
        textAlign: 'left',
        sortable: true
      },
      {
        fieldName: 'consignmentNoteView',
        headerText: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Consignment-note-view'),
        minWidth: '162px',
        maxWidth: '162px',
        textAlign: 'left',
        sortable: false
      },
      {
        fieldName: 'menue',
        headerText: '',
        minWidth: '50px',
        maxWidth: '50px',
        textAlign: 'left',
        sortable: false
      }
    ];
  }

  protected openMenu($event: MouseEvent, railOrderCode: RailOrderCodeSearchSummary): void {
    this.selectedRailOrderCode = railOrderCode;
    this.menu.open($event);
  }

  protected goTo(dest: Destination, railOrderCode?: RailOrderCodeSearchSummary): void {
    switch (dest) {
      case Destination.NEW_ORDER: {
        this.onNewOrder();
      } break;
      case Destination.ORDER_DETAILS: {
        this.onOrderDetails();
      } break;
      case Destination.CONSIGMENT_NOTE: {
        this.onConsignmentNote(railOrderCode)
      } break;
    }
  }

  protected renameOrderTemplate(): void {
    this.filter.scrollPosition = document.body.getBoundingClientRect().y;
    const dialogRef = this.railOrderDialogService.openRenameOrderTemplateDialog(this.selectedRailOrderCode);
    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result == 'refresh') {
          this.filter.reloadList();
        }
      }
    })
  }

  protected onNewOrder(): void {
    this.railOrderDialogService.openDialogWithOrderTemplate(this.selectedRailOrderCode.templateNumber);
  }

  protected onNewOrderFast(): void {
    this.railOrderDialogService.openDialogWithOrderTemplate(this.selectedRailOrderCode.templateNumber, true);
  }

  protected onOrderDetails(): void {
    this.railorderDialogService.openDialogWithOrderTemplate(this.selectedRailOrderCode.templateNumber, false, false)
  }

  protected onConsignmentNote(railOrder: RailOrderCodeSearchSummary): void {

    this.railOrderBillOfLadingService.getOrderCodeBillOfLading(railOrder.templateNumber).subscribe({
      next: (pdfBlob) => {
        // Create and store the new Blob URL
        this.billOfLadingUrl = URL.createObjectURL(pdfBlob);
        // Open in a new tab
        const newTab = window.open(); // Open blank tab first (bypasses popup blockers)
        if (newTab) {
          newTab.location.href = this.billOfLadingUrl;
        } else {
          this.apiErrorDialogService.openApiErrorDialog(new Error("Popup blocked! Unable to open new tab."));
        }
      },
      error: (err) => {
        this.apiErrorDialogService.openApiErrorDialog(err);
      }
    });
  }

  get sortConditions(): SortConditionsModel | null | undefined {
    return this.filter?.sortConditions[0];
  }

  get railOrderCodes(): RailOrderCodeSearchSummary[] {
    return this.filter?.railOrderCodes;
  }
}
