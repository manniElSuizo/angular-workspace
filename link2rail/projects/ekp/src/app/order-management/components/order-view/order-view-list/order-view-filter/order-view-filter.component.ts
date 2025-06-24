import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { AppService } from '@src/app/app.service';
import { ListFilterBase } from '@src/app/shared/utils/list-filter-base';
import { RailOrderSearchSummary, RailOrderStageForFilter, RailOrderSummaryRequest, RailOrderSummaryRequest4Storage, RailOrderSummaryResponse } from '@src/app/trainorder/models/ApiRailOrder.model';
import { RailOrderSearchService } from '../services/rail-order-search.service.';
import { FormControl, FormGroup } from '@angular/forms';
import { ListViewFilterSessionStorageObjekt } from '@src/app/trainorder/components/list-view/models/list-view.models';
import { StationType } from '@src/app/trainorder/models/location.models';
import { StringUtils } from '@src/app/shared/utils/string-utils';
import moment from 'moment';
import { ListKeyValue, MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import { TranslateService } from '@ngx-translate/core';
import { WagonviewService } from '../../../wagon-view/services/wagonview.service';
import { PartnerRole, PartnerSummary } from '../../../wagon-view/models/api-wagon-list';
import { StorageKeys } from '@src/app/shared/services/storage/storage.service.base';
import { formatDate } from '@angular/common';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { RailOrderStatus } from '@src/app/order-management/models/general-order';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NewOrderService } from '../../../new-order/service/new-order.service';
import { LocationRequest, TemplateSummary } from '../../../../models/rail-order-api';
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';
import { debounceTime, map, Subject, switchMap } from 'rxjs';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';
import { CommercialLocationSummary } from '@src/app/order-management/models/om-internal-api';
import { countryFormat, countryFormatNameCode } from '@src/app/shared/constants/Constants';
import { LocationNameOutputFormat, LocationNamePipe } from '@src/app/shared/pipes/location-name.pipe';
import { CommercialLocationSummaryPipe } from '@src/app/shared/pipes/commercial-location-summary.pipe';

@Component({
  selector: 'app-order-view-filter',
  templateUrl: './order-view-filter.component.html',
  styleUrl: './order-view-filter.component.scss'
})
export class OrderViewFilterComponent extends ListFilterBase implements OnInit, AfterViewInit {

  @ViewChild('msss') multiselectSendingStation: MultiselectAutocompleteComponent;
  @ViewChild('msrs') multiselectReceivingStation: MultiselectAutocompleteComponent;
  @ViewChild('msconsigner') multiselectConsignor: MultiselectAutocompleteComponent;
  @ViewChild('msconsignee') multiselectConsignee: MultiselectAutocompleteComponent;
  @ViewChild('msrailorderstatus') multiselectRailOrderStatus: MultiselectAutocompleteComponent;
  @ViewChild('msrailorderstage') multiselectRailOrderStage: MultiselectAutocompleteComponent;
  @ViewChild('msordertemplatenames') multiselectOrderTemplateNumbers: MultiselectAutocompleteComponent;
  @ViewChild('mssendingstationcountrycode') multiselectsetSendingStationCountryCode: MultiselectAutocompleteComponent;
  @ViewChild('msreceivingstationcountrycode') multiselectReceivingStationCountryCode: MultiselectAutocompleteComponent;
  public railOrders: RailOrderSearchSummary[] = [];

  protected multiselectAutocompleteParametersReceiving: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersSending: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersConsignor: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersConsignee: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersRailOrderStatus: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersRailOrderStage: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersOrderTemplateNumbers: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersSendingStationCountryCode: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersReceivingStationCountryCode: MultiselectAutocompleteParameters;
  protected isLoading: Subject<boolean> = new Subject<boolean>();

  private receivingStationSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private sendingStationSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private consignorSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private consigneeSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private availableOrderTemplatesSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private availableSenderIsoCountryCodesSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private availableDeliveryIsoCountryCodesSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();

  protected totalNumberOfOrders: number = 0;
  protected filterForm: FormGroup;
  protected sessionStorageObjekt: ListViewFilterSessionStorageObjekt = {} as ListViewFilterSessionStorageObjekt;

