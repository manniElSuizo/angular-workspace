import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { CommercialLocation, InfrastructureLocationResponse, StationType } from '@src/app/trainorder/models/location.models';
import { debounceTime } from 'rxjs/operators';
import { StationTypes } from '@src/app/shared/enums/stations.enum';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { AppService } from '@src/app/app.service';
import { trainListLimit } from '@src/app/shared/constants/Constants';
import { OrderTemplateSummary, OrderTemplateSummaryRequest, OrderTemplateSummaryResponse } from '@src/app/trainorder/models/OrderTemplateModels';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';
import { CommercialLocationSummaryPipe } from '@src/app/shared/pipes/commercial-location-summary.pipe';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';
import { CommercialLocationSummary } from '@src/app/order-management/models/general-order';
import { InfrastructureLocationSummaryPipe } from '@src/app/shared/pipes/infrastructure-location-summary.pipe';

const ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_ALPHA = 'order-list-template-filter-sending-station-key-alpha';
const ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE = 'order-list-template-filter-sending-station-key-sequence';
const ORDER_TEMPLATES_LIST_FILTER_SENDER_NAME = 'order-list-template-filter-sender-name';
const ORDER_TEMPLATES_LIST_FILTER_RECEIVER_NAME = 'order-list-template-filter-shipment-receiver-name';
const ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_NAME = 'order-list-template-filter-sending-station-name';
const ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_NAME = 'order-list-template-filter-receiving-station-name';
const ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA = 'order-list-template-filter-receiving-station-key-alpha';
const ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE = 'order-list-template-filter-receiving-station-key-sequence';
const ORDER_TEMPLATES_LIST_FILTER_TEMPLATE_ID = 'order-list-template-filter-template-id';

const SENDER_NAME = 'senderName';
const RECEIVER_NAME = 'receiverName';
const SENDING_STATION = 'sendingStation';
const SENDING_STATION_KEY_ALPHA = 'sendingStationKeyAlpha';
const SENDING_STATION_KEY_SEQUENCE = 'sendingStationKeySequence';
const RECEIVING_STATION = 'receivingStation';
const RECEIVING_STATION_KEY_ALPHA = 'receivingStationKeyAlpha';
const RECEIVING_STATION_KEY_SEQUENCE = 'receivingStationKeySequence';
const FOCUSED = 'focused';
const TEMPLATE_ID = 'templateId';

@Component({
  selector: 'app-order-templates-filter',
  templateUrl: './order-templates-filter.component.html',
  styleUrls: ['./order-templates-filter.component.scss']
})
export class OrderTemplatesFilterComponent implements OnInit, AfterViewInit {
  public showLoadMoreButton$: Subject<boolean> = new Subject();
  public loadingInProgress$: Subject<boolean> = new Subject();
  public maxDate: string;
  public orderTemplatesList: OrderTemplateSummary[];
  public totalOrderTemplates: number;
  public sortConditions: SortConditionsModel = { asc: true, field: TEMPLATE_ID};
  public offset: number = 0;

  protected numberOfOrders: number;
  protected filterForm: FormGroup;
  protected sendingStationsAutocomplete: CommercialLocation[] = [];
  protected receivingStationsAutocomplete: CommercialLocation[] = [];
  protected InfrastructureLocationSummaryPipe: InfrastructureLocationSummaryPipe = inject(InfrastructureLocationSummaryPipe);

  protected autocompleteArray: CommercialLocation[] = [];
  protected commercialLocationSummariesSendingStations: CommercialLocationSummary[] = [];
  protected commercialLocationSummariesReceivingStations: CommercialLocationSummary[] = [];
  private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
  private rfi: boolean = false;
  private customerProfile: CustomerProfile | null | undefined = null;
  private limit: number = 25;
  private senderNameFilterActive: boolean;
  private receiverNameFilterActive: boolean;
  private sendingStationFilterActive: boolean;
  private receivingStationFilterActive: boolean;
  private templateIdFilterActive: boolean;

  constructor(private trainOrderService: TrainorderService, private appService: AppService, private storage: LocalStorageService, private fileExportService: FileExportService) {
    this.orderTemplatesList = [];
    this.createFilterForm();
    this.createMaxDate();
  }

