import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, expand } from 'rxjs/operators';
import { InfrastructureLocation, InfrastructureLocationResponse, StationType } from '@src/app/trainorder/models/location.models';
import { StationTypes } from '@src/app/shared/enums/stations.enum';
import { Holiday } from '@src/app/trainorder/models/Holiday.model';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { AppService } from '@src/app/app.service';
import { TrainConnectionRequest, TrainConnectionResponse, TrainConnection, TrainConnectionElement } from '@src/app/trainorder/models/ApiMonthViewResponse.model';
import { TileTypeEnum } from '../tile.model';
import moment from 'moment';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { CustomerSelectComponent } from '@src/app/shared/components/customer-select/customer-select.component';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';

export interface Relation {
  sendingStation: InfrastructureLocation,
  receivingStation: InfrastructureLocation,
  infoRow: TrainConnectionElement[],
  dataRows: Map<string, TrainConnectionElement[]>,
  expanded: boolean
}

export const DEFAULT_LIMIT = 20;

@Component({
  selector: 'app-month-filter',
  templateUrl: './month-filter.component.html',
  styleUrls: ['./month-filter.component.scss']
})
export class MonthFilterComponent {

  @ViewChild('customer_select', { static: false }) customerSelection!: CustomerSelectComponent;

  private subscription: Subscription = new Subscription();
  private trainConnectionsRequestSubscription: Subscription = null;
  private sendingStationInputChange: Subject<string> = new Subject<string>(); // Used to track the input in the field
  private receivingStationInputChange: Subject<string> = new Subject<string>(); // in order to have a delay between the requests
  private endDate: Date;
  public startDate: Date;
  public limit: number = DEFAULT_LIMIT;
  public offset: number = 0;
  private trainNumberFilterActive: boolean;
  private sendingStationFilterActive: boolean;
  private receivingStationFilterActive: boolean;
  private customerProfile: CustomerProfile | null | undefined = null;

  public cachedFilterConditions: any = null;
  public loadingInProgress: boolean = false;
  public trainConnections: TrainConnection[] = [];
  public relations: Relation[] = [];
  public totalTilesAmount: number = 0;
  public currentAmountOfLoadedTiles: number = 0;
  public currentAmountOfVisibleTiles: number = 0;
  public showLoadButton: boolean;
  public datesInPeriod: Date[] = [];
  // public lengthOfSelectedMonth: number = moment().daysInMonth();
  public holidays: Holiday[] = [];

  public isAllExpanded = true;
  public scrollPosition: number = null;

  protected sendingStationsAutocomplete: InfrastructureLocation[] = [];
  protected receivingStationsAutocomplete: InfrastructureLocation[] = [];

  protected filterForm: FormGroup = new FormGroup({
    trainNumber: new FormControl(''),
    sendingStation: new FormControl(''),
    receivingStation: new FormControl(''),
    sendingStationKeyAlpha: new FormControl(''),
    receivingStationKeyAlpha: new FormControl(''),
    sendingStationKeySequence: new FormControl(''),
    receivingStationKeySequence: new FormControl(''),
  });

  protected numActiveFilters = 0;
  protected trainnumbers: string[] = [];

  constructor(private appService: AppService, private trainorderService: TrainorderService, private cd: ChangeDetectorRef, private storage: LocalStorageService) { }

  public destroy() {
    this.subscription.unsubscribe();
  }

  public init(limit: number = DEFAULT_LIMIT): void {
    this.registerForStationInput();
    this.setCurrentMonth();
    this.fetchFilterValuesFromSessionStorage();
    this.resetBasics(limit);
    // this.fetchTrainAndOrderData();

    this.subscription.add(this.appService.customerSelection.subscribe({
      next: ((customerProfile) => {
        this.customerProfile = customerProfile;
        if (!this.customerProfile && this.storage.getActiveProfiles() && this.storage.getActiveProfiles()?.length) {
          this.customerProfile = this.storage.getActiveProfiles()?.pop();
        }
        if (this.customerProfile && ((this.customerProfile.sgvId && !this.customerProfile.partnerId) || (this.customerProfile.partnerId && !this.customerProfile.sgvId))) {
          return;
        }
        this.fetchTrainAndOrderData();
      }),
    }));
  }