  private availableRailorderStatus: ListKeyValue[] = [];
  private availableRailOrderTypes: ListKeyValue[] = [];
  private availableOrderTemplateNumbers: ListKeyValue[] = [];
  private allAvailableOrderTemplateNumbers: ListKeyValue[] = [];
  private availableSenderIsoCountryCodes: ListKeyValue[] = [];
  private availableDeliveryIsoCountryCodes: ListKeyValue[] = [];
  private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);
  private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
  private debounceTimeValue: number = 500;

  constructor(appService: AppService,
    private wagonviewService: WagonviewService,
    private railOrderSearchService: RailOrderSearchService,
    private newOrderService: NewOrderService,
    private translate: TranslateService,
    private fileExportService: FileExportService,
    private locationNamePipe  : LocationNamePipe
  ) {
    super(appService, StorageKeys.ORDER_VIEW_FILTER_STORAGE_KEY);
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.addFilterPropertiesToBeIgnored([]);
    const railOrderSummaryRequest: RailOrderSummaryRequest = {
      orderNumber: '',
      shippingDateFrom: '',
      shippingDateTo: '',
      railOrderStatus: [],
      railOrderStages: new Array<RailOrderStageForFilter>(),
      dangerousGoodsTransport: false,
      orderTemplateNumbers: [],
      sendingStations: [],
      receivingStations: [],
      wagonNumber: '',
      reference:'',
      sendingStationCountryCodes:[],
      receivingStationCountryCodes:[],
      consignorProfiles: [],
      consigneeProfiles: [],
      offset: 0,
      sort: null,
      limit: ListFilterBase.DEFAULT_LIMIT
    };
    this.request = railOrderSummaryRequest;

    this.setMultiselectParamsSendingStation();
    this.setMultiselectParamsReceivingStation();
    this.setMultiselectParamsConsignor();
    this.setMultiselectParamsConsignee();
    this.setMultiselectParamsRailOrderStatus();
    this.setMultiselectParamsRailOrderStage();
    this.setMultiselectParamsOrderTemplateNumbers();
    this.setMultiselectParamsSendingStationCountryCode();
    this.setMultiselectParamsReceivingStationCountryCode();
    this.setupSearchSubjects();

  }

  ngAfterViewInit(): void {
    this.restoreFilterFromStorage();
    this.setStorageValuesInForm();
    this.setInitialShippingDateFrom();
    this.storageToRequest();
    this.isLoading.next(true);
    this.fetchData();
    this.isLoading.next(false);
    this.createAvailableRailOrderStages();
    this.registerOnOrderTemplateDeletedEvent();
    this.registerOnReceiveSelectedOrderTemplates();
  }

  private registerOnReceiveSelectedOrderTemplates(): void {
    this.multiselectOrderTemplateNumbers.formFieldSelectionEmitter.subscribe(result => {
    });
  }

  private setInitialShippingDateFrom(): void {
    const nowMinusSixDays = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
    nowMinusSixDays.setHours(0, 0, 0, 0);
    let shippingDateFrom = (this.request4Storage as RailOrderSummaryRequest4Storage)?.shippingDateFrom ? formatDate((this.request4Storage as RailOrderSummaryRequest4Storage)?.shippingDateFrom, 'yyyy-MM-dd', 'de') : null;
    if (!shippingDateFrom) {
      shippingDateFrom = formatDate(nowMinusSixDays, 'yyyy-MM-dd', 'de');
    }
    this.shippingDateFrom.setValue(shippingDateFrom);
  }

  protected multiselectChangeEventListener($event: any) {
    this.onChangeFilter($event);
  }

  private setupSearchSubjects() {
    this.receivingStationSearchSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput, array }) =>
        this.railOrderInternalService.getRailOrdersCommercialLocations(searchInput, StationType.DESTINATION).pipe(
          map(locations => ({ locations, array }))
        )
      )
    ).subscribe({
      next: ({ locations, array }) => {
        const resultList: ListKeyValue[] = [...array];
        this.prepareDataListForMultiselect(resultList, locations);
        this.multiselectReceivingStation.dataList = resultList;
      }
    });

    this.sendingStationSearchSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput, array }) =>
        this.railOrderInternalService.getRailOrdersCommercialLocations(searchInput, StationType.DEPARTURE).pipe(
          map(locations => ({ locations, array }))
        )
      )
    ).subscribe({
      next: ({ locations, array }) => {
        const resultList: ListKeyValue[] = [...array];
        this.prepareDataListForMultiselect(resultList, locations);
        this.multiselectSendingStation.dataList = resultList;
      }
    });

    this.consignorSearchSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput, array }) =>
        this.wagonviewService.getRailOrdersPartners(searchInput, PartnerRole.CONSIGNOR).pipe(
          map(partners => ({ partners, array }))
        )
      )
    ).subscribe({
      next: ({ partners, array }) => {
        const resultList: ListKeyValue[] = [...array];
        partners.forEach(partner => {
          const partnerKey = JSON.stringify({ partnerId: partner.partnerId, sgvId: partner.sgvId });
          const found = resultList.find(kv => kv.key == partnerKey && kv.value == partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")");
          if (!found) {
            resultList.push({ key: partnerKey, value: partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")" });
          }
        });
        this.multiselectConsignor.dataList = resultList;
      }
    });

    this.consigneeSearchSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput, array }) =>
        this.wagonviewService.getRailOrdersPartners(searchInput, PartnerRole.CONSIGNEE).pipe(
          map(partners => ({ partners, array }))
        )
      )
    ).subscribe({
      next: ({ partners, array }) => {
        const resultList: ListKeyValue[] = [...array];
        partners.forEach(partner => {
          const partnerKey = JSON.stringify({ partnerId: partner.partnerId, sgvId: partner.sgvId });
          const found = resultList.find(kv => kv.key == partnerKey && kv.value == partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")");
          if (!found) {
            resultList.push({ key: partnerKey, value: partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")" });
          }
        });
        this.multiselectConsignee.dataList = resultList;
      }
    });
    this.availableSenderIsoCountryCodesSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput, array }) =>
        this.railOrderInternalService.getRailOrdersCountryCodes(searchInput, StationType.DEPARTURE).pipe(
          map(countries => ({ countries, array }))
        )
      )
    ).subscribe({
      next: ({ countries, array }) => {
        const resultList: ListKeyValue[] = [...array];
        countries.forEach(country => {
          const found = resultList.find(kv => kv.key == country.countryCode);
          if (!found) {
            resultList.push({ key: country.countryCode, value: country.description });
          }
        });
        this.multiselectsetSendingStationCountryCode.dataList = resultList;
      }
    });

    this.availableDeliveryIsoCountryCodesSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput, array }) =>
        this.railOrderInternalService.getRailOrdersCountryCodes(searchInput, StationType.DESTINATION).pipe(
          map(countries => ({ countries, array }))
        )
      )
    ).subscribe({
      next: ({ countries, array }) => {
        const resultList: ListKeyValue[] = [...array];
        countries.forEach(country => {
          const found = resultList.find(kv => kv.key == country.countryCode);
          if (!found) {
            resultList.push({ key: country.countryCode, value: country.description });
          }
        });
        this.multiselectReceivingStationCountryCode.dataList = resultList;
      }
    });

    this.availableOrderTemplatesSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput }) =>
        this.newOrderService.getRailOrderTemplatesByQuery(searchInput)
      )
    ).subscribe({
      next: (result: TemplateSummary[]) => {
        this.availableOrderTemplateNumbers = [];
        for (let item of result) {
          const listKeyValueItem: ListKeyValue = {
            key: item.templateNumber,
            value: "(" + item.templateNumber + ") " + item.templateName
          };
          this.availableOrderTemplateNumbers.push(listKeyValueItem);
        }
        this.availableOrderTemplateNumbers = this.availableOrderTemplateNumbers.sort((a, b) => (a.value > b.value ? 1 : -1));
        this.multiselectOrderTemplateNumbers.dataList = this.availableOrderTemplateNumbers;
      }
    });

  }

  private setMultiselectParamsConsignor() {
    this.multiselectAutocompleteParametersConsignor = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-list.consignorName'),
        labelText: this.translate.instant('Order-Management.order-view-list.consignorName'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "consignor",
      fieldId: "consignor",
      divId: "consignorDiv",
      formControlName: "consignor",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.consignorSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderSummaryRequest4Storage).consignorProfilesStorage ? (this.request4Storage as RailOrderSummaryRequest4Storage).consignorProfilesStorage : []
    };
  }

  protected afterCountActiveFilter(): void {
    let dangerous: boolean;
    let stages: boolean;
    Object.keys(this.request).forEach(key => {
      if (key === 'dangerousGoodsTransport') {
        if (this.request[key] === false) {
          this.activeFilterCount--;
        } else {
          dangerous = true;
        }
      }
      if (key === 'railOrderStage') {
        if (this.request[key]?.length > 0) {
          stages = true;
        }
      }
    });
    if (dangerous && stages) {
      this.activeFilterCount--;
    }
  }

  private setMultiselectParamsConsignee() {
    this.multiselectAutocompleteParametersConsignee = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-list.consigneeName'),
        labelText: this.translate.instant('Order-Management.order-view-list.consigneeName'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "consignee",
      fieldId: "consignee",
      divId: "consigneeDiv",
      formControlName: "consignee",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.consigneeSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderSummaryRequest4Storage).consigneeProfilesStorage ? (this.request4Storage as RailOrderSummaryRequest4Storage).consigneeProfilesStorage : []
    };
  }

  private setMultiselectParamsRailOrderStage(): void {
    this.multiselectAutocompleteParametersRailOrderStage = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-list.railorderstage'),
        labelText: this.translate.instant('Order-Management.order-view-list.railorderstage'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "railorderstagename",
      fieldId: "railorderstageid",
      divId: "railorderstagediv",
      formControlName: "railOrderStages",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => { },

      selectedItems: this.availableRailOrderTypes ? this.availableRailOrderTypes : []
    };
  }

  private setMultiselectParamsSendingStationCountryCode(): void {
    this.multiselectAutocompleteParametersSendingStationCountryCode = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-filter.senderIsoCountryCode'),
        labelText: this.translate.instant('Order-Management.order-view-filter.senderIsoCountryCode'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "senderisocountrycodesname",
      fieldId: "senderisocountrycodesid",
      divId: "senderisocountrycodesdiv",
      formControlName: "SenderIsoCountryCodes",
      minQueryLength: 3,

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {

        this.availableSenderIsoCountryCodesSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationsStorage ? (this.request4Storage as RailOrderSummaryRequest4Storage).sendingStationCountryCodesStorage : [],
    };
  }

  private setMultiselectParamsReceivingStationCountryCode(): void {
    this.multiselectAutocompleteParametersReceivingStationCountryCode = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-filter.deliveryIsoCountryCode'),
        labelText: this.translate.instant('Order-Management.order-view-filter.deliveryIsoCountryCode'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "deliveryisocountrycodesname",
      fieldId: "deliveryisocountrycodesid",
      divId: "deliveryisocountrycodesdiv",
      formControlName: "DeliveryIsoCountryCodes",
      minQueryLength: 3,

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {

        this.availableDeliveryIsoCountryCodesSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationsStorage ? (this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationCountryCodesStorage : [],
    };
  }

  private setMultiselectParamsOrderTemplateNumbers(): void {
    this.multiselectAutocompleteParametersOrderTemplateNumbers = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-list.template-name'),
        labelText: this.translate.instant('Order-Management.order-view-list.template-name'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "ordertemplatenamesname",
      fieldId: "ordertemplatenamesid",
      divId: "ordertemplatenamesdiv",
      formControlName: "orderTemplateNames",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {

        this.availableOrderTemplatesSubject.next({ searchInput, array });
      },
      selectedItems: this.availableOrderTemplateNumbers ? this.availableOrderTemplateNumbers : []
    };
  }

  private setMultiselectParamsRailOrderStatus(): void {
    this.multiselectAutocompleteParametersRailOrderStatus = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-list.order-state'),
        labelText: this.translate.instant('Order-Management.order-view-list.order-state'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "railorderstatusname",
      fieldId: "railorderstatusid",
      divId: "railorderstatusdiv",
      formControlName: "railOrderStatus",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.getRailOrderStatusSuggestions();
      },
      selectedItems: this.availableRailorderStatus ? this.availableRailorderStatus : []
    };
  }

  private setMultiselectParamsReceivingStation(): void {
    this.multiselectAutocompleteParametersReceiving = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-list.receivingStation'),
        labelText: this.translate.instant('Order-Management.order-view-list.receivingStation'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "receivingStation",
      fieldId: "receivingStation",
      divId: "receivingStationDiv",
      formControlName: "receivingStation",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.receivingStationSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationsStorage ? (this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationsStorage : []
    };
  }

  private setMultiselectParamsSendingStation(): void {
    this.multiselectAutocompleteParametersSending = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.order-view-list.sendingStation'),
        labelText: this.translate.instant('Order-Management.order-view-list.sendingStation'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Order-Management.order-view-list.search'),
        noDataAvailablePlaceholderText: this.translate.instant('Order-Management.order-view-filter.noDataAvailablePlaceholderText')
      },
      fieldName: "sendingStation",
      fieldId: "sendingStation",
      divId: "sendingStationDiv",
      formControlName: "sendingStation",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.sendingStationSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderSummaryRequest4Storage).sendingStationsStorage ? (this.request4Storage as RailOrderSummaryRequest4Storage).sendingStationsStorage : []
    };
  }

  private getRailOrderStatusSuggestions(): void {
    this.multiselectRailOrderStatus.dataList = this.availableRailorderStatus;
  }

  private getOrderTemplateNamesSuggestions(): void {
    this.multiselectOrderTemplateNumbers.dataList = this.availableOrderTemplateNumbers;
  }
  private getSendingStationCountryCodeSuggestions(): void {
    this.multiselectsetSendingStationCountryCode.dataList = this.availableSenderIsoCountryCodes;
  }

  private getReceivingStationCountryCodeSuggestions(): void {
    this.multiselectReceivingStationCountryCode.dataList = this.availableDeliveryIsoCountryCodes;
  }

  private getConsignorSuggestions(searchInput: string, array: ListKeyValue[]) {
    if(searchInput) {
      this.wagonviewService.getRailOrdersPartners(searchInput, PartnerRole.CONSIGNOR).subscribe({
        next: (partners: PartnerSummary[]) => {
          const resultList: ListKeyValue[] = [...array];
          partners.forEach(partner => {
            const partnerKey = JSON.stringify({ partnerId: partner.partnerId, sgvId: partner.sgvId });
            const found = resultList.find(kv => kv.key == partnerKey && kv.value == partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")");
            if (!found) {
              resultList.push({ key: partnerKey, value: partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")" });
            }
          });
          this.multiselectConsignor.dataList = resultList;
          return resultList;
        }
      });
    }
  }

  private getConsigneeSuggestions(searchInput: string, array: ListKeyValue[]) {
    if(searchInput) {
      this.wagonviewService.getRailOrdersPartners(searchInput, PartnerRole.CONSIGNEE).subscribe({
        next: (partners: PartnerSummary[]) => {
          const resultList: ListKeyValue[] = [...array];
          partners.forEach(partner => {
            const partnerKey = JSON.stringify({ partnerId: partner.partnerId, sgvId: partner.sgvId });
            const found = resultList.find(kv => kv.key == partnerKey && kv.value == partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")");
            if (!found) {
              resultList.push({ key: partnerKey, value: partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")" });
            }
          });
          this.multiselectConsignee.dataList = resultList;
          return resultList;
        }
      });
    }
  }

  private getSendingStationSuggestions(searchInput: string, array: ListKeyValue[]) {
    if(searchInput) {
      this.railOrderInternalService.getRailOrdersCommercialLocations(searchInput, StationType.DEPARTURE).subscribe({
        next: (locations: CommercialLocationSummary[]) => {
          const resultList: ListKeyValue[] = [...array];
          this.prepareDataListForMultiselect(resultList, locations);
          this.multiselectSendingStation.dataList = resultList;
          return resultList;
        }
      });
    }
  }

  private getReceivingStationSuggestions(searchInput: string, array: ListKeyValue[]) {
    if(searchInput) {
      this.railOrderInternalService.getRailOrdersCommercialLocations(searchInput, StationType.DESTINATION).subscribe({
        next: (locations: CommercialLocationSummary[]) => {
          const resultList: ListKeyValue[] = [...array];
          this.prepareDataListForMultiselect(resultList, locations);
          this.multiselectReceivingStation.dataList = resultList;
          return resultList;
        }
      });
    }
  }

  private prepareDataListForMultiselect(resultList: ListKeyValue[], locations: CommercialLocationSummary[]): void {
    locations.forEach((location) => {
      const key = JSON.stringify({
        locationCode: location.locationCode,
        authority: location.authority
      });

      // Skip if this key already exists
      if (resultList.some(kv => kv.key === key)) {
        return;
      }

      // Create a new ListKeyValue object
      const listKeyValue: ListKeyValue = { key };

      // Use the pipe to build formatted location name
      listKeyValue.value = this.locationNamePipe.transform(
        location,
        LocationNameOutputFormat.NameCode
      );

      resultList.push(listKeyValue);
    });
  }



  protected createFilterForm(): void {
    this.filterForm = new FormGroup({
      wagonNumber: new FormControl(''),
      reference: new FormControl(''),
      shippingDateFrom: new FormControl(''),
      shippingDateTo: new FormControl(''),
      //sendingStation: new FormControl(''),
      //receivingStation: new FormControl(''),
      zabOrderNumber: new FormControl(''),
      railOrderStatus: new FormControl(''),
      orderTemplateNames: new FormControl(''),
      consignerName: new FormControl(''),
      consigneeName: new FormControl(''),
      railOrderStages: new FormControl(''),
      dangerousGoodsTransport: new FormControl('')
    });
  }

  protected setStorageValuesInForm(): void {
    this.wagonNumber.setValue((this.request4Storage as RailOrderSummaryRequest4Storage)?.wagonNumber);
    this.reference.setValue((this.request4Storage as RailOrderSummaryRequest4Storage)?.reference);
    this.shippingDateTo.setValue((this.request4Storage as RailOrderSummaryRequest4Storage)?.shippingDateTo ? formatDate((this.request4Storage as RailOrderSummaryRequest4Storage)?.shippingDateTo, 'yyyy-MM-dd', 'de') : null);
    this.zabOrderNumber.setValue((this.request4Storage as RailOrderSummaryRequest4Storage)?.orderNumber);
    this.setSendingStationsFromStorage();
    this.setReceivingStationsFromStorage();
    this.setRailOrderStatusFromStorage();
    this.setRailOrderStageFromStorage();
    this.setConsignorFromStorage();
    this.setConsigneeFromStorage();
    this.setOrderTemplateNamesFromStorage();
    this.setSendingStationCountryCodeFromStorage();
    this.setReceivingStationCountryCodeFromStorage();
  }

  private setConsigneeFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderSummaryRequest4Storage).consigneeProfilesCode);
    if (valuesFromStorage) {
      const listKeyValues: ListKeyValue[] = [];
      for (let item of valuesFromStorage) {
        const customerProfile: CustomerProfile = JSON.parse(item.key);
        const consigneeName: string = item.value;
        const listKeyValue: ListKeyValue = {
          key: '{"partnerId":"' + customerProfile.partnerId + '","sgvId":"' + customerProfile.sgvId + '"}',
          value: consigneeName
        }
        listKeyValues.push(listKeyValue);
      }
      this.multiselectConsigneeControl.setValue(listKeyValues);
    }
    this.getConsigneeSuggestions((this.request4Storage as RailOrderSummaryRequest4Storage).consigneeSearchInput, []);
  }

  private setConsignorFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderSummaryRequest4Storage).consignorProfilesCode);
    if (valuesFromStorage) {
      const listKeyValues: ListKeyValue[] = [];
      for (let item of valuesFromStorage) {
        const customerProfile: CustomerProfile = JSON.parse(item.key);
        const consignorName: string = item.value;
        const listKeyValue: ListKeyValue = {
          key: '{"partnerId":"' + customerProfile.partnerId + '","sgvId":"' + customerProfile.sgvId + '"}',
          value: consignorName
        }
        listKeyValues.push(listKeyValue);
      }
      this.multiselectConsignorControl.setValue(listKeyValues);
    }
    this.getConsignorSuggestions((this.request4Storage as RailOrderSummaryRequest4Storage).consignorSearchInput, []);
  }

  private setReceivingStationsFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationsCode);
    if (valuesFromStorage) {
      const listKeyValues: ListKeyValue[] = [];
      for (let item of valuesFromStorage) {
        const locationRequest: LocationRequest = JSON.parse(item.key);
        const stationname: string = item.value;
        const listKeyValue: ListKeyValue = {
          key: '{"authority":' + locationRequest.authority + ',"locationCode":"' + locationRequest.locationCode + '"}',
          value: stationname
        }
        listKeyValues.push(listKeyValue);
      }
      this.multiselectReceivingStationControl.setValue(listKeyValues);
    }
    this.getReceivingStationSuggestions((this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationsSearchInput, []);
  }

  private setSendingStationsFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderSummaryRequest4Storage).sendingStationsCode);
    if (valuesFromStorage) {
      const listKeyValues: ListKeyValue[] = [];
      for (let item of valuesFromStorage) {
        const locationRequest: LocationRequest = JSON.parse(item.key);
        const stationname: string = item.value;
        const listKeyValue: ListKeyValue = {
          key: '{"authority":' + locationRequest.authority + ',"locationCode":"' + locationRequest.locationCode + '"}',
          value: stationname
        }
        listKeyValues.push(listKeyValue);
      }
      this.multiselectSendingStationControl.setValue(listKeyValues);
    }
    this.getSendingStationSuggestions((this.request4Storage as RailOrderSummaryRequest4Storage).sendingStationsSearchInput, []);
  }

  private translateRailOrderStages(status: string): string {
    switch (status) {
      case 'TRANSPORT_ORDER': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-stage.TRANSPORT_ORDER');
      }
      case 'BOOKING': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-stage.BOOKING');
      }
      case 'ALL': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-stage.ALL');
      }
      case 'DRAFT': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-stage.DRAFT');
      }
      case 'DANGEROUS_GOODS': {
        return this.translate.instant('Order-Management.order-view-filter.rail-order-stage.DANGEROUS_GOODS');
      }
    }
    return 'UNKNOWN';
  }

  private translateRailOrderStatus(status: string): string {
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
    return 'UNKNOWN';
  }

  private setRailOrderStatusOptions(): void {
    this.multiselectRailOrderStatus.dataList = [];
    for (const item of this.availableRailorderStatus) {
      const listKeyValue: ListKeyValue = {
        key: item.key,
        value: this.translateRailOrderStatus(item.key)
      }
      this.multiselectRailOrderStatus.dataList.push(listKeyValue);
    }
    this.multiselectRailOrderStatus.dataList = this.multiselectRailOrderStatus.dataList.sort((a, b) => (a.value > b.value ? 1 : -1));
  }

  private setRailOrderStatusFromStorage(): void {
    const valuesFromStorage = (this.request4Storage as RailOrderSummaryRequest4Storage)?.railOrderStatus ?? null;
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
      for (const item of valuesFromStorage) {
        const listKeyValue: ListKeyValue = {
          key: item,
          value: this.translateRailOrderStatus(item)
        };
        listKeyValues.push(listKeyValue);
      }
      if (valuesFromStorage) {
        this.multiselectRailOrderStatusControl.setValue(listKeyValues);
      }
    }
    this.getRailOrderStatusSuggestions();
  }

  private setRailOrderStageFromStorage(): void {
    const valuesFromStorage = (this.request4Storage as RailOrderSummaryRequest4Storage)?.railOrderStageList ?? null;
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
      for (const item of valuesFromStorage) {
        const listKeyValue: ListKeyValue = {
          key: item,
          value: this.translateRailOrderStages(item)
        };
        listKeyValues.push(listKeyValue);
      }

      this.multiselectRailOrderStageControl.setValue(listKeyValues);
    }
    this.getRailOrderStatusSuggestions();
  }

  private setOrderTemplateNamesFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderSummaryRequest4Storage).orderTemplateNumbers);
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
      for (const item of valuesFromStorage) {
        const listKeyValue: ListKeyValue = {
          key: item,
          value: item
        };
        listKeyValues.push(listKeyValue);
      }
      if (valuesFromStorage) {
        this.multiselectOrderTemplateNamesControl.setValue(listKeyValues);
      }
    }
    this.getOrderTemplateNamesSuggestions();
  }
  private setSendingStationCountryCodeFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderSummaryRequest4Storage).sendingStationCountryCodesStorage);
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
      for (const item of valuesFromStorage) {
        const listKeyValue: ListKeyValue = {
          key: item.key,
          value: item.value
        };
        listKeyValues.push(listKeyValue);
      }
      if (valuesFromStorage) {
        this.multiselectSendingStationCountryCodeControl.setValue(listKeyValues);
      }
    }
    this.getSendingStationCountryCodeSuggestions();
  }
  private setReceivingStationCountryCodeFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationCountryCodesStorage);
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
      for (const item of valuesFromStorage) {
        const listKeyValue: ListKeyValue = {
          key: item.key,
          value: item.value
        };
        listKeyValues.push(listKeyValue);
      }
      if (valuesFromStorage) {
        this.multiselectReceivingStationCountryCodeControl.setValue(listKeyValues);
      }
    }
    this.getReceivingStationCountryCodeSuggestions();
  }
  private getSelectedReceivingStations(): LocationRequest[] {
    const result: LocationRequest[] = [];
    if (this.multiselectReceivingStationControl) {
      const codes4Storage = this.multiselectReceivingStationControl.value as Array<ListKeyValue>;
      if (codes4Storage.length > 0) {
        for (const item of codes4Storage) {
          const locationRequest: LocationRequest = JSON.parse(item.key);
          result.push(locationRequest);
        }
      }
    }
    return result;
  }

  private getSelectedConsignors(): CustomerProfile[] {
    const result: CustomerProfile[] = [];
    if (this.multiselectConsignorControl) {
      const codes4Storage = this.multiselectConsignorControl.value as Array<ListKeyValue>;
      for (const item of codes4Storage) {
        const customerProfile: CustomerProfile = JSON.parse(item.key);
        result.push(customerProfile);
      }
    }
    return result;
  }

  private getSelectedConsignees(): CustomerProfile[] {
    const result: CustomerProfile[] = [];
    if (this.multiselectConsigneeControl) {
      const codes4Storage = this.multiselectConsigneeControl.value as Array<ListKeyValue>;
      for (const item of codes4Storage) {
        const customerProfile: CustomerProfile = JSON.parse(item.key);
        result.push(customerProfile);
      }
    }
    return result;
  }

  private getSelectedSendingStations(): LocationRequest[] {
    const result: LocationRequest[] = [];
    if (this.multiselectSendingStationControl) {
      const codes4Storage = this.multiselectSendingStationControl.value as Array<ListKeyValue>;
      if (codes4Storage.length > 0) {
        for (const item of codes4Storage) {
          const locationRequest: LocationRequest = JSON.parse(item.key);
          result.push(locationRequest);
        }
      }
    }
    return result;
  }

  private getSendingStationsCode(): Array<ListKeyValue> {
    if (this.multiselectSendingStationControl) {
      return this.multiselectSendingStationControl.value as Array<ListKeyValue>;
    }
    return [];
  }

  private getSelectedConsignorProfilesCode(): Array<ListKeyValue> {
    if (this.multiselectConsignorControl) {
      return this.multiselectConsignorControl.value as Array<ListKeyValue>;
    }
    return [];
  }

  private getSelectedConsigneeProfilesCode(): Array<ListKeyValue> {
    if (this.multiselectConsigneeControl) {
      return this.multiselectConsigneeControl.value as Array<ListKeyValue>;
    }
    return [];
  }
  private getSelectedSendingStationCountryCode(): Array<ListKeyValue> {
    if (this.multiselectSendingStationCountryCodeControl) {
      return this.multiselectSendingStationCountryCodeControl.value as Array<ListKeyValue>;
    }
    return [];
  }

  private getSelectedSendingCountryCodeKeys(): Array<string> {
    // Ensure value is defined and is an array
    if (Array.isArray(this.multiselectSendingStationCountryCodeControl?.value)) {
      const listKeyValues = this.multiselectSendingStationCountryCodeControl.value as Array<ListKeyValue>;
      return listKeyValues.map(item => item.key);
    }
    // If value is not an array or is undefined, return an empty array
    return [];
  }

  private getReceivingStationCountryCode(): Array<ListKeyValue> {
    if (this.multiselectReceivingStationCountryCodeControl) {
      return this.multiselectReceivingStationCountryCodeControl.value as Array<ListKeyValue>;
    }
    return [];
  }
  private getSelectedReceivingStationCountryCodeKeys(): Array<string> {
    // Ensure value is defined and is an array
    if (Array.isArray(this.multiselectReceivingStationCountryCodeControl?.value)) {
      const listKeyValues = this.multiselectReceivingStationCountryCodeControl.value as Array<ListKeyValue>;
      return listKeyValues.map(item => item.key);
    }
    // If value is not an array or is undefined, return an empty array
    return [];
  }

  private getReceivingStationsCode(): Array<ListKeyValue> {
    if (this.multiselectReceivingStationControl) {
      return this.multiselectReceivingStationControl.value as Array<ListKeyValue>;
    }
    return [];
  }

  private getSelectedRailOrderStatus(): RailOrderStatus[] {
    const result: RailOrderStatus[] = [];
    if (this.multiselectRailOrderStatusControl) {
      const codes4Storage = this.multiselectRailOrderStatusControl.value as Array<ListKeyValue>;
      for (const item of codes4Storage) {
        const railOrderStatus: RailOrderStatus = item.key as RailOrderStatus;
        result.push(railOrderStatus);
      }
    }
    return result;
  }

  protected afterStorageToRequest(): void {
    let booking = false;
    let transport = false;
    let draft = false;
    (this.request as RailOrderSummaryRequest).dangerousGoodsTransport = false;

    const cleanedWagonNumber = (this.request as RailOrderSummaryRequest).wagonNumber
      ? (this.request as RailOrderSummaryRequest).wagonNumber.replace(/\D/g, '')
      : null;
    if (cleanedWagonNumber && cleanedWagonNumber.length > 0) {
      (this.request as RailOrderSummaryRequest).wagonNumber = cleanedWagonNumber;
    } else {
      (this.request as RailOrderSummaryRequest).wagonNumber = null;
    }

    const cleanedReference = (this.request as RailOrderSummaryRequest).reference
      ? (this.request as RailOrderSummaryRequest).reference.trim()
      : null;
    (this.request as RailOrderSummaryRequest).reference = cleanedReference && cleanedReference.length > 0
      ? cleanedReference
      : null;

    let cleanedOrderNumber = (this.request as RailOrderSummaryRequest).orderNumber
      ? (this.request as RailOrderSummaryRequest).orderNumber.replace(/\D/g, '')
      : null;

    if (cleanedOrderNumber?.startsWith('80')) {
      cleanedOrderNumber = cleanedOrderNumber.substring(2);
    }
    if (cleanedOrderNumber && cleanedOrderNumber.length > 0) {
      (this.request as RailOrderSummaryRequest).orderNumber = cleanedOrderNumber;
    } else {
      (this.request as RailOrderSummaryRequest).orderNumber = null;
    }


    if ((this.request4Storage as RailOrderSummaryRequest4Storage)?.railOrderStageList) {

      for (let item of (this.request4Storage as RailOrderSummaryRequest4Storage)?.railOrderStageList) {
        switch (item) {
          case RailOrderStageForFilter.BOOKING: {
            booking = true;
          } break;
          case RailOrderStageForFilter.TRANSPORT_ORDER: {
            transport = true;
          } break;
          case RailOrderStageForFilter.DRAFT: {
            draft = true;
          } break;
          case RailOrderStageForFilter.DANGEROUS_GOODS: {
            (this.request as RailOrderSummaryRequest).dangerousGoodsTransport = true;
          } break;
        }
      }
    }

      (this.request as RailOrderSummaryRequest).railOrderStages = [];

    if (draft) {
      (this.request as RailOrderSummaryRequest).railOrderStages?.push(RailOrderStageForFilter.DRAFT);
    }
     if (booking) {
      (this.request as RailOrderSummaryRequest).railOrderStages?.push(RailOrderStageForFilter.BOOKING);
    }
     if (transport) {
      (this.request as RailOrderSummaryRequest).railOrderStages?.push(RailOrderStageForFilter.TRANSPORT_ORDER);
    }
  }

  protected afterRestoreFilterFromStorage(): void {
    const listKeyValues: ListKeyValue[] = [];
    if ((this.request4Storage as RailOrderSummaryRequest4Storage).railOrderStageList) {
      for (let item of (this.request4Storage as RailOrderSummaryRequest4Storage)?.railOrderStageList) {
        switch (item) {
          case RailOrderStageForFilter.BOOKING: {
            const listKeyValueItem: ListKeyValue = {
              key: item,
              value: this.translate.instant('Order-Management.order-view-filter.rail-order-stage.BOOKING')
            };
            listKeyValues.push(listKeyValueItem);
          } break;
          case RailOrderStageForFilter.TRANSPORT_ORDER: {
            const listKeyValueItem: ListKeyValue = {
              key: item,
              value: this.translate.instant('Order-Management.order-view-filter.rail-order-stage.TRANSPORT_ORDER')
            };
            listKeyValues.push(listKeyValueItem);
          } break;
          case RailOrderStageForFilter.DANGEROUS_GOODS: {
            const listKeyValueItem: ListKeyValue = {
              key: item,
              value: this.translate.instant('Order-Management.order-view-filter.rail-order-stage.DANGEROUS_GOODS')
            };
            listKeyValues.push(listKeyValueItem);
          } break;
        }
      }
    }
    this.multiselectRailOrderStage.multiselectForm.get('railorderstageid').setValue(listKeyValues);
  }

  private getSelectedRailOrderStagesFromForm(): RailOrderStageForFilter[] {
    let railOrderStages: RailOrderStageForFilter[] = [];
    if (this.multiselectRailOrderStageControl) {
      const selectedItems = this.multiselectRailOrderStageControl.value as Array<ListKeyValue>;
      if (selectedItems) {
        for (let item of selectedItems) {
          switch (item.key) {
            case RailOrderStageForFilter.BOOKING: {
              railOrderStages.push(RailOrderStageForFilter.BOOKING);
            } break;
            case RailOrderStageForFilter.TRANSPORT_ORDER: {
              railOrderStages.push(RailOrderStageForFilter.TRANSPORT_ORDER);
            } break;
            case RailOrderStageForFilter.DRAFT: {
              railOrderStages.push(RailOrderStageForFilter.DRAFT);
            } break;
            case RailOrderStageForFilter.DANGEROUS_GOODS: {
              railOrderStages.push(RailOrderStageForFilter.DANGEROUS_GOODS);
            }
          }
        }
      }
    }
    return railOrderStages;
  }

  private getSelectedOrderTemplateNames(): string[] {
    const result: string[] = [];
    if (this.multiselectOrderTemplateNamesControl) {
      const codes4Storage = this.multiselectOrderTemplateNamesControl.value as Array<ListKeyValue>;
      for (const item of codes4Storage) {
        const railOrderTemplateName: string = item.key as string;
        result.push(railOrderTemplateName);
      }
    }
    return result;
  }

  protected filterFormToRequest4Storage(): void {
    const shippingDateFrom = this.shippingDateFrom.value ? moment(this.shippingDateFrom.value).toDate() : null;
    const shippingDateTo = this.shippingDateTo.value ? moment(this.shippingDateTo.value).toDate() : null;
    const sendingStations = this.getSelectedSendingStations();
    const sendingStationsCode = this.getSendingStationsCode();
    const sendingStationsSearchInput = this.multiselectSendingStation.searchInput?.length > 0 ? this.multiselectSendingStation.searchInput : (this.request4Storage as RailOrderSummaryRequest4Storage).sendingStationsSearchInput;
    const receivingStations = this.getSelectedReceivingStations();
    const receivingStationsCode = this.getReceivingStationsCode();
    const receivingStationsSearchInput = this.multiselectReceivingStation.searchInput?.length > 0 ? this.multiselectReceivingStation.searchInput : (this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationsSearchInput;
    const railOrderStatus = this.getSelectedRailOrderStatus();
    const railOrderStages = this.getSelectedRailOrderStagesFromForm();
    const consignorProfiles = this.getSelectedConsignors();
    const consignorProfilesCode = this.getSelectedConsignorProfilesCode();
    const consigneeProfiles = this.getSelectedConsignees();
    const consigneeProfilesCode = this.getSelectedConsigneeProfilesCode();
    const consignorSearchInput = this.multiselectConsignor.searchInput?.length > 0 ? this.multiselectConsignor.searchInput : (this.request4Storage as RailOrderSummaryRequest4Storage).consignorSearchInput;
    const consigneeSearchInput = this.multiselectConsignee.searchInput?.length > 0 ? this.multiselectConsignee.searchInput : (this.request4Storage as RailOrderSummaryRequest4Storage).consigneeSearchInput;
    const sendingStationCountryCodesSearchInput  = this.multiselectsetSendingStationCountryCode.searchInput?.length > 0 ? this.multiselectsetSendingStationCountryCode.searchInput : (this.request4Storage as RailOrderSummaryRequest4Storage).sendingStationCountryCodesSearchInput;
    const sendingStationCountrysStorage = this.getSelectedSendingStationCountryCode();
    const sendingStationCountryCodesKeys = this.getSelectedSendingCountryCodeKeys();
    const receivingStationCountryCodesSearchInput = this.multiselectReceivingStationCountryCode.searchInput?.length > 0 ? this.multiselectReceivingStationCountryCode.searchInput : (this.request4Storage as RailOrderSummaryRequest4Storage).receivingStationCountryCodesSearchInput;
    const receivingStationCountryCodesStorage = this.getReceivingStationCountryCode();
    const receivingStationCountryCodesKeys = this.getSelectedReceivingStationCountryCodeKeys();
    const orderTemplateNames = this.getSelectedOrderTemplateNames();
    const dangerousGoodsTransport = false;
    this.setRequest4Storage(({
      wagonNumber: StringUtils.nullOnEmptyString(this.wagonNumber?.value),
      reference: StringUtils.nullOnEmptyString(this.reference?.value),
      orderNumber: StringUtils.nullOnEmptyString(this.zabOrderNumber?.value),
      shippingDateFrom: shippingDateFrom?.toISOString(),
      shippingDateTo: shippingDateTo?.toISOString(),
      railOrderStatus: railOrderStatus,
      railOrderStageList: railOrderStages,
      orderTemplateNumbers: orderTemplateNames,
      sendingStations: sendingStations,
      sendingStationsCode: sendingStationsCode,
      sendingStationsSearchInput: sendingStationsSearchInput,
      receivingStations: receivingStations,
      receivingStationsCode: receivingStationsCode,
      receivingStationsSearchInput: receivingStationsSearchInput,
      consignorProfiles: consignorProfiles,
      consignorProfilesCode: consignorProfilesCode,
      consigneeProfiles: consigneeProfiles,
      consigneeProfilesCode: consigneeProfilesCode,
      consignorSearchInput: consignorSearchInput,
      consigneeSearchInput: consigneeSearchInput,
      dangerousGoodsTransport: dangerousGoodsTransport,
      sendingStationCountryCodesSearchInput: sendingStationCountryCodesSearchInput,
      receivingStationCountryCodesSearchInput: receivingStationCountryCodesSearchInput,
      sendingStationCountryCodes: sendingStationCountryCodesKeys,
      receivingStationCountryCodes: receivingStationCountryCodesKeys,
      sendingStationCountryStorage: sendingStationCountrysStorage,
      receivingStationCountryCodesStorage: receivingStationCountryCodesStorage,
      sendingStationCountryCodesStorage: sendingStationCountrysStorage,
      shippingDateFromChanged: false,
      railOrderStages: railOrderStages,
      offset: this.offset,
      limit: this.limit,
      sort: this.request?.sort
    } as RailOrderSummaryRequest4Storage));
  }

  protected resetFilterConditions(): void {
    this.shippingDateFrom.setValue(undefined);
    this.shippingDateTo.setValue(undefined);
    this.multiselectSendingStationControl.setValue('');
    this.multiselectReceivingStationControl.setValue('');
    this.multiselectRailOrderStatusControl.setValue('');
    this.multiselectRailOrderStageControl.setValue('');
    this.multiselectConsigneeControl.setValue('');
    this.multiselectConsignorControl.setValue('');
    this.multiselectOrderTemplateNamesControl.setValue('');
    this.zabOrderNumber.setValue('');
    this.wagonNumber.setValue('');
    this.reference.setValue('');
    this.multiselectSendingStationCountryCodeControl.setValue('');
    this.multiselectReceivingStationCountryCodeControl.setValue('');
    this.resetAllFilters();
  }

  protected activeFilterAmount(): number {
    return this.activeFilterCount;
  }

  protected setLoadMoreButtonState(): void {
    if (this.railOrders && this.totalNumberOfOrders > 0 && this.totalNumberOfOrders > this.railOrders.length) {
      this.showLoadMoreButton$.next(true);
    } else {
      this.showLoadMoreButton$.next(false);
    }
  }

  private createAvailableRailOrderStatus(): void {
    this.availableRailorderStatus = [];
    const submitted: ListKeyValue = {
      key: 'SUBMITTED',
      value: 'SUBMITTED'
    }
    this.availableRailorderStatus.push(submitted);

    const captured: ListKeyValue = {
      key: 'CAPTURED',
      value: 'CAPTURED'
    }
    this.availableRailorderStatus.push(captured);

    const accepted: ListKeyValue = {
      key: 'ACCEPTED',
      value: 'ACCEPTED'
    }
    this.availableRailorderStatus.push(accepted);

    const active: ListKeyValue = {
      key: 'ACTIVE',
      value: 'ACTIVE'
    }
    this.availableRailorderStatus.push(active);

    const closed: ListKeyValue = {
      key: 'CLOSED',
      value: 'CLOSED'
    }
    this.availableRailorderStatus.push(closed);

    const canceled: ListKeyValue = {
      key: 'CANCELLED',
      value: 'CANCELLED'
    }
    this.availableRailorderStatus.push(canceled);
    this.setRailOrderStatusOptions();
  }

  private createAvailableRailOrderStages(): void {
    this.availableRailOrderTypes = [];
    const transportOrder: ListKeyValue = {
      key: 'TRANSPORT_ORDER',
      value: this.translateRailOrderStages('TRANSPORT_ORDER')
    }
    this.availableRailOrderTypes.push(transportOrder);
    const booking: ListKeyValue = {
      key: 'BOOKING',
      value: this.translateRailOrderStages('BOOKING')
    }
    this.availableRailOrderTypes.push(booking);
    const draft: ListKeyValue = {
      key: 'DRAFT',
      value: this.translateRailOrderStages('DRAFT')
    }
    this.availableRailOrderTypes.push(draft);
    const dangerous_goods: ListKeyValue = {
      key: 'DANGEROUS_GOODS',
      value: this.translateRailOrderStages('DANGEROUS_GOODS')
    }
    this.availableRailOrderTypes.push(dangerous_goods);
    this.multiselectRailOrderStage.dataList = this.availableRailOrderTypes.sort((a, b) => (a.value > b.value ? 1 : -1));
  }

  private registerOnOrderTemplateDeletedEvent(): void {
    this.multiselectOrderTemplateNumbers.formFieldContentDeletedEmitter.subscribe(() => {
      this.multiselectOrderTemplateNumbers.dataList = this.allAvailableOrderTemplateNumbers;
    });
  }

  private createAvailableTemplateNumbers(): void {
    this.availableOrderTemplateNumbers = [];
  }

  protected requestData(): void {
    this.requestSubscription = this.railOrderSearchService.getRailOrderList(this.request as RailOrderSummaryRequest).subscribe({
      next: (result: RailOrderSummaryResponse) => {
        if (result.offset === 0) {
          this.railOrders = [];
        }
        if (result['summaries']) {
          this.availableRailorderStatus = [];
          for (let item of result['summaries']) {
            this.railOrders.push(item);
          }
          this.createAvailableTemplateNumbers();
          this.createAvailableRailOrderStatus();

          this.totalNumberOfOrders = this.railOrders?.length;
          this.totalNumberOfOrders = result.total;
          this.totalNumberOfElements$.next(result.total);
          if (this.railOrders.length < result.total) {
            this.showLoadMoreButton$.next(true);
          }
          this.loadingInProgress$.next(false);
        }
      }, error: (err: Error) => {
        if (err instanceof HttpErrorResponse) {
          this.apiErrorDialogService.openApiErrorDialog(err);
        } else {
          this.apiErrorDialogService.openApiErrorDialog(err);
        }
      }
    });
  }

  protected saveCompleteListToCSV(): void {
    this.downloadInProgress = true;
    const limit = this.request.limit;
    const offset = this.request.offset;
    this.request.limit = this.totalNumberOfOrders;
    this.request.offset = 0;
    this.railOrderSearchService
      .getRailOrderList(this.request as RailOrderSummaryRequest)
      .subscribe({
        next: (result: RailOrderSummaryResponse) => {

          const railOrdersForCSV: RailOrderSearchSummary[] = []

          if (result['summaries']) {
            this.availableRailorderStatus = [];
            for (let item of result['summaries']) {
              railOrdersForCSV.push(item);
            }
          }
          this.fileExportService.exportRailOrdersToCsv(railOrdersForCSV);
          this.downloadInProgress = false;
        },

        error: (err: Error) => {
          this.downloadInProgress = false;
        }
      });


    this.request.limit = limit;
    this.request.offset = offset;
  }

  get sendingStation() {
    return this.filterForm.get('sendingStation') as FormControl;
  }

  get receivingStation() {
    return this.filterForm.get('receivingStation') as FormControl;
  }

  get zabOrderNumber(): FormControl {
    return this.filterForm.get('zabOrderNumber') as FormControl;
  }

  get wagonNumber(): FormControl {
    return this.filterForm.get('wagonNumber') as FormControl;
  }
  get reference(): FormControl {
    return this.filterForm.get('reference') as FormControl;
  }

  get dangerousGoodsTransport(): FormControl {
    return this.filterForm.get('dangerousGoodsTransport') as FormControl;
  }

  get shippingDateFrom(): FormControl {
    return this.filterForm.get("shippingDateFrom") as FormControl;
  }

  get shippingDateTo(): FormControl {
    return this.filterForm.get("shippingDateTo") as FormControl;
  }

  get sendingStationKeyAlpha() {
    return this.filterForm.get('sendingStationKeyAlpha') as FormControl;
  }

  get sendingStationKeySequence() {
    return this.filterForm.get('sendingStationKeySequence') as FormControl;
  }

  get multiselectRailOrderStatusControl(): FormControl {
    return this.multiselectRailOrderStatus?.multiselectForm.get(this.multiselectAutocompleteParametersRailOrderStatus.fieldId) as FormControl;
  }

  get multiselectRailOrderStageControl(): FormControl {
    return this.multiselectRailOrderStage?.multiselectForm.get(this.multiselectAutocompleteParametersRailOrderStage.fieldId) as FormControl;
  }

  get multiselectSendingStationControl(): FormControl {
    return this.multiselectSendingStation?.multiselectForm.get(this.multiselectAutocompleteParametersSending.fieldId) as FormControl;
  }

  get multiselectOrderTemplateNamesControl(): FormControl {
    return this.multiselectOrderTemplateNumbers?.multiselectForm.get(this.multiselectAutocompleteParametersOrderTemplateNumbers.fieldId) as FormControl;
  }

  get multiselectReceivingStationControl(): FormControl {
    return this.multiselectReceivingStation?.multiselectForm.get(this.multiselectAutocompleteParametersReceiving.fieldId) as FormControl;
  }

  get multiselectConsignorControl(): FormControl {
    return this.multiselectConsignor?.multiselectForm.get(this.multiselectAutocompleteParametersConsignor.fieldId) as FormControl;
  }

  get multiselectConsigneeControl(): FormControl {
    return this.multiselectConsignee?.multiselectForm.get(this.multiselectAutocompleteParametersConsignee.fieldId) as FormControl;
  }

  get multiselectSendingStationCountryCodeControl(): FormControl {
    return this.multiselectsetSendingStationCountryCode?.multiselectForm.get(this.multiselectAutocompleteParametersSendingStationCountryCode.fieldId) as FormControl;
  }
  get multiselectReceivingStationCountryCodeControl(): FormControl {
    return this.multiselectReceivingStationCountryCode?.multiselectForm.get(this.multiselectAutocompleteParametersReceivingStationCountryCode.fieldId) as FormControl;
  }
}