  ngOnInit(): void {
    this.fetchFilterValuesFromSessionStorage();
    this.setActiveProfiles();
    this.fetchOrders(this.updateFilter());
  }

  ngAfterViewInit(): void {
    this.registerForInputChanges();
  }

  public updateOrdersList(): void {
    const filter = this.updateFilter();
    this.fetchOrders(filter);
  }

  private registerForInputChanges(): void {
    this.registerForTemplateIdInputChanges();
    this.registerForSenderInputChanges();
    this.registerForCustomerSelectionChanges();
    this.registerForReceiverNameInputChanges();
  }

  private setActiveProfiles() {
    if(this.storage.getActiveProfiles() != null && this.storage.getActiveProfiles().length > 0) {
      this.customerProfile = this.storage.getActiveProfiles()[0];
    }
  }

  private registerForCustomerSelectionChanges(): void {
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
    });
  }

  private registerForSenderInputChanges(): void {
    this.senderName?.valueChanges.pipe(debounceTime(500)).subscribe(input => {
      if (!input || input.length === 0) {
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDER_NAME);
        this.senderNameFilterActive = false;
      } else {
        sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_SENDER_NAME, input);
        this.senderNameFilterActive = true;
      }
      this.resetList();
      this.fetchOrders(this.updateFilter());
    });
  }

  private registerForReceiverNameInputChanges(): void {
    this.receiverName.valueChanges.pipe(debounceTime(500)).subscribe(input => {
      console.log(input);
      if (!input || input.length === 0) {
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVER_NAME);
        this.receiverNameFilterActive = false;
      } else {
        sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVER_NAME, input);
        this.receiverNameFilterActive = true;
      }
      this.resetList();
      this.fetchOrders(this.updateFilter());
    });
  }

  private registerForTemplateIdInputChanges(): void {
    this.templateId?.valueChanges.pipe(debounceTime(500)).subscribe(input => {
      if (!input || input.length === 0) {
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_TEMPLATE_ID);
        this.templateIdFilterActive = false;
      } else {
        this.templateIdFilterActive = true;
        sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_TEMPLATE_ID, input);
      }
      this.resetList();
      this.fetchOrders(this.updateFilter());
    });
  }

  private fetchFilterValuesFromSessionStorage(): void {
    this.fetchTemplateIdFromSessionStorage();
    this.fetchSenderFromSessionStorage();
    this.fetchReceiverFromSessionStorage();
    this.fetchSendingStationNameFromSessionStorage();
    this.fetchSendingStationKeyAlphaFromSessionStorage();
    this.fetchSendingStationKeySequenceFromSessionStorage();
    this.fetchReceivingStationNameFromSessionStorage();
    this.fetchReceivingStationKeyAlphaFromSessionStorage();
    this.fetchReceivingStationKeySequenceFromSessionStorage();
  }

  private fetchTemplateIdFromSessionStorage(): void {
    const s_templateId = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_TEMPLATE_ID);
    if (s_templateId) {
      const templateIdInput = this.templateId;
      if (templateIdInput) {
        this.templateId.setValue(s_templateId);
        this.updateFilter();
      } else {
        console.error('Failed to find input field: receivingStationKeySequence');
      }
    }
  }

  private fetchReceivingStationKeySequenceFromSessionStorage(): void {
    const s_receivingStationKeySequence = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
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
    if (this.orderTemplatesList && this.totalOrderTemplates > 0 && this.totalOrderTemplates > this.orderTemplatesList.length) {
        this.showLoadMoreButton$.next(true);
    } else {
        this.showLoadMoreButton$.next(false);
    }
  }

  private fetchReceivingStationKeyAlphaFromSessionStorage(): void {
    const s_receivingStationKeyAlpha = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA);
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
    const receivingStationName = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_NAME);
    if (receivingStationName) {
        this.receivingStation.setValue(receivingStationName);
    }
  }

  private fetchSendingStationNameFromSessionStorage(): void {
    const sendingStationName = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_NAME);
    if (sendingStationName) {
        this.sendingStation.setValue(sendingStationName);
    }
  }

  private fetchSendingStationKeyAlphaFromSessionStorage(): void {
    const s_sendingStationKeyAlpha = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_ALPHA);
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
    const s_sendingStationKeySequence = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE);
    if (s_sendingStationKeySequence) {
    const sendingStationKeySequenceInput = this.filterForm.get(SENDING_STATION_KEY_SEQUENCE);
    if (sendingStationKeySequenceInput) {
        sendingStationKeySequenceInput.setValue(s_sendingStationKeySequence);
    } else {
        console.error('Failed to find input field: sendingStationKeySequence');
    }
    }
  }

  private fetchSenderFromSessionStorage(): void {
    const sender = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_SENDER_NAME);
    if (sender) {
      this.senderNameFilterActive = true;
      this.senderName.setValue(sender);
    }
  }

  private fetchReceiverFromSessionStorage(): void {
    const receiver = sessionStorage.getItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVER_NAME);
    if (receiver) {
      this.receiverNameFilterActive = true;
      this.receiverName.setValue(receiver);
    }
  }

  protected onSelectReceivingStation(comLoc: CommercialLocationSummary) {
    let input = '';
    if (comLoc) {
      input = comLoc.name;
    }
    if (input?.length === 0) {
        this.receivingStationsAutocomplete = [];
        this.receivingStationFilterActive = false;
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_NAME);
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA);
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
        this.receivingStationKeyAlpha.setValue('');
        this.receivingStationKeySequence.setValue('');
        this.resetList();
        this.fetchOrders(this.updateFilter());
    } else {
      this.trainOrderService.getOrdersCommercialLocations(input, StationType.DEPARTURE, this.autocompleteArray).subscribe((result: InfrastructureLocationResponse) => {
        this.receivingStationsAutocomplete = this.trainOrderService.createUniqueKeysCommercialOrProductionLocations(result);
        this.rfi = true;
        const item = this.receivingStationsAutocomplete.find(station => { return station.name === input; } );
        if (item) {
          this.receivingStationFilterActive = true;
          sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_NAME, item.name);
          sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA, item.objectKeyAlpha);
          sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE, String(item.objectKeySequence));
          this.receivingStationKeyAlpha.setValue(item.objectKeyAlpha);
          this.receivingStationKeySequence.setValue(item.objectKeySequence);
          this.receivingStationsAutocomplete = [];
          this.resetList();
          this.fetchOrders(this.updateFilter());
        } else {
            this.getAutocompleteSuggestions(input, StationTypes.RECEIVING);
        }
      });
    }
  }

  protected onSelectSendingStation(comLoc: CommercialLocationSummary) {
    let input = '';
    if (comLoc) {
      input = comLoc.name;
    }
    if (input?.length === 0) {
        this.sendingStationsAutocomplete = [];
        this.sendingStationFilterActive = false;
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_NAME);
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_ALPHA);
        sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE);
        this.sendingStationKeyAlpha.setValue('');
        this.sendingStationKeySequence.setValue('');
        this.resetList();
        this.fetchOrders(this.updateFilter());
    } else {
      this.trainOrderService.getOrdersCommercialLocations(input, StationType.DEPARTURE, this.autocompleteArray).subscribe((result: InfrastructureLocationResponse) => {
        this.sendingStationsAutocomplete = this.trainOrderService.createUniqueKeysCommercialOrProductionLocations(result);
        this.rfi = true;
        const item = this.sendingStationsAutocomplete.find(station => { return station.name === input; } );
        if (item) {
          this.sendingStationFilterActive = true;
          sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_NAME, item.name);
          sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_ALPHA, item.objectKeyAlpha);
          sessionStorage.setItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE, String(item.objectKeySequence));
          this.sendingStationKeyAlpha.setValue(item.objectKeyAlpha);
          this.sendingStationKeySequence.setValue(item.objectKeySequence);
          this.sendingStationsAutocomplete = [];
          this.resetList();
          this.fetchOrders(this.updateFilter());
        } else {
            this.getAutocompleteSuggestions(input, StationTypes.SENDING);
        }
      });
    }
  }

  protected loadSendingStations($event: any): void {
    this.railOrderInternalService.getCommercialLocations($event).subscribe({
      next: (clList: CommercialLocationSummary[]) => {
        // Entferne doppelte Einträge basierend auf der locationCode-Eigenschaft
        const uniqueList = clList.filter((item, index, self) =>
          index === self.findIndex((t) => t.locationCode === item.locationCode)
        );
        this.commercialLocationSummariesSendingStations = uniqueList;
      }
    });
  }

  protected loadReceivingStations($event: any): void {
    this.railOrderInternalService.getCommercialLocations($event).subscribe({
      next: (clList: CommercialLocationSummary[]) => {
        // Entferne doppelte Einträge basierend auf der locationCode-Eigenschaft
        const uniqueList = clList.filter((item, index, self) =>
          index === self.findIndex((t) => t.locationCode === item.locationCode)
        );
        this.commercialLocationSummariesReceivingStations = uniqueList;
      }
    });
  }

  private orderTemplatesListServiceSubscription: Subscription = null;

  private fetchOrders(filter: OrderTemplateSummaryRequest): void {
    if(this.orderTemplatesListServiceSubscription) {
      this.orderTemplatesListServiceSubscription.unsubscribe();
    }
    this.loadingInProgress$.next(true);
    this.orderTemplatesListServiceSubscription = this.trainOrderService.sendOrdertemplatesListRequest(filter).subscribe({
      next: ( (result: OrderTemplateSummaryResponse) => {
        this.orderTemplatesList = this.orderTemplatesList.concat(result.items);
        this.limit = result.limit;
        this.offset = result.offset;
        this.numberOfOrders = this.orderTemplatesList?.length;
        this.totalOrderTemplates = result.total;
        this.setLoadMoreButtonState();
      }),
      error: (error => {
        console.error('Failed to load data: ', error);
      })
    });
    this.orderTemplatesListServiceSubscription.add(() => {
      this.loadingInProgress$.next(false);
    });
  }

  private createFilterForm(): void {
    this.filterForm = new FormGroup({
      templateId: new FormControl(''),
      senderName: new FormControl(''),
      receiverName: new FormControl(''),
      sendingStation: new FormControl(''),
      receivingStation: new FormControl(''),
      sendingStationKeyAlpha: new FormControl(''),
      receivingStationKeyAlpha: new FormControl(''),
      sendingStationKeySequence: new FormControl(''),
      receivingStationKeySequence: new FormControl(''),
    })
  }

  public resetList(): void {
    this.orderTemplatesList = [];
    this.offset = 0;
    this.limit = 25;
  }

  private updateFilter(): OrderTemplateSummaryRequest {
    const profiles: CustomerProfile[] = [];
    if (this.customerProfile) {
        profiles.push(this.customerProfile);
    }

    const filter: OrderTemplateSummaryRequest = {
      templateId: this.templateId.value,
      senderName: this.filterForm.value.senderName,
      receiverName: this.filterForm.value.receiverName,
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
    let fieldName = this.sortConditions.field;
    if (fieldName === 'templateId') { fieldName = 'number'; }
    if (this.sortConditions.asc === true) {
        return '+' + fieldName;
    } else {
        return '-' + fieldName;
    }
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
      templateId: '',
      senderName: '',
      receiverName: '',
      sendingStation: '',
      receivingStation: '',
      sendingStationKeyAlpha: '',
      receivingStationKeyAlpha: '',
      sendingStationKeySequence: '',
      receivingStationKeySequence: ''
    });

    sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDER_NAME);
    sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVER_NAME);
    sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE);
    sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_ALPHA);
    sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_NAME);
    sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
    sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA);
    sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_NAME);

    this.senderNameFilterActive = false;
    this.receiverNameFilterActive = false;
    this.sendingStationFilterActive = false;
    this.receivingStationFilterActive = false;
    this.templateIdFilterActive = false;

    this.sendingStationsAutocomplete = [];
    this.receivingStationsAutocomplete = [];

    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  protected activeFilterAmount(): number {
    let activeFilterAmount = 0;
    if (this.senderNameFilterActive) {
      activeFilterAmount++;
    }
    if (this.receiverNameFilterActive) {
        activeFilterAmount++;
    }
    if (this.sendingStationFilterActive) {
      activeFilterAmount++;
    }
    if (this.receivingStationFilterActive) {
      activeFilterAmount++;
    }
    if (this.templateIdFilterActive) {
      activeFilterAmount++;
    }

    return activeFilterAmount;
  }

  protected clearSearchInput(key: string) {
    switch (key) {
        case TEMPLATE_ID:
          this.filterForm.controls[TEMPLATE_ID].setValue('');
          sessionStorage.removeItem(TEMPLATE_ID);
          this.templateIdFilterActive = false;
          break;
        case SENDING_STATION:
          this.filterForm.controls[SENDING_STATION].setValue('');
          this.filterForm.controls[SENDING_STATION_KEY_SEQUENCE].setValue('');
          this.filterForm.controls[SENDING_STATION_KEY_ALPHA].setValue('');
          sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_SEQUENCE);
          sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_KEY_ALPHA);
          sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDING_STATION_NAME);
          this.sendingStationFilterActive = false;
          this.sendingStationsAutocomplete = [];
          break;
        case RECEIVING_STATION:
          this.filterForm.controls[RECEIVING_STATION].setValue('');
          this.filterForm.controls[RECEIVING_STATION_KEY_SEQUENCE].setValue('');
          this.filterForm.controls[RECEIVING_STATION_KEY_ALPHA].setValue('');
          sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
          sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_KEY_ALPHA);
          sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVING_STATION_NAME);
          this.receivingStationFilterActive = false;
          this.receivingStationsAutocomplete = [];
          break;
        case SENDER_NAME:
          this.filterForm.controls[SENDER_NAME].setValue('');
          sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_SENDER_NAME);
          this.senderNameFilterActive = false;
          break;
        case RECEIVER_NAME:
          this.filterForm.controls[RECEIVER_NAME].setValue('');
          sessionStorage.removeItem(ORDER_TEMPLATES_LIST_FILTER_RECEIVER_NAME);
          this.receiverNameFilterActive = false;
          break;
    }
    this.resetList();
    this.fetchOrders(this.updateFilter());
  }

  /**
   * Emits the request to load stations autocomplete suggestions if input length is greater than 2
   * @param input event from the input
   */
  protected getAutocompleteSuggestions(input: any, stationType: string): void {
    this.autocompleteArray = [];
    let apiStationType = StationType.DEPARTURE;
    if (stationType === StationTypes.SENDING) {
      this.autocompleteArray = this.sendingStationsAutocomplete;
    } else if (stationType === StationTypes.RECEIVING) {
      apiStationType = StationType.DESTINATION;
      this.autocompleteArray = this.receivingStationsAutocomplete;
    }
    this.rfi = false;
    this.trainOrderService.getOrdersCommercialLocations(input, apiStationType, this.autocompleteArray).subscribe((result: InfrastructureLocationResponse) => {
      if (stationType === StationTypes.SENDING) {
        this.sendingStationsAutocomplete = this.trainOrderService.createUniqueKeysCommercialOrProductionLocations(result);
        this.rfi = true;
      } else if (stationType === StationTypes.RECEIVING) {
        this.receivingStationsAutocomplete = this.trainOrderService.createUniqueKeysCommercialOrProductionLocations(result);
        this.rfi = true;
      }
      console.log(this.sendingStationsAutocomplete);
    });
  }

  /**
   * Used for input date fields to add focus class
   * @param event
   */
  protected onFocus(event: any) {
    event.target.classList.add(FOCUSED);
  }

  protected onBlur(event: any) {
    if (!event.target.value) {
      event.target.classList.remove(FOCUSED);
    }
  }

  protected saveFilteredListToCSV(): void {
    const filter: OrderTemplateSummaryRequest = this.updateFilter();
    filter.limit = trainListLimit;
    filter.offset = 0;
    this.loadingInProgress$.next(true);
    this.trainOrderService.sendOrdertemplatesListRequest(filter).subscribe({
      next: ( (result: OrderTemplateSummaryResponse) => {
        this.fileExportService.exportOrderTemplatesToCsv(result.items);
      }),
      error: (error => {
        console.error('Failed to load data: ', error);
      })
    }).add(() => {
      this.loadingInProgress$.next(false);
    });
  }

  saveCompleteListToCSV(): void {
    this.trainOrderService
      .sendCompleteOrderTemplatesListRequest()
      .subscribe((result: OrderTemplateSummaryResponse) => {
          this.fileExportService.exportOrderTemplatesToCsv(result.items);
      });
  }

  get templateId() {
    return this.filterForm.get(TEMPLATE_ID) as FormControl;
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

  get senderName() {
    return this.filterForm.get(SENDER_NAME) as FormControl;
  }

  get receiverName() {
    return this.filterForm.get(RECEIVER_NAME) as FormControl;
  }
}
