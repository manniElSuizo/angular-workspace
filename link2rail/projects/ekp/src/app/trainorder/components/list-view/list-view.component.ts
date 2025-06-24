import { AfterViewChecked, ChangeDetectorRef, Component, AfterViewInit, ViewChild, OnDestroy } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TrainChainType, TrainIdentifier, TrainSummary } from "@src/app/trainorder/models/ApiTrainsList.models";
import { ListViewFilterComponent } from "./list-view-filter/list-view-filter.component";
import { Authorization } from "@src/app/trainorder/models/authorization";
import { OrderCancellationService } from "../order/order-cancellation/service/order-cancellation.service";
import { Observable, of, Subscription } from "rxjs";
import { OrderStatusTypes } from "@src/app/shared/enums/order-status";
import { PermissionService } from "../../../shared/permission/PermissionService";
import { ModalWindows } from "@src/app/shared/components/modal-windows/modal-windows";
import { TrainDetailsService } from "@src/app/shared/components/train-details/service/train-details.service";
import { TrackingHistoryComponent } from "@src/app/shared/components/tracking-history/tracking-history.component";
import { RailorderSummaryService } from "../railorder-summary/service/railorder-summary.service";
import { SortConditionsModel } from "@src/app/shared/models/sort.models";
import { ProductType } from "@src/app/shared/enums/train-types.enum";

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('filter', { static: false }) filter!: ListViewFilterComponent;

  protected tableHeaders: any[] = [];
  protected authorization = Authorization;
  protected showLoadButton: boolean;
  protected loadingInProgress: boolean;
  protected trainChainTypes = TrainChainType;

  private closeModalSubscription: Subscription;

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private modalWindows: ModalWindows,
    private orderCancellationService: OrderCancellationService,
    public permissionService: PermissionService,
    private trainDetailsService: TrainDetailsService,
    private railOrderSummaryService: RailorderSummaryService) {

    this.loadingInProgress = true;
    this.createTableHeaders();
  }

  ngAfterViewInit(): void {
    this.registerForLoadMoreButtonStatusChanges();
    this.registerForLoadingStatusChanges();
    this.translateTableHeaders();
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.closeModalSubscription) this.closeModalSubscription.unsubscribe();
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

  private translateTableHeaders() {
    this.translate.get('Order-view-page.Roundtrip-name-label').subscribe(s => this.tableHeaders[3].text = s);
    this.translate.get('Order-view-page.Train-number-short-label').subscribe(s => this.tableHeaders[4].text = s);

    this.translate.onLangChange.subscribe(r => {
      this.tableHeaders[3].text = this.translate.get('Order-view-page.Roundtrip-name-label');
      this.tableHeaders[4].text = this.translate.instant('Order-view-page.Train-number-short-label');
      this.tableHeaders[5].text = this.translate.instant('Order-view-page.Current-train-number-short-label');
      this.tableHeaders[6].text = this.translate.instant('Order-view-page.Sending-date-label');
      this.tableHeaders[7].text = this.translate.instant('Order-view-page.ETA-label');
      this.tableHeaders[8].text = this.translate.instant('Order-view-page.Shipping-station-label');
      this.tableHeaders[9].text = this.translate.instant('Order-view-page.Receiving-station-label');
      this.tableHeaders[10].text = this.translate.instant('Order-view-page.Tracking-history-header');
      this.tableHeaders[11].text = this.translate.instant('Auftragsdetails');
    });
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      {
        text: '',
        value: '',
        type: 'icon',
        width: '30px'
      },
      {
        text: '',
        value: '',
        type: 'icon',
        width: '30px'
      },
      {
        text: '',
        value: '',
        type: 'icon',
        width: '30px'
      },
      {
        value: 'roundtrip',
        text: this.translate.instant('Order-view-page.Roundtrip-name-label'),
        sortField: true
      },
      {
        text: this.translate.instant('Order-view-page.Train-number-short-label'),
        value: 'trainNumber',
        width: '80px',
        sortField: true

      },
      {
        text: this.translate.instant('Order-view-page.Current-train-number-short-label'),
        value: 'currentTrainNumber',
        width: '100px'
      },
      {
        text: this.translate.instant('Order-view-page.Sending-date-label'),
        value: 'plannedDeparture',
        width: '200px',
        sortField: true
      },
      {
        text: this.translate.instant('Order-view-page.ETA-label'), value: 'eta',
        width: '200px',
        sortField: true

      },
      {
        text: this.translate.instant('Order-view-page.Shipping-station-label'),
        value: 'sendingStation',
        width: '300px',
        sortField: true
      },
      {
        text: this.translate.instant('Order-view-page.Receiving-station-label'),
        value: 'receivingStation',
        width: '300px',
        sortField: true
      },
      {
        text: this.translate.instant('Order-view-page.Tracking-history-header'),
        value: '',
        width: '300px'
      },
      {
        text: this.translate.instant('Order-view-page.Wagon-list-header'),
        value: '',
        width: '50px'
      },
      {
        text: '',
        value: '',
        type: 'icon',
        width: '50px'
      },
      {
        text: '',
        value: '',
        type: 'icon',
        width: '50px'
      },
    ];
  }

  protected getConstructionSiteToolTip(train: TrainSummary): string {
    return 'Anzahl Baustellen im Zuglauf: ' + train.numberOfConstructionSites;
  }

  protected isTrainChain(train: TrainSummary): boolean {
    return train?.trains?.length > 1;
  }

  protected getTrainChainType(train: TrainSummary): TrainChainType | undefined | null {
    return train.trainChainIdentifier?.trainChainType;
  }

  protected getTooltip(train: TrainSummary): Observable<string> {
    if (!this.isTrainChain(train)) {
      return this.translate.get('Order-view-page.openTrainDetails');
    } else {
      return of(this.getIdChain(train));
    }
  }

  private getIdChain(train: TrainSummary): string {
    let result: string = '';
    if (train && train.trains && train.trains.length > 1) {
      let counter = 0;
      for (let t of train.trains) {
        if (counter > 0) {
          result += ', ';
        }
        result += t.trainNumber;
        counter++;
      }
    }
    return result;
  }

  protected getTrainIdentifier(trainSummary: TrainSummary, idx: number = 0): TrainIdentifier {
    return trainSummary.trains[idx];
  }

  protected calculateProgress(train: TrainSummary): string {
    const percentage = train.progress ? train.progress : train.parked ? "100" : "0";
    return percentage + '%';
  }

  protected isTrainLate(train: TrainSummary): boolean {
    return train.delayInMinutes ? train.delayInMinutes >= 15 && train.delayInMinutes < 60 : false;
  }

  protected isTrainTooLate(train: TrainSummary): boolean {
    return train.delayInMinutes ? train.delayInMinutes >= 60 : false;
  }

  protected containsRoundtrips(): boolean {
    const result = this.filter?.containsRoundtrips;
    return result;
  }

  protected cancelTrain(trainSummary: TrainSummary) {
    this.filter.scrollPosition = document.body.getBoundingClientRect().y;
    if (this.closeModalSubscription) {
      this.closeModalSubscription.unsubscribe();
    }
    this.closeModalSubscription = this.orderCancellationService.reloadSubject.subscribe((b: boolean | undefined | String) => {
      if (b) {
        this.filter.resetList(this.filter.offset + this.filter.limit);
        this.filter.updateTrainsList();
      }
    });

    this.orderCancellationService.cancelTrainByTrainSummary(trainSummary);
  }

  /**
   * Sends a request for tracking history of the specific train and opens modal window to preview this information
   * @param train Train order object
   */
  protected openTrackingHistoryModal(train: TrainSummary): void {
    console.log("openTrackingHistoryModal")
    this.modalWindows.openModalWindow(TrackingHistoryComponent, {
      trackingHistoryTrainData: train
    }, 1500);
  }

  /**
   * Sends a request for train details and opens modal window to preview these details
   * @param summary Train order object
  */
  protected openTrainInfoModal(summary: TrainSummary): void {
    this.trainDetailsService.trainDetails(summary);
  }

  protected openTrainRemarksModal(summary: TrainSummary): void {
    this.trainDetailsService.trainRemarks(summary);
  }


  protected openRailorderSummaryModal(summary: TrainSummary): void {
    this.railOrderSummaryService.railOrderSummaryDetails(summary);
  }
  /*
    protected openZabDetailsModal(summary: TrainSummary): void {
      this.zabDetailsService.zabOrderDetails(summary);
    }
  */
  /**
   * Changes the sorting conditions and emits a data update request
   * @param value sorting field value
  */
  protected sortTable(value: string): void {
    this.filter?.updateSortConditions(value);
  }

  /**
     * Loads additional 25 trains
     */
  protected loadMore(): void {
    this.filter.loadMore();
  }

  protected activateEditMenu(train: TrainSummary): boolean {
    return new Date().getTime() < new Date(train.plannedDeparture).getTime();
  }

  protected showTrackingBar(train: TrainSummary): boolean {
    const hasTrackingHistory = train.progress != undefined && train.currentLocation;
    const hasComments = train.comments;
    const hasETA = train.manualEta;
    const isParked = train.parked;
    const hasPermissionTrackingHistory = train.authorization.includes(Authorization.READ_TRACKING);
    const hasPermissionTrainDetails = train.authorization.includes(Authorization.READ_TRAIN_DETAILS);
    return (
              (hasTrackingHistory && hasPermissionTrackingHistory) ||
              (hasComments && hasPermissionTrainDetails) ||
              (hasETA && hasPermissionTrackingHistory) ||
              isParked
            )
            && train.orderStatus !== OrderStatusTypes.CANCELED;
  }

  get trainsList(): TrainSummary[] {
    return this.filter?.trainsList;
  }

  get totalTrains(): number {
    return this.filter?.totalTrains;
  }

  get lengthOfTrainsList(): number {
    if (this.trainsList?.length > 0) {
      return this.trainsList.length;
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
        field: 'plannedDeparture'
      }
    }
    return sortConditions;
  }
}
