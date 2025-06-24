import { AfterViewInit, ChangeDetectorRef, Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MonthFilterComponent, Relation } from "./month-filter/month-filter.component";
import { BasicTrainInfoData, TrainChainType } from "@src/app/trainorder/models/ApiTrainsList.models";
import { DatePipe, KeyValue } from "@angular/common";
import { TileTypeEnum } from "./tile.model";
import { Authorization } from "@src/app/trainorder/models/authorization";
import { OrderDetails, OrderItem } from "@src/app/trainorder/models/ApiOrders.model";
import { OrderDetailsModalComponent } from "../order/order-details-modal/order-details-modal.component";
import { TrainConnectionElement } from "@src/app/trainorder/models/ApiMonthViewResponse.model";
import moment from 'moment';
import { TranslateService } from "@ngx-translate/core";
import { OrderCancellationService } from "../order/order-cancellation/service/order-cancellation.service";
import { CancellationTrainSummary } from "../order/order-cancellation/order-cancellation.component";
import { Subscription } from "rxjs";
import { PermissionService } from "../../../shared/permission/PermissionService";
import { TrainorderService } from "../../services/trainorder.service";
import { PopupMenuComponent } from "@src/app/shared/components/popup-menu/popup-menu.component";
import { ModalWindows } from "@src/app/shared/components/modal-windows/modal-windows";
import { TrainDetailsService } from "@src/app/shared/components/train-details/service/train-details.service";
import { TrackingHistoryComponent } from "@src/app/shared/components/tracking-history/tracking-history.component";
import { TrainCancelablePipe } from "../../pipes/train-cancelable.pipe";

export enum Destination {
  TRAIN_DETAILS,
  TRACKING_HISTORIE,
  CANCELLATION,
  ORDER_DETAILS,
  REDUCTION
}

