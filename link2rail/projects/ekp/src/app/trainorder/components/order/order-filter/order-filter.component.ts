import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommercialLocation, InfrastructureLocationResponse, StationType } from '@src/app/trainorder/models/location.models';
import { debounceTime } from 'rxjs/operators';
import { ApiOrdersListRequest, ApiOrdersListResponse, OrderItem } from '@src/app/trainorder/models/ApiOrders.model';
import { StationTypes } from '@src/app/shared/enums/stations.enum';
import { OrderStatusTypes } from '@src/app/shared/enums/order-status';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { formatDate } from '@angular/common';
import { AppService } from '@src/app/app.service';
import { trainListLimit } from '@src/app/shared/constants/Constants';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';

enum OrderSelection {
  ALL = 'ALL',
  ORDERS = 'ORDERS',
  CANCELLATION = 'CANCELLATION'
}

const ORDER_LIST_FILTER_SENDING_STATION_KEY_ALPHA = 'order-list-filter-sending-station-key-alpha';
const ORDER_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE = 'order-list-filter-sending-station-key-sequence';
const ORDER_LIST_FILTER_SHIPMENT_DATE_TO = 'order-list-filter-shipment-date-to';
const ORDER_LIST_FILTER_SHIPMENT_DATE_FROM = 'order-filter-shipment-date-from';
const ORDER_LIST_FILTER_ORDER_STATUS = 'order-filter-order-status';
const ORDER_LIST_FILTER_SENDING_STATION_NAME = 'order-list-filter-sending-station-name';
const ORDER_LIST_FILTER_RECEIVING_STATION_NAME = 'order-list-filter-receiving-station-name';
const ORDER_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA = 'order-list-filter-receiving-station-key-alpha';
const ORDER_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE = 'order-list-filter-receiving-station-key-sequence';
const SHIPMENT_DATE = 'shipmentDate';
const SHIPMENT_DATE_TO = 'shipmentDateTo';
const SHIPMENT_DATE_FROM = 'shipmentDateFrom';
const SENDING_STATION = 'sendingStation';
const SENDING_STATION_KEY_ALPHA = 'sendingStationKeyAlpha';
const SENDING_STATION_KEY_SEQUENCE = 'sendingStationKeySequence';
const RECEIVING_STATION = 'receivingStation';
const RECEIVING_STATION_KEY_ALPHA = 'receivingStationKeyAlpha';
const RECEIVING_STATION_KEY_SEQUENCE = 'receivingStationKeySequence';
const ORDER_STATUS = 'orderStatus';
const FOCUSED = 'focused';
const ORDER_NUMBER = 'orderNumber';
@Component({
  selector: 'app-order-filter',
  templateUrl: './order-filter.component.html',
  styleUrls: ['./order-filter.component.scss']
})
export class OrderFilterComponent implements OnInit, OnDestroy {
  public showLoadMoreButton$: Subject<boolean> = new Subject();
  public loadingInProgress$: Subject<boolean> = new Subject();
  public maxDate: string;
  public ordersList: OrderItem[];
  public totalOrders: number;
  public sortConditions: SortConditionsModel = { asc: true, field: SHIPMENT_DATE};
  public offset: number = 0;
  public limit: number = 25;

  protected numberOfOrders: number;
  protected filterForm: FormGroup;
  protected sendingStationsAutocomplete: CommercialLocation[] = [];
  protected receivingStationsAutocomplete: CommercialLocation[] = [];
  protected OrderSelection = OrderSelection;
  protected downloadInProgress: boolean = false;

  private subscription: Subscription = new Subscription();
  private sendingStationInputChange: Subject<string> = new Subject<string>();
  private receivingStationInputChange: Subject<string> = new Subject<string>();
  private autocompeteArray: CommercialLocation[] = [];
  private rfi: boolean = false;
  private customerProfile: CustomerProfile | null | undefined = null;
  private shipmentDateFromFilterActive: boolean;
  private shipmentDateToFilterActive: boolean;
  private sendingStationFilterActive: boolean;
  private receivingStationFilterActive: boolean;
  private OrderNumberFilterActive: boolean;
  private ordersListServiceSubscription: Subscription = null;

  constructor(private trainOrderService: TrainorderService, private appService: AppService, private storage: LocalStorageService, private fileExportService: FileExportService) {
    this.ordersList = [];
    this.createFilterForm();
    this.createMaxDate();
    this.fetchFilterValuesFromSessionStorage();
    this.registerForInputChanges();
  }