  public reloadTrainConnections(limit: number = DEFAULT_LIMIT) {
    this.resetBasics(limit);
    this.createFilter();
    this.fetchTrainAndOrderData();
  }

  private registerForStationInput(): void {
    this.registerForSendingStationInput();
    this.registerForReceivingStationInput();
  }

  private registerForSendingStationInput(): void {
    this.subscription.add(
      this.sendingStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
        if (input?.length === 0) {
          this.filterForm.controls['sendingStation'].setValue('');
          this.filterForm.controls['sendingStationKeySequence'].setValue('');
          this.filterForm.controls['sendingStationKeyAlpha'].setValue('');
          sessionStorage.removeItem('month-filter-sending-station-key-sequence');
          sessionStorage.removeItem('month-filter-sending-station-key-alpha');
          sessionStorage.removeItem('month-filter-sending-station-name');
          this.sendingStationFilterActive = false;
          this.sendingStationsAutocomplete = [];
          this.fetchTrainAndOrderData();
        } else {
          this.getAutocompleteSuggestions(input, StationTypes.SENDING);
        }
      })
    );
  }

  private registerForReceivingStationInput(): void {
    this.subscription.add(
      this.receivingStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
        if (input?.length === 0) {
          this.filterForm.controls['receivingStation'].setValue('');
          this.filterForm.controls['receivingStationKeySequence'].setValue('');
          this.filterForm.controls['receivingStationKeyAlpha'].setValue('');
          sessionStorage.removeItem('month-filter-receiving-station-key-sequence');
          sessionStorage.removeItem('month-filter-receiving-station-key-alpha');
          sessionStorage.removeItem('month-filter-receiving-station-name');
          this.receivingStationFilterActive = false;
          this.receivingStationsAutocomplete = [];
          this.fetchTrainAndOrderData();
        } else {
          this.getAutocompleteSuggestions(input, StationTypes.RECEIVING);
        }
      })
    );
  }

  private fetchTrainAndOrderData(): void {
    const filter = this.createFilter();
    this.loadingInProgress = true;
    this.doRequest(filter);
  }

  private errorDialogService: ErrorDialogService = inject(ErrorDialogService);
  private doRequest(filter: TrainConnectionRequest) {
    if (this.trainConnectionsRequestSubscription != null) {
      this.trainConnectionsRequestSubscription.unsubscribe();
    }
    this.trainConnectionsRequestSubscription = this.trainorderService.sendTrainConnectionsSearchRequest(filter).subscribe({
      next: ((result: TrainConnectionResponse) => {
        if (filter.offset == 0) {
          this.trainConnections = new Array();
          this.relations = new Array();
        }
        this.trainConnections = this.trainConnections.concat(result.items);
        this.totalTilesAmount = result.total;
        this.currentAmountOfLoadedTiles = this.trainConnections.length;
        this.offset = result.offset;
        this.createRelationModel();
        this.showLoadMoreButton();
        this.goToScrollPosition();
      }),
      error: (error => {
        this.trainConnections = new Array();
        this.relations = new Array();
        this.errorDialogService.openApiErrorDialog(error);
      })
    });
    this.trainConnectionsRequestSubscription.add(() => {
      this.loadingInProgress = false;
    });
  }

  private goToScrollPosition() {
    if (this.scrollPosition) window.scrollTo(0, -this.scrollPosition);
  }

  private createRelationModel(): void {
    this.relations = new Array();
    if (this.trainConnections) {
      this.trainConnections.forEach(tc => {
        const relation: Relation = { sendingStation: tc.sendingStation, receivingStation: tc.receivingStation, dataRows: new Map<string, TrainConnectionElement[]>(), infoRow: this.createEmptyRow(), expanded: this.isAllExpanded };
        this.relations.push(relation);
        if (tc.elements) {
          tc.elements.forEach(element => {
            element.dateAsDate = new Date(element.date);
            // if (element.trainChainIdentifier?.trainChainType && element.trainChainIdentifier?.trainChainType == TrainChainType.ROUNDTRIP) {
            //   element.trains.forEach(t => {
            //     const newElement: TrainConnectionElement = {
            //       ...element,
            //       id: t.trainNumber,
            //       trains: [t]
            //     };
            //     this.addElementToRelation(relation, newElement);
            //   });
            // } else {
            this.addElementToRelation(relation, element);
            // }
          });
          relation.dataRows = new Map([...relation.dataRows.entries()].sort().sort());
        }
      });
    }
  }

  private addElementToRelation(relation: Relation, element: TrainConnectionElement) {
    let data = relation.dataRows.get(element.id);
    if (!data) {
      data = this.createEmptyRow();
      relation.dataRows.set(element.id, data);
    }
    let foundIdx = data.findIndex(el => el.dateAsDate.getDate() == element.dateAsDate.getDate());
    data[foundIdx] = element;
    element.status = this.getStatus4TrainConnectionElement(element);
    const infoTile = relation.infoRow.find(t => {
      return t.dateAsDate.getDate() == element.dateAsDate.getDate();
    });
    if (infoTile) infoTile.status = TileTypeEnum.INFO;
  }

  private getStatus4TrainConnectionElement(el: TrainConnectionElement): TileTypeEnum {
    if (el.parked) {
      el.status = TileTypeEnum.PARKED;
    } else if (el.trainChainIdentifier || (el.trains && el.trains.length > 0)) {
      if (!el.status || el.status == TileTypeEnum.ORDER_ACCEPTED || this.customerProfile == null || !this.customerProfile.partnerId || !this.customerProfile.sgvId) {
        return this.determineTrainDelayStatus(el.delayInMinutes);
      }
    }

    return el.status;
  }

  private determineTrainDelayStatus(delayInMinutes: number): TileTypeEnum {
    if (!delayInMinutes) {
      return TileTypeEnum.TRAIN_SCHEDULED;
    }
    if (delayInMinutes >= 15 && delayInMinutes < 60) {
      return TileTypeEnum.TRAIN_LATE;
    }
    if (delayInMinutes >= 60) {
      return TileTypeEnum.TRAIN_TOO_LATE;
    }
    return TileTypeEnum.TRAIN_ON_TIME;
  }


  /**
   *  Creates tile information shown in the top row of the relation
   */
  private createEmptyRow(): TrainConnectionElement[] {
    const infoRow: TrainConnectionElement[] = [];
    this.datesInPeriod.forEach(d => {
      const tile: TrainConnectionElement = {
        dateAsDate: d,
        date: d.toISOString(),
        status: TileTypeEnum.EMPTY,
        parked: false,
        productType: null
      }
      infoRow.push(tile);
    });

    return infoRow;
  }

  private createFilter(): TrainConnectionRequest {
    const filter: TrainConnectionRequest = {
      offset: this.offset,
      limit: this.limit,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      sendingStationObjectKeyAlpha: this.filterForm.value.sendingStationKeyAlpha,
      sendingStationObjectKeySequence: this.filterForm.value.sendingStationKeySequence,
      receivingStationObjectKeyAlpha: this.filterForm.value.receivingStationKeyAlpha,
      receivingStationObjectKeySequence: this.filterForm.value.receivingStationKeySequence,
      identifier: this.filterForm.get('trainNumber')?.value,
      customerProfiles: this.customerProfile != null && this.customerProfile.sgvId ? [this.customerProfile] : []
    }
    return filter;
  }

  private showLoadMoreButton(): void {
    if (this.trainConnections && this.trainConnections.length > 0 && this.totalTilesAmount > this.trainConnections.length) {
      this.showLoadButton = true;
    } else {
      this.showLoadButton = false;
    }
  }

  public loadMore(): void {
    this.limit = DEFAULT_LIMIT;
    this.offset = this.currentAmountOfLoadedTiles;
    this.scrollPosition = null;
    this.fetchTrainAndOrderData();
  }

  protected activeFilterAmount(): number {
    let activeFilterAmount = 0;
    if (this.trainNumberFilterActive) {
      activeFilterAmount++;
    }
    if (this.sendingStationFilterActive) {
      activeFilterAmount++;
    }
    if (this.receivingStationFilterActive) {
      activeFilterAmount++;
    }
    return activeFilterAmount;
  }

  protected fetchFilterValuesFromSessionStorage(): void {
    // Trainnumber
    const s_trainNumber = sessionStorage.getItem('month-filter-trainnumber');
    if (s_trainNumber) {
      const trainNumberInput = this.filterForm.get('trainNumber');
      if (trainNumberInput) {
        trainNumberInput.setValue(s_trainNumber);
        this.trainNumberFilterActive = true;
      } else {
        console.error('Failed to find input field: trainNumber');
      }
    }

    // SendingStationKeyAlpha
    const s_sendingStationKeyAlpha = sessionStorage.getItem('month-filter-sending-station-key-alpha');
    if (s_sendingStationKeyAlpha) {
      const sendingStationKeyAlphaInput = this.filterForm.get('sendingStationKeyAlpha');
      if (sendingStationKeyAlphaInput) {
        sendingStationKeyAlphaInput.setValue(s_sendingStationKeyAlpha);
        this.filterForm.get('sendingStation')?.setValue(s_sendingStationKeyAlpha);
      } else {
        console.error('Failed to find input field: sendingStationKeyAlpha');
      }
    }

    // SendingStationKeySequence
    const s_sendingStationKeySequence = sessionStorage.getItem('month-filter-sending-station-key-sequence');
    if (s_sendingStationKeySequence) {
      const sendingStationKeySequenceInput = this.filterForm.get('sendingStationKeySequence');
      if (sendingStationKeySequenceInput) {
        sendingStationKeySequenceInput.setValue(s_sendingStationKeySequence);
        this.sendingStationFilterActive = true;
      } else {
        console.error('Failed to find input field: sendingStationKeySequence');
      }
    }

    // ReceivingStationKeyAlpha
    const s_receivingStationKeyAlpha = sessionStorage.getItem('month-filter-receiving-station-key-alpha');
    if (s_receivingStationKeyAlpha) {
      const receivingStationKeyAlphaInput = this.filterForm.get('receivingStationKeyAlpha');
      if (receivingStationKeyAlphaInput) {
        receivingStationKeyAlphaInput.setValue(s_receivingStationKeyAlpha);
        this.filterForm.get('receivingStation')?.setValue(s_receivingStationKeyAlpha);
      } else {
        console.error('Failed to find input field: receivingStationKeyAlpha');
      }
    }

    // ReceivingStationKeySequence
    const s_receivingStationKeySequence = sessionStorage.getItem('month-filter-receiving-station-key-sequence');
    if (s_receivingStationKeySequence) {
      const receivingStationKeySequenceInput = this.filterForm.get('receivingStationKeySequence');
      if (receivingStationKeySequenceInput) {
        receivingStationKeySequenceInput.setValue(Number(s_receivingStationKeySequence));
        this.receivingStationFilterActive = true;
      } else {
        console.error('Failed to find input field: receivingStationKeySequence');
      }
    }
  }

  protected setObjectKeyFormValues(event: any) {
    let foundStation;
    switch (event.target.name) {
      case 'sending-station':
        foundStation = this.sendingStationsAutocomplete.find((station) => station.name === event.target.value);
        if (foundStation) {
          this.filterForm.controls['sendingStationKeySequence'].setValue(foundStation.objectKeySequence);
          this.filterForm.controls['sendingStationKeyAlpha'].setValue(foundStation.objectKeyAlpha);
          sessionStorage.setItem('month-filter-sending-station-key-sequence', String(foundStation.objectKeySequence));
          sessionStorage.setItem('month-filter-sending-station-key-alpha', String(foundStation.objectKeyAlpha));
          sessionStorage.setItem('month-filter-sending-station-name', foundStation.name);
          this.sendingStationFilterActive = true;
        } break;
      case 'receiving-station':
        foundStation = this.receivingStationsAutocomplete.find((station) => station.name === event.target.value);
        if (foundStation) {
          this.filterForm.controls['receivingStationKeySequence'].setValue(foundStation.objectKeySequence);
          this.filterForm.controls['receivingStationKeyAlpha'].setValue(foundStation.objectKeyAlpha);
          sessionStorage.setItem('month-filter-receiving-station-key-sequence', String(foundStation.objectKeySequence));
          sessionStorage.setItem('month-filter-receiving-station-key-alpha', String(foundStation.objectKeyAlpha));
          sessionStorage.setItem('month-filter-receiving-station-name', foundStation.name);
          this.receivingStationFilterActive = true;
        } break;
    }
    if (!foundStation) {
      console.error('Failed to find station: ' + event.target.name);
    } else {
      this.resetBasics();
      this.fetchTrainAndOrderData();
    }
  }

  protected sendRequest(event: any) {
    this.resetBasics();
    this.fetchTrainAndOrderData();
  }

  /**
   * Emits the next input value from the field
   * @param event
   * @param field type of the field
   */
  protected autocompleteInputChanged(event: any): void {
    switch (event.target.name) {
      case 'sending-station':
        this.sendingStationInputChange.next(event.target.value);
        break;
      case 'receiving-station':
        this.receivingStationInputChange.next(event.target.value);
        break;
      default:
        break;
    }
    this.resetBasics();
  }

  /**
   * Emits the request to load stations autocomplete suggestions if input length is greater than 2
   * @param input event from the input
   */
  protected getAutocompleteSuggestions(input: any, stationType: string): void {
    let apiStationType = StationType.DEPARTURE;
    let autocompeteArray: InfrastructureLocation[] = [];
    if (stationType === StationTypes.SENDING) {
      autocompeteArray = this.sendingStationsAutocomplete;
    } else if (stationType === StationTypes.RECEIVING) {
      apiStationType = StationType.DESTINATION;
      autocompeteArray = this.receivingStationsAutocomplete;
    }
    this.trainorderService.getMonthViewInfrastructureLocations(input, apiStationType, autocompeteArray).subscribe((result: InfrastructureLocationResponse) => {
      if (stationType === StationTypes.SENDING) {
        this.sendingStationsAutocomplete = this.trainorderService.createUniqueKeysCommercialOrProductionLocations(result);
      } else if (stationType === StationTypes.RECEIVING) {
        this.receivingStationsAutocomplete = this.trainorderService.createUniqueKeysCommercialOrProductionLocations(result);
      }
    });
  }

  protected onChangeTrainNumberfilter(event: any) {
    if (event.target.value) {
      sessionStorage.setItem('month-filter-trainnumber', event.target.value);
      this.trainNumberFilterActive = true;
    } else {
      sessionStorage.removeItem('month-filter-trainnumber');
      this.trainNumberFilterActive = false;
    }
    this.resetBasics();
    this.fetchTrainAndOrderData();
  }

  /**
   * Resets all filter values to default
   */
  protected resetFilterConditions(): void {
    this.filterForm.controls['sendingStation'].setValue('');
    this.filterForm.controls['sendingStationKeySequence'].setValue('');
    this.filterForm.controls['sendingStationKeyAlpha'].setValue('');
    this.filterForm.controls['receivingStation'].setValue('');
    this.filterForm.controls['receivingStationKeySequence'].setValue('');
    this.filterForm.controls['receivingStationKeyAlpha'].setValue('');
    this.filterForm.controls['trainNumber'].setValue('');

    sessionStorage.removeItem('month-filter-sending-station-key-sequence');
    sessionStorage.removeItem('month-filter-sending-station-key-alpha');
    sessionStorage.removeItem('month-filter-sending-station-name');
    sessionStorage.removeItem('month-filter-receiving-station-key-sequence');
    sessionStorage.removeItem('month-filter-receiving-station-key-alpha');
    sessionStorage.removeItem('month-filter-receiving-station-name');
    sessionStorage.removeItem('month-filter-trainnumber');
    this.sendingStationFilterActive = false;
    this.receivingStationFilterActive = false;
    this.trainNumberFilterActive = false;
    this.resetBasics();
    this.fetchTrainAndOrderData();
  }

  protected clearSearchInput(key: string) {
    let update = false;
    switch (key) {
      case 'sendingStation':
        if (this.filterForm.controls['sendingStation'].value?.length > 0) {
          this.filterForm.controls['sendingStation'].setValue('');
          this.filterForm.controls['sendingStationKeySequence'].setValue('');
          this.filterForm.controls['sendingStationKeyAlpha'].setValue('');
          sessionStorage.removeItem('month-filter-sending-station-key-sequence');
          sessionStorage.removeItem('month-filter-sending-station-key-alpha');
          sessionStorage.removeItem('month-filter-sending-station-name');
          this.sendingStationFilterActive = false;
          update = true;
        }
        break;
      case 'receivingStation':
        if (this.filterForm.controls['receivingStation'].value?.length > 0) {
          this.filterForm.controls['receivingStation'].setValue('');
          this.filterForm.controls['receivingStationKeySequence'].setValue('');
          this.filterForm.controls['receivingStationKeyAlpha'].setValue('');
          sessionStorage.removeItem('month-filter-receiving-station-key-sequence');
          sessionStorage.removeItem('month-filter-receiving-station-key-alpha');
          sessionStorage.removeItem('month-filter-receiving-station-name');
          this.receivingStationFilterActive = false;
          update = true;
        }
        break;
      case 'trainNumber':
        if (this.filterForm.controls['trainNumber'].value?.length > 0) {
          this.filterForm.controls['trainNumber'].setValue('');
          sessionStorage.removeItem('month-filter-trainnumber');
          this.trainNumberFilterActive = false;
          update = true;
        }
        break;
    }
    if (update) {
      this.resetBasics();
      this.fetchTrainAndOrderData();
    }
  }

  /**
   * Used for input date fields to add focus class
   * @param event
   */
  protected onFocus(event: any) {
    event.target.classList.add('focused');
  }

  /**
   * Used for input date fields to remove focus class
   * @param event
   */
  protected onBlur(event: any) {
    if (!event.target.value) {
      event.target.classList.remove('focused');
    }
  }

  public jumpMonth(forward: boolean = true, numberOfMonths: number = 1) {
    let startDate: Date;
    if (forward) {
      startDate = moment(this.startDate).add(numberOfMonths, 'month').toDate();
    } else {
      startDate = moment(this.startDate).subtract(numberOfMonths, 'month').toDate();
    }
    this.startDate = startDate;
    this.endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1, 0, 0, 0);

    sessionStorage.setItem('month-filter-start-date', this.startDate.getFullYear() + '-' + (this.startDate.getMonth() + 1) + '-' + this.startDate.getDate());
    sessionStorage.setItem('month-filter-end-date', this.endDate.getFullYear() + '-' + (this.endDate.getMonth() + 1) + '-' + this.endDate.getDate());

    this.setDatesInMonth();
    this.resetBasics();
    this.fetchTrainAndOrderData();
  }

  protected setCurrentMonth(currentDate?: Date) {
    const s_startDate = sessionStorage.getItem('month-filter-start-date');
    const s_endDate = sessionStorage.getItem('month-filter-end-date');

    if (s_startDate && s_endDate) {
      this.startDate = new Date(s_startDate);
      this.endDate = new Date(s_endDate);
    } else {
      if (!currentDate) {
        currentDate = new Date();
      }
      this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
      this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 0, 0, 0);
    }
    this.setDatesInMonth();
  }

  private setDatesInMonth() {
    if (!this.startDate || !this.endDate) {
      throw new Error("Start- and end date have to be set");
    }
    this.datesInPeriod = new Array();
    var loop = new Date(this.startDate);
    while (loop < this.endDate) {
      this.datesInPeriod.push(new Date(loop));
      loop.setDate(loop.getDate() + 1);
    }
  }

  get sendingStation(): FormControl {
    return this.filterForm.get('sendingStation') as FormControl;
  }

  get receivingStation(): FormControl {
    return this.filterForm.get('receivingStation') as FormControl;
  }

  get selectedProfile(): CustomerProfile | null | undefined {
    return this.customerProfile;
  }

  public getOffset(): number {
    return this.offset;
  }

  public getLimit(): number {
    return this.limit;
  }

  private resetBasics(limit: number = DEFAULT_LIMIT) {
    this.offset = 0;
    this.limit = limit;
  }
}