@Component({
  selector: 'app-month-view',
  templateUrl: './month-view.component.html',
  styleUrls: ['./month-view.component.scss'],
})
export class MonthViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('filter', { static: false }) filter!: MonthFilterComponent;
  @ViewChild(PopupMenuComponent) menu:PopupMenuComponent

  public selectedTile: TrainConnectionElement;
  private datepipe: DatePipe;
  protected authorization = Authorization;

  Arr = Array;
  TileType = TileTypeEnum;
  Destination = Destination;
  delay = 0
  closeModalSubscription: Subscription;

  constructor(
            public permissionService: PermissionService,
            private trainorderService: TrainorderService,
            private modalWindows: ModalWindows,
            private orderCancellationService: OrderCancellationService,
            private cd: ChangeDetectorRef,
            private translate: TranslateService,
            private trainDetailService: TrainDetailsService,
            private trainCancelablePipe: TrainCancelablePipe,
            @Inject(LOCALE_ID) private locale: string
          ) {
    this.datepipe = new DatePipe(this.locale);
  }

  ngOnDestroy(): void {
    this.filter.destroy();
    if(this.closeModalSubscription) this.closeModalSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.filter) {
      this.filter.init();
    }
    this.cd.detectChanges();
  }

  protected toggle(arrowIcon: HTMLElement, relation: Relation): void {
    if (arrowIcon.className === "arrow-up") {
      arrowIcon.classList.toggle("arrow");
    }
    arrowIcon.classList.toggle("arrow-up");
    relation.expanded = !relation.expanded;
  }

  protected goTo(dest: Destination): void {
    switch(dest) {
      case Destination.TRAIN_DETAILS: {
        this.openTrainInfoModal();
      } break;
      case Destination.TRACKING_HISTORIE: {
        this.openTrackingHistoryModal();
      } break;
      case Destination.CANCELLATION: {
        this.cancelTrainOrOrder();
      } break;
      case Destination.ORDER_DETAILS: {
        this.openOrderDetails();
      } break;
      // case Destination.REDUCTION: {
      //   this.openModalModifyOrder();
      // }
    }
  }

  protected isTrain(): boolean {
    return this.selectedTile?.trains && this.selectedTile.trains.length > 0;
  }

  private isTrainChain(): boolean {
    return this.selectedTile.trainChainIdentifier
                && this.selectedTile.trainChainIdentifier != null
                && this.selectedTile.trainChainIdentifier.trainChainId
                && this.selectedTile.trainChainIdentifier.trainChainId != null
                && this.selectedTile.trainChainIdentifier.trainChainType == TrainChainType.INTERMODAL;
  }

  protected isTrainChainLine(data: KeyValue<string,TrainConnectionElement[]>): boolean {
    return data.key.indexOf(",") > 0;
  }

  protected isOrder(): boolean {
    return !this.isTrain();
  }

  // private openModalModifyOrder() {
  //   const orderItem = this.createOrderItem();
  //   this.modalWindows.openModalWindow(CapacityReductionComponent, { orderItem: orderItem });
  // }

  private openOrderDetails(): void {
    const orderNumber: string = this.selectedTile?.id;
    this.trainorderService.sendOrderDetailsRequest(orderNumber).subscribe({
      next: (orderDetails: OrderDetails) => {
        this.modalWindows.openModalWindow(OrderDetailsModalComponent, { orderDetails: orderDetails, orderNumber: orderNumber });
      },
      error: (error: Error) => {
          console.error('Failed to fetch data', error);
      }
    });
  }

  private createOrderItem(): OrderItem {
    const orderItem: OrderItem = {
      customerReference: "",
      orderNumber: this.selectedTile?.id ? this.selectedTile.id : '',
      orderStatus: this.selectedTile.status,
      shipmentDate: new Date(),
      sendingStation: { name: '', objectKeyAlpha: '', objectKeySequence: 0 },
      receivingStation: { name: '', objectKeyAlpha: '', objectKeySequence: 0 },
      length: 0,
      weight: 0,
      netWeight: 0,
      numberOfWagons: 0,
      nhmCodes: [],
      authorization: [],
      carrierRoute: []
    }
    return orderItem;
  }

  private createTrainInfoData(): BasicTrainInfoData {
    const trainsItem: BasicTrainInfoData = {
      trains: this.selectedTile?.trains,
      trainChainIdentifier: this.selectedTile.trainChainIdentifier,
      authorization: this.selectedTile.authorization
    }
    return trainsItem;
  }

  private openTrackingHistoryModal(): void {
    const trainItem = this.createTrainInfoData();
    this.modalWindows.openModalWindow(TrackingHistoryComponent, {
      trackingHistoryTrainData: trainItem
    }, 1500);
  }

  private openTrainInfoModal(): void {
    const productionDate = this.selectedTile?.trains[0].productionDate;
    if(!productionDate) throw 'Error';
    this.permissionService.hasPermission(null, [Authorization.READ_TRAIN_DETAILS], this.selectedTile.authorization).subscribe(next => {
        if (next) {
          this.trainDetailService.trainDetails(this.createTrainInfoData());
        }
    });
  }

  protected setBackgroundColor(dayOfMonth: Date): string {
    const d = moment(dayOfMonth);
    if (d.weekday() == 0 || d.weekday() == 6) {
      return 'background-color: whitesmoke';
    }
    return 'background-color: white';
  }

  protected formatDayOfMonth(dayOfMonth: Date): string {
    return this.datepipe.transform(dayOfMonth, 'dd');
  }

  protected dateOfDay(day: Date): string | undefined {
    return this.datepipe.transform(day, 'EE')?.substring(0, 2);
  }

  private cancelTrainOrOrder() {
    this.filter.scrollPosition = document.body.getBoundingClientRect().y;
    if(this.closeModalSubscription) {
      this.closeModalSubscription.unsubscribe();
    }
    this.closeModalSubscription = this.orderCancellationService.reloadSubject.subscribe((b: boolean | undefined | String) => {
      if(b){
        this.filter.reloadTrainConnections(this.filter.offset + this.filter.limit);
      }
    });
    if(this.isTrainChain() || this.isTrain()) {
      const cancellationTrainSummary: CancellationTrainSummary = {
        trainChainIdentifier: this.selectedTile.trainChainIdentifier,
        trains: this.selectedTile.trains
      }
      this.orderCancellationService.cancelTrainByTrainSummary(cancellationTrainSummary);
    } else {
      const item: OrderItem = this.createOrderItem();
      this.orderCancellationService.cancelOrder(item);
    }
  }

  protected openMenu(e: MouseEvent, tile: TrainConnectionElement): void {
    this.selectedTile = tile;
    this.menu.open(e);
  }

  protected selectedItemIsCancelable(): boolean {
    if (this.isOrder() && this.selectedTile?.status == TileTypeEnum.ORDER_ACCEPTED && this.selectedTile?.dateAsDate > new Date()) {
      return true;
    }
    if(this.isTrain() && this.trainCancelablePipe.transform(this.selectedTile)) {
      return true;
    }
    return false;
  }

  protected selectedItemIsTrackable(): boolean {
    if (this.selectedTile?.isTrackable === true || (this.selectedTile?.manualEta)) {
      return true;
    }
    return false;
  }

  protected collapseAll(): void {
    if (this.relationModel) {
      for (let relation of this.relationModel) {
        if (relation) {
          if (document.getElementsByClassName("arrow-up").length > 0) {
            document.getElementsByClassName("arrow-up")[0].className = "arrow";
          }
          relation.expanded = false;
        }
      }
    }
    this.filter.isAllExpanded = false;
  }

  protected expandAll(): void {
    if (this.relationModel) {
      for (let relation of this.relationModel) {
        if (relation) {
          if (document.getElementsByClassName("arrow").length > 0) {
            document.getElementsByClassName("arrow")[0].className = "arrow-up";
          }
          relation.expanded = true;
        }
      }
    }
    this.filter.isAllExpanded = true;
  }

  protected touchesHoliday(): string[] | null {
    if (this.selectedTile && this.selectedTile && this.selectedTile.holiday && this.selectedTile.holiday.length > 0) {
      return this.selectedTile.holiday;
    }
    return null;
  }

  protected trainTouchesHoliday(tile: TrainConnectionElement): string {
    if (tile.holiday != null && tile.holiday.length > 0) {
      return 'background-color: #FFFBE6';
    }
    return '';
  }

  protected loadMore(): void {
    this.filter?.loadMore();
  }

  protected profileSelected(): boolean {
    if (this.filter?.selectedProfile) {
      if (this.filter?.selectedProfile.partnerId) {
        if (this.filter?.selectedProfile.partnerId.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  protected showId(id: string): string {
    if(!id) return "";
    return id.split(",")[0];
  }

  protected showIdentifierTitel(data: KeyValue<string,TrainConnectionElement[]>): string {
    if(!data || !data.key) return "";
    return this.isTrainChainLine(data) ? data.key : "";
  }

  protected getTileTitle(tile: TrainConnectionElement) {
    return tile.id + (tile.status != TileTypeEnum.TRAIN_SCHEDULED ? ": " + this.translate.instant(tile.status) : "");
  }

  get loadingInProgress(): boolean {
    return this.filter?.loadingInProgress;
  }

  get totalTrainAmount(): number {
    if (this.filter) {
      return this.filter?.totalTilesAmount;
    }
    return 0;
  }

  get showLoadButton(): boolean {
    return this.filter?.showLoadButton;
  }

  // get lengthOfSelectedMonth(): number {
  //   if (this.filter && this.filter.lengthOfSelectedMonth && this.filter.lengthOfSelectedMonth > 0) {
  //     return this.filter.lengthOfSelectedMonth;
  //   }
  //   return moment().daysInMonth();
  // }

  get datesInPeriod(): Date[] {
    if(this.filter?.datesInPeriod)
      return this.filter.datesInPeriod;
    return null;
  }

  get selectedDate(): Date | null {
    if (this.filter && this.filter.startDate) {
      return this.filter.startDate;
    }
    return null;
  }

  get currentAmountOfLoadedTrainItems(): number {
    return this.filter?.currentAmountOfLoadedTiles;
  }

  get relationModel(): Relation[] | null{
    if (this.filter) {
      return this.filter.relations;
    }
    return null;
  }
}
