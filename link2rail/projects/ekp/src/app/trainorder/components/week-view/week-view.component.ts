import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { TrainChainType, TrainIdentifier, TrainSummary } from '@src/app/trainorder/models/ApiTrainsList.models';
import { NewOrderComponent } from '../new-order/new-order.component';
import { Subscription } from 'rxjs';
import { Holiday } from '@src/app/trainorder/models/Holiday.model';
import { WeekViewFilterComponent } from './week-view-filter/week-view-filter.component';
import { KeyValue } from '@angular/common';
import { OrderCancellationService } from '../order/order-cancellation/service/order-cancellation.service';
import { OrderStatusTypes } from '@src/app/shared/enums/order-status';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { PermissionService } from '../../../shared/permission/PermissionService';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { TrainDetailsService } from '@src/app/shared/components/train-details/service/train-details.service';
import { TrackingHistoryComponent } from '@src/app/shared/components/tracking-history/tracking-history.component';

export interface DayObj {
    date: Date;
    position: number;
}

@Component({
    selector: 'app-week-view',
    templateUrl: './week-view.component.html',
    styleUrls: ['./week-view.component.scss'],
})
export class WeekViewComponent implements AfterViewInit, AfterViewChecked, OnDestroy {

    @ViewChild('filter', { static: false }) filter!: WeekViewFilterComponent;

    protected loadingInProgress: boolean = true;
    protected showLoadButton: boolean;
    protected authorization = Authorization;
    protected daysOfWeekArray: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    protected trainChainTypes = TrainChainType;

    private subscription: Subscription = new Subscription();
    private now: Date;

    constructor(private modalWindows: ModalWindows, private orderCancellationService: OrderCancellationService, public permissionService: PermissionService, private cd: ChangeDetectorRef, private trainDetailsService: TrainDetailsService ) {
        this.now = new Date();
    }

    ngAfterViewInit(): void {
      this.registerForLoadMoreButtonStatusChanges();
      this.registerForLoadingStatusChanges();
    }

    ngAfterViewChecked(): void {
      this.cd.detectChanges();
    }