  ngOnInit(): void {
    this.fetchOrders(this.updateFilter());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public updateOrdersList(): void {
    const filter = this.updateFilter();
    this.fetchOrders(filter);
  }

  private registerForInputChanges(): void {
    this.registerForStationInputChanges();
    this.registerForCustomerSelectionChanges();
    this.registerForChangeOrderStatusSelection();
    this.registerForShipmentDateFromInputChanges();
    this.registerForShipmentDateToInputChanges();
  }

  private registerForShipmentDateFromInputChanges(): void {
    this.shipmentDateFrom.valueChanges.subscribe(input => {
      if (!input) {
        sessionStorage.removeItem(ORDER_LIST_FILTER_SHIPMENT_DATE_FROM);
        this.shipmentDateFromFilterActive = false;
      }
    });
  }

  private registerForShipmentDateToInputChanges(): void {
    this.shipmentDateTo.valueChanges.subscribe(input => {
      if (!input) {
        sessionStorage.removeItem(ORDER_LIST_FILTER_SHIPMENT_DATE_TO);
        this.shipmentDateToFilterActive = false;
      }
    });
  }

  private registerForStationInputChanges(): void {
    this.registerForSendingStationInputChanges();
    this.registerForReceivingStationInputChanges();
  }

  private fetchFilterValuesFromSessionStorage(): void {
    this.fetchOrderNumberFromSessionStorage();
    this.fetchOrderStatusFromSessionStorage();
    this.fetchShipmentDateFromFromSessionStorage();
    this.fetchShipmentDateToFromSessionStorage();
    this.fetchSendingStationNameFromSessionStorage();
    this.fetchSendingStationKeyAlphaFromSessionStorage();
    this.fetchSendingStationKeySequenceFromSessionStorage();
    this.fetchReceivingStationNameFromSessionStorage();
    this.fetchReceivingStationKeyAlphaFromSessionStorage();
    this.fetchReceivingStationKeySequenceFromSessionStorage();
  }

  private fetchReceivingStationKeySequenceFromSessionStorage(): void {
    const s_receivingStationKeySequence = sessionStorage.getItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
    if (s_receivingStationKeySequence) {
      const receivingStationKeySequenceInput = this.filterForm.get(RECEIVING_STATION_KEY_SEQUENCE);
      if (receivingStationKeySequenceInput) {
          receivingStationKeySequenceInput.setValue(s_receivingStationKeySequence);
      } else {
          console.error('Failed to find input field: receivingStationKeySequence');
      }
    }
  }

  private setLoadMoreButtonState(): void {
    if (this.ordersList && this.totalOrders > 0 && this.totalOrders > this.ordersList.length) {
        this.showLoadMoreButton$.next(true);
    } else {
        this.showLoadMoreButton$.next(false);
    }
  }

  private fetchReceivingStationKeyAlphaFromSessionStorage(): void {
    const s_receivingStationKeyAlpha = sessionStorage.getItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA);
    if (s_receivingStationKeyAlpha) {
      const receivingStationKeyAlphaInput = this.filterForm.get(RECEIVING_STATION_KEY_ALPHA);
      if (receivingStationKeyAlphaInput) {
          this.receivingStationFilterActive = true;
          receivingStationKeyAlphaInput.setValue(s_receivingStationKeyAlpha);
      } else {
          console.error('Failed to find input field: receivingStationKeyAlpha');
      }
    }
  }

  private fetchReceivingStationNameFromSessionStorage(): void {
    const receivingStationName = sessionStorage.getItem(ORDER_LIST_FILTER_RECEIVING_STATION_NAME);
    if (receivingStationName) {
        this.receivingStation.setValue(receivingStationName);
    }
  }

  private registerForCustomerSelectionChanges(): void {
    this.subscription.add(
      this.appService.customerSelection.subscribe({
          next: ( (customerProfile) => {
              if (customerProfile) {
                  if (customerProfile.partnerId.length === 0 && customerProfile.sgvId.length === 0) {
                      this.customerProfile = null;
                  } else {
                      this.customerProfile = customerProfile;
                  }
                  if ( (customerProfile.partnerId.length > 0 && customerProfile.sgvId.length > 0) || (this.customerProfile === null) ) {
                    this.resetList();
                    this.fetchOrders(this.updateFilter());
                  }
              }
          })
      })
    );
  }