    ngOnDestroy() {
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

    protected hasConstructionSite(trainsObject: any): boolean {
      if (trainsObject.numberOfConstructionSites > 0) {
        return true;
      }
      return false;
    }

    protected getConstructionSiteToolTip(train: any): string {
      return 'Anzahl Baustellen im Zuglauf: ' + train.numberOfConstructionSites;
    }

    protected openModalCancelOrder(trainSummary: TrainSummary) {
      this.orderCancellationService.reloadSubject.subscribe((b: boolean) => {
        this.filter.resetList(this.filter.offset + this.filter.limit);
        this.filter.updateTrainsList();
      });
      this.orderCancellationService.cancelTrainByTrainSummary(trainSummary);
    }

    // protected openModalModifyOrder(train: TrainSummary) {
    //     const order = {};
    //     this.modalWindows.openModalWindow(CapacityReductionComponent, { orderItem: order });
    // }

    protected loadMore() {
      this.filter.offset += 125;
      this.filter?.updateTrainsList();
    }

    protected setDaysOfWeek(event: any): void {
        this.filter.setDaysOfWeek(event);
    }

    protected isToday(date: Date): boolean {
        return date.getDate() === this.now.getDate() && date.getMonth() === this.now.getMonth();
    }

    protected openNewOrderModal(): void {
        this.modalWindows.openModalWindow(NewOrderComponent);
    }

    protected dayComparator(day1: KeyValue<string, DayObj>, day2: KeyValue<string, DayObj>): number {
      return day1.value.position - day2.value.position;
    }

    protected openTrackingHistoryModal(train: TrainSummary): void {
      this.modalWindows.openModalWindow(TrackingHistoryComponent, { trackingHistoryTrainData: train }, 1500);
    }

    protected openTrainInfoModal(trainSummary: TrainSummary): void {
      this.trainDetailsService.trainDetails(trainSummary);
    }

    protected arrivalOnOtherDay(departureString: string, arrivalString: string | Date): string {
        try {
            if (!departureString || !arrivalString) {
                return '';
            }

            const arrDate = new Date(arrivalString);
            const deptDate = new Date(departureString);
            if(arrDate.toString() == 'Invalid Date' || deptDate.toString() == 'Invalid Date') {
                throw 'Invalid Date';
            }
            arrDate.setHours(0,0,0);
            deptDate.setHours(0,0,0);
            const diffTime = arrDate.getTime() - deptDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays == 0 ? '' : diffDays > 0 ? '+' + diffDays : diffDays + '';
        } catch (error) {
            console.error(error);
            return '';
        }
    }

  protected calculateProgress(procent: string, parked: boolean): string {
    if (!procent && parked) return '100%';
    return procent ? procent.replace(',', '.') + '%' : '0%';
  }

    protected isTrainLate(train: TrainSummary): boolean {
      return train.delayInMinutes ? train.delayInMinutes >= 15 && train.delayInMinutes < 60 : false;
    }

    protected isTrainTooLate(train: TrainSummary): boolean {
      return train.delayInMinutes ? train.delayInMinutes >= 60 : false;
    }

    protected getHolidayNames(holidaysArr: Holiday[]): string {
      if (holidaysArr) {
        return holidaysArr.map((h) => { return h.name; }).join(" | ");
      }
      return '';
    }

    protected activateEditMenu(train: TrainSummary): boolean {
      return new Date().getTime() < new Date(train.plannedDeparture).getTime();
    }

    protected toUpperOptionalString(s: string | undefined | null) {
      if(!s) return '';
      return s.toUpperCase();
    }

    protected isTrainChain(trains: any): boolean {
      let found = false;
      for(let idx = 0; idx < 7; idx++) {
        if (trains.value[idx] && trains.value[idx].trains && trains.value[idx].trains.length > 1) {
          found = true;
        }
      }
      return found;
    }

    protected getTrainChainType(trains: any): TrainChainType | null {
      let found = null;
      for(let idx = 0; idx < 7; idx++) {
        if (trains.value[idx] && trains.value[idx].trains && trains.value[idx].trains.length > 1) {
          found = trains.value[idx].trainChainIdentifier.trainChainType;
        }
      }
      return found;
    }

    protected getChainReceivingStation(trains: any): string {
      for(let idx_0 = 0; idx_0 < 7; idx_0++) {
        if (trains.value[idx_0] && trains.value[idx_0].trains && trains.value[idx_0].trains.length > 1) {
          if (trains.value[idx_0].trains.length > 1) {
            return trains.value[idx_0].receivingStation.name;
          }
        }
      }
      return 'NOT FOUND';
    }

    protected getTrainChainIds(trains: any): string {
      let result: string = '';
      let counter = 0;
      for(let idx_0 = 0; idx_0 < 7; idx_0++) {
        if (trains.value[idx_0] && trains.value[idx_0].trains && trains.value[idx_0].trains.length > 1) {
          for (let idx_1 = 0; idx_1 < trains.value[idx_0].trains.length; idx_1++) {
            const trainNumber = trains.value[idx_0].trains[idx_1].trainNumber;
            if (!result.includes(trainNumber)) {
              if (counter > 0) {
                result += ', ';
              }
              result += trainNumber;
              counter++;
            }
          }
        }
      }
      return result;
    }

    protected getIdChain(train: TrainSummary): string {
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

    protected showTrackingBar(train: TrainSummary): boolean {
      const hasTrackingHistory = train.progress != undefined && train.currentLocation;
      const hasComments = train.comments;
      const hasPermissionTrackingHistory = this.permissionService.hasPermission(null, [Authorization.READ_TRACKING], train.authorization);
      const hasPermissionTrainDetails = this.permissionService.hasPermission(null, [Authorization.READ_TRAIN_DETAILS], train.authorization);
      return (
                (hasTrackingHistory && hasPermissionTrackingHistory) ||
                (hasComments && hasPermissionTrainDetails)
              )
              && train.orderStatus !== OrderStatusTypes.CANCELED;
    }

    get regularTrains() {
      return this.filter?.regularTrains;
    }

    get specialTrains() {
      return this.filter?.specialTrains;
    }

    get totalTrains(): number {
      return this.filter?.totalTrains;
    }

    get daysOfWeek() {
        return this.filter?.daysOfWeek;
    }

    get lengthOfTrainsList(): number {
      if (this.filter?.trainsList)
        return this.filter?.trainsList.length;
      else
        return 0;
    }
}