  public resetList(limit: number = 25): void {
    this.ordersList = [];
    this.offset = 0;
    this.limit = limit;
  }

  private fetchOrderNumberFromSessionStorage(): void {
    const value = sessionStorage.getItem(ORDER_NUMBER);
    if (value) {
      this.OrderNumberFilterActive = true;
      this.orderNumber.setValue(value);
    }
  }

  private fetchSendingStationNameFromSessionStorage(): void {
    const sendingStationName = sessionStorage.getItem(ORDER_LIST_FILTER_SENDING_STATION_NAME);
    if (sendingStationName) {
        this.sendingStation.setValue(sendingStationName);
    }
  }

  private fetchSendingStationKeyAlphaFromSessionStorage(): void {
    const s_sendingStationKeyAlpha = sessionStorage.getItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_ALPHA);
    if (s_sendingStationKeyAlpha) {
      const sendingStationKeyAlphaInput = this.filterForm.get(SENDING_STATION_KEY_ALPHA);
      if (sendingStationKeyAlphaInput) {
        this.sendingStationFilterActive = true;
        sendingStationKeyAlphaInput.setValue(s_sendingStationKeyAlpha);
      } else {
        console.error('Failed to find input field: sendingStationKeyAlpha');
      }
    }
  }

  private fetchSendingStationKeySequenceFromSessionStorage(): void {
    const s_sendingStationKeySequence = sessionStorage.getItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE);
    if (s_sendingStationKeySequence) {
    const sendingStationKeySequenceInput = this.filterForm.get(SENDING_STATION_KEY_SEQUENCE);
    if (sendingStationKeySequenceInput) {
        sendingStationKeySequenceInput.setValue(s_sendingStationKeySequence);
    } else {
        console.error('Failed to find input field: sendingStationKeySequence');
    }
    }
  }

  private fetchShipmentDateToFromSessionStorage(): void {
    const shipmentDateTo = sessionStorage.getItem(ORDER_LIST_FILTER_SHIPMENT_DATE_TO);
    if (shipmentDateTo) {
      this.shipmentDateToFilterActive = true;
      this.shipmentDateTo.setValue(formatDate(shipmentDateTo, 'yyyy-MM-dd', 'de'));
    }
  }

  private fetchShipmentDateFromFromSessionStorage(): void {
    const shipmentDateFrom = sessionStorage.getItem(ORDER_LIST_FILTER_SHIPMENT_DATE_FROM);
    if (shipmentDateFrom) {
      this.shipmentDateFrom.setValue(shipmentDateFrom);
    } else {
      this.shipmentDateFrom.setValue(formatDate(new Date(), 'yyyy-MM-dd', 'de'));
    }
    this.shipmentDateFromFilterActive = true;
  }

  private fetchOrderStatusFromSessionStorage(): void {
    const orderStatus = sessionStorage.getItem(ORDER_LIST_FILTER_ORDER_STATUS);
    if (orderStatus) {
      this.orderStatus.setValue(orderStatus);
    } else {
      this.orderStatus.setValue(OrderSelection.ALL);
    }
  }

  private registerForChangeOrderStatusSelection(): void {
    this.orderStatus.valueChanges.subscribe(value => {
      sessionStorage.setItem(ORDER_LIST_FILTER_ORDER_STATUS, value);
      // this.resetList();
      // this.fetchOrders(this.updateFilter());
    });
  }

  protected orderStatusChange(): void {
    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  private registerForSendingStationInputChanges(): void {
    this.subscription.add(
        this.sendingStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
          if (input?.length === 0) {
            this.sendingStationsAutocomplete = [];
            this.sendingStationFilterActive = false;
            sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_NAME);
            sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_ALPHA);
            sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE);
            this.sendingStationKeyAlpha.setValue('');
            this.sendingStationKeySequence.setValue('');
            this.resetList();
            this.fetchOrders(this.updateFilter());
          } else {
            const item = this.sendingStationsAutocomplete.find(station => { return station.name === input; } );
            if (item) {
                this.sendingStationFilterActive = true;
                sessionStorage.setItem(ORDER_LIST_FILTER_SENDING_STATION_NAME, item.name);
                sessionStorage.setItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_ALPHA, item.objectKeyAlpha);
                sessionStorage.setItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE, String(item.objectKeySequence));
                this.sendingStationKeyAlpha.setValue(item.objectKeyAlpha);
                this.sendingStationKeySequence.setValue(item.objectKeySequence);
                this.sendingStationsAutocomplete = [];
                this.resetList();
                this.fetchOrders(this.updateFilter());
            } else {
                this.getAutocompleteSuggestions(input, StationTypes.SENDING);
            }
          }
        })
    );
  }

  private registerForReceivingStationInputChanges(): void {
    this.subscription.add(
        this.receivingStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
          if (input?.length === 0) {
            this.receivingStationsAutocomplete = [];
            this.receivingStationFilterActive = false;
            sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_NAME);
            sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA);
            sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
            this.receivingStationKeyAlpha.setValue('');
            this.receivingStationKeySequence.setValue('');
            this.receivingStationsAutocomplete = [];
            this.resetList();
            this.fetchOrders(this.updateFilter());
          } else {
            const item = this.receivingStationsAutocomplete.find(station => { return station.name === input; } );
            if (item) {
                this.receivingStationFilterActive = true;
                sessionStorage.setItem(ORDER_LIST_FILTER_RECEIVING_STATION_NAME, item.name);
                sessionStorage.setItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA, item.objectKeyAlpha);
                sessionStorage.setItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE, String(item.objectKeySequence));
                this.receivingStationKeyAlpha.setValue(item.objectKeyAlpha);
                this.receivingStationKeySequence.setValue(item.objectKeySequence);
                this.receivingStationsAutocomplete = [];
                this.resetList();
                this.fetchOrders(this.updateFilter());
            } else {
                this.getAutocompleteSuggestions(input, StationTypes.RECEIVING);
            }
          }
        })
    );
  }

  private fetchOrders(filter: ApiOrdersListRequest): void {
    if(this.ordersListServiceSubscription) {
      this.ordersListServiceSubscription.unsubscribe();
    }
    this.loadingInProgress$.next(true);
    this.ordersListServiceSubscription = this.trainOrderService.sendOrdersListRequest(filter).subscribe({
      next: ( (result: ApiOrdersListResponse) => {
        if(result.offset == 0) {
          this.ordersList = [];
        }
        this.ordersList = this.ordersList.concat(result.items); ;
        this.limit = result.limit;
        this.offset = result.offset;
        this.numberOfOrders = this.ordersList?.length;
        this.totalOrders = result.total;
        this.setLoadMoreButtonState();
      }),
      error: (error => {
        console.error('Failed to load data: ', error);
      })
    });
    this.ordersListServiceSubscription.add(() => {
      this.loadingInProgress$.next(false);
    });
  }

  private createFilterForm(): void {
    this.filterForm = new FormGroup({
      orderStatus: new FormControl(OrderSelection.ALL),
      orderNumber: new FormControl(''),
      shipmentDateFrom: new FormControl(''),
      shipmentDateTo: new FormControl(''),
      sendingStation: new FormControl(''),
      receivingStation: new FormControl(''),
      sendingStationKeyAlpha: new FormControl(''),
      receivingStationKeyAlpha: new FormControl(''),
      sendingStationKeySequence: new FormControl(''),
      receivingStationKeySequence: new FormControl(''),
    },
    [this.validateDates()]);
  }

  private validateDates(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.get(SHIPMENT_DATE_FROM)?.value || !control.get(SHIPMENT_DATE_TO)?.value)
        return null;
      return control.get(SHIPMENT_DATE_FROM)?.value <= control.get(SHIPMENT_DATE_TO)?.value ? null : { dateToBeforeDateFrom: true };
    }
  }

  private updateFilter(): ApiOrdersListRequest {
    const profiles: CustomerProfile[] = [];
    if (this.customerProfile) {
        profiles.push(this.customerProfile);
    }

    const filter: ApiOrdersListRequest = {
      orderStatus: this.determineOrderStatusTypes(this.orderStatus.value),
      orderNumber: this.filterForm.value.orderNumber,
      shipmentDateFrom: this.filterForm.value.shipmentDateFrom,
      shipmentDateTo: this.filterForm.value.shipmentDateTo,
      sendingStationObjectKeyAlpha: this.filterForm.value.sendingStationKeyAlpha,
      sendingStationObjectKeySequence: this.filterForm.value.sendingStationKeySequence,
      receivingStationObjectKeyAlpha: this.filterForm.value.receivingStationKeyAlpha,
      receivingStationObjectKeySequence: this.filterForm.value.receivingStationKeySequence,
      customerProfiles: profiles,
      limit: this.limit,
      offset: this.offset,
      sort: this.createSortConditionStatement()
    }
    return filter;
  }

  private createSortConditionStatement(): string {
    if (this.sortConditions.asc === true) {
        return '+' + this.sortConditions.field;
    } else {
        return '-' + this.sortConditions.field;
    }
  }

  private determineOrderStatusTypes(currentSelection: OrderSelection): OrderStatusTypes[] {
    const orderStatusTypes: OrderStatusTypes[] = [];
    switch(currentSelection){
      case OrderSelection.ALL: { break; }
      case OrderSelection.CANCELLATION: {
        orderStatusTypes.push(OrderStatusTypes.CANCELED);
        orderStatusTypes.push(OrderStatusTypes.CANCELLATION_ACQUIRED);
        orderStatusTypes.push(OrderStatusTypes.CANCELLATION_IN_VALIDATION);
        orderStatusTypes.push(OrderStatusTypes.CANCELLATION_DECLINED);
        break;
      }
      case OrderSelection.ORDERS: {
        // orderStatusTypes.push(OrderStatusTypes.ALTERNATIVE_ACCEPTED);
        // orderStatusTypes.push(OrderStatusTypes.ALTERNATIVE_DECLINED);
        orderStatusTypes.push(OrderStatusTypes.ORDER_ACCEPTED);
        orderStatusTypes.push(OrderStatusTypes.ORDER_ACQUIRED);
        orderStatusTypes.push(OrderStatusTypes.ORDER_DECLINED);
        orderStatusTypes.push(OrderStatusTypes.ORDER_DECLINED_WITH_ALTERNATIVE);
        orderStatusTypes.push(OrderStatusTypes.ORDER_IN_VALIDATION);
        orderStatusTypes.push(OrderStatusTypes.PLANNING_OFFER_AVAILABLE);
        orderStatusTypes.push(OrderStatusTypes.REDUCTION_ACCEPTED);
        break;
      }
      default: {
        console.error('Unknown OrderSelection: ', currentSelection);
        break;
      }
    }

    return orderStatusTypes;
  }

  private createMaxDate(): void {
    let now = new Date();
    now.setFullYear(now.getFullYear() + 5);
    this.maxDate = now.getFullYear() + "-" + (now.getMonth() < 10 ? "0" : "") + (now.getMonth() + 1) + "-" + (now.getDate() < 10 ? "0" : "") + now.getDate();
  }

  public updateSortConditions(fieldName: string): void {
    let sortConditions: SortConditionsModel;
    if (fieldName === this.sortConditions.field) {
        sortConditions = {
            asc: !this.sortConditions.asc,
            field: this.sortConditions.field
        }
    } else {
        sortConditions = {
            asc: true,
            field: fieldName
        }
    }
    this.sortConditions = sortConditions;
    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  protected resetFilterConditions(): void {
    this.filterForm.setValue({
      orderStatus: OrderSelection.ALL,
      orderNumber: '',
      shipmentDateFrom: '',
      shipmentDateTo: '',
      sendingStation: '',
      receivingStation: '',
      sendingStationKeyAlpha: '',
      receivingStationKeyAlpha: '',
      sendingStationKeySequence: '',
      receivingStationKeySequence: '',
    });

    sessionStorage.removeItem(ORDER_LIST_FILTER_ORDER_STATUS);
    sessionStorage.removeItem(ORDER_LIST_FILTER_SHIPMENT_DATE_TO);
    sessionStorage.removeItem(ORDER_LIST_FILTER_SHIPMENT_DATE_FROM);
    sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE);
    sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_ALPHA);
    sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_NAME);
    sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
    sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA);
    sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_NAME);
    sessionStorage.removeItem(ORDER_NUMBER);

    this.shipmentDateFromFilterActive = false;
    this.shipmentDateToFilterActive = false;
    this.sendingStationFilterActive = false;
    this.receivingStationFilterActive = false;
    this.OrderNumberFilterActive = false;

    this.sendingStationsAutocomplete = [];
    this.receivingStationsAutocomplete = [];

    this.orderStatus.setValue(OrderSelection.ALL);
    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  protected activeFilterAmount(): number {
    let activeFilterAmount = 0;
    if (this.shipmentDateFromFilterActive) {
      activeFilterAmount++;
    }
    if (this.shipmentDateToFilterActive) {
        activeFilterAmount++;
    }
    if (this.sendingStationFilterActive) {
      activeFilterAmount++;
    }
    if (this.receivingStationFilterActive) {
      activeFilterAmount++;
    }
    if (this.OrderNumberFilterActive) {
      activeFilterAmount++;
    }
    return activeFilterAmount;
  }

  protected clearSearchInput(key: string) {
    switch (key) {
        case ORDER_NUMBER:
          this.filterForm.controls[ORDER_NUMBER].setValue('');
          sessionStorage.removeItem(ORDER_NUMBER);
          this.OrderNumberFilterActive = false;
          break;
        case SENDING_STATION:
          this.filterForm.controls[SENDING_STATION].setValue('');
          this.filterForm.controls[SENDING_STATION_KEY_SEQUENCE].setValue('');
          this.filterForm.controls[SENDING_STATION_KEY_ALPHA].setValue('');
          sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE);
          sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_KEY_ALPHA);
          sessionStorage.removeItem(ORDER_LIST_FILTER_SENDING_STATION_NAME);
          this.sendingStationFilterActive = false;
          this.sendingStationsAutocomplete = [];
          break;
        case RECEIVING_STATION:
          this.filterForm.controls[RECEIVING_STATION].setValue('');
          this.filterForm.controls[RECEIVING_STATION_KEY_SEQUENCE].setValue('');
          this.filterForm.controls[RECEIVING_STATION_KEY_ALPHA].setValue('');
          sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
          sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA);
          sessionStorage.removeItem(ORDER_LIST_FILTER_RECEIVING_STATION_NAME);
          this.receivingStationFilterActive = false;
          this.receivingStationsAutocomplete = [];
          break;
        case SHIPMENT_DATE_FROM:
          this.filterForm.controls[SHIPMENT_DATE_FROM].setValue('');
          sessionStorage.removeItem(ORDER_LIST_FILTER_SHIPMENT_DATE_FROM);
          this.shipmentDateFromFilterActive = false;
          break;
        case SHIPMENT_DATE_TO:
          this.filterForm.controls[SHIPMENT_DATE_TO].setValue('');
          sessionStorage.removeItem(ORDER_LIST_FILTER_SHIPMENT_DATE_TO);
          this.shipmentDateToFilterActive = false;
          break;
    }
    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  /**
   * Emits the next input value from the field
   * @param event
   */
  protected autocompleteInputChanged(event: any): void {
    switch (event.target.name) {
      case 'sending-station':
        this.sendingStationInputChange.next(event.target.value);
        break;
      case 'receiving-station':
        this.receivingStationInputChange.next(event.target.value);
        break;
    }
  }

  /**
   * Emits the request to load stations autocomplete suggestions if input length is greater than 2
   * @param input event from the input
   */
  protected getAutocompleteSuggestions(input: any, stationType: string): void {
    this.autocompeteArray = [];
    let apiStationType = StationType.DEPARTURE;
    if (stationType === StationTypes.SENDING) {
      this.autocompeteArray = this.sendingStationsAutocomplete;
    } else if (stationType === StationTypes.RECEIVING) {
      apiStationType = StationType.DESTINATION;
      this.autocompeteArray = this.receivingStationsAutocomplete;
    }
    this.rfi = false;
    this.trainOrderService.getOrdersCommercialLocations(input, apiStationType, this.autocompeteArray).subscribe((result: InfrastructureLocationResponse) => {
      if (stationType === StationTypes.SENDING) {
        this.sendingStationsAutocomplete = this.trainOrderService.createUniqueKeysCommercialOrProductionLocations(result);
        this.rfi = true;
      } else if (stationType === StationTypes.RECEIVING) {
        this.receivingStationsAutocomplete = this.trainOrderService.createUniqueKeysCommercialOrProductionLocations(result);
        this.rfi = true;
      }
    });
  }

  protected selectOrderNumber(event: any): void {
    const orderNumber = this.filterForm.get(ORDER_NUMBER);
    if(orderNumber.value.length > 0 && orderNumber.value.length < 3) {
      return;
    }
    if (orderNumber) {
      this.OrderNumberFilterActive = true;
      sessionStorage.setItem(ORDER_NUMBER, orderNumber.value);
    } else {
      console.error('Failed to find input: orderNumber');
    }
    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  protected selectShipmentDateFrom(event: any): void {
    const shipmentDateFrom = this.filterForm.get(SHIPMENT_DATE_FROM);
    if (shipmentDateFrom) {
      if (this.shipmentDateFrom.value) {
        this.shipmentDateFromFilterActive = true;
        sessionStorage.setItem(ORDER_LIST_FILTER_SHIPMENT_DATE_FROM, shipmentDateFrom.value);
      } else {
        this.shipmentDateFromFilterActive = false;
        sessionStorage.removeItem(ORDER_LIST_FILTER_SHIPMENT_DATE_FROM);
      }
    } else {
      console.error('Failed to find input: shipmentDateFrom');
    }
    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  protected selectShipmentDateTo(event: any): void {
    const shipmentDateTo = this.filterForm.get(SHIPMENT_DATE_TO);
    if (shipmentDateTo) {
      if (shipmentDateTo.value) {
        this.shipmentDateToFilterActive = true;
        sessionStorage.setItem(ORDER_LIST_FILTER_SHIPMENT_DATE_TO, shipmentDateTo.value);
      } else {
        this.shipmentDateToFilterActive = false;
        sessionStorage.removeItem(ORDER_LIST_FILTER_SHIPMENT_DATE_FROM);
      }
    } else {
      console.error('Failed to find input: shipmentDateTo');
    }
    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  /**
   * Used for input date fields to add focus class
   * @param event
   */
  protected onFocus(event: any) {
    event.target.classList.add(FOCUSED);
  }

  /**
   * Used for input date fields to remove focus class
   * @param event
   */
  protected onBlur(event: any) {
    if (!event.target.value) {
      event.target.classList.remove(FOCUSED);
    }
  }

  /**
   * Saves current filtered order list on local machine into csv file
   */
  protected saveFilteredListToCSV(): void {
    const filter: ApiOrdersListRequest = this.updateFilter();
    filter.limit = trainListLimit;
    filter.offset = 0;
    this.loadingInProgress$.next(true);
    this.trainOrderService.sendOrdersListRequest(filter).subscribe({
      next: ( (result: ApiOrdersListResponse) => {
        this.fileExportService.exportOrdersToCsv(result.items);
      }),
      error: (error => {
        console.error('Failed to load data: ', error);
      })
    }).add(() => {
      this.loadingInProgress$.next(false);
    });
  }

  /**
   * Saves complete list of orders without filtering on local machine intro csv file
   */
  protected saveCompleteListToCSV(): void {
    this.downloadInProgress = true;
    this.trainOrderService
      .sendCompleteOrdersListRequest()
      .subscribe({
        next: (result: ApiOrdersListResponse) => {
          this.fileExportService.exportOrdersToCsv(result.items);
          this.downloadInProgress = false;
        },
        error: (error) => {
          this.downloadInProgress = false;
          throw error;
        }
      });
  }

  get orderStatus() {
    return this.filterForm.get(ORDER_STATUS) as FormControl;
  }

  get orderNumber() {
    return this.filterForm.get(ORDER_NUMBER) as FormControl;
  }

  get sendingStation() {
    return this.filterForm.get(SENDING_STATION) as FormControl;
  }

  get sendingStationKeyAlpha() {
      return this.filterForm.get(SENDING_STATION_KEY_ALPHA) as FormControl;
  }

  get sendingStationKeySequence() {
      return this.filterForm.get(SENDING_STATION_KEY_SEQUENCE) as FormControl;
  }

  get receivingStationKeyAlpha() {
      return this.filterForm.get(RECEIVING_STATION_KEY_ALPHA) as FormControl;
  }

  get receivingStationKeySequence() {
      return this.filterForm.get(RECEIVING_STATION_KEY_SEQUENCE) as FormControl;
  }

  get receivingStation() {
      return this.filterForm.get(RECEIVING_STATION) as FormControl;
  }

  get shipmentDateFrom() {
    return this.filterForm.get(SHIPMENT_DATE_FROM) as FormControl;
  }

  get shipmentDateTo() {
    return this.filterForm.get(SHIPMENT_DATE_TO) as FormControl;
  }
}
