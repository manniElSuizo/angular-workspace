// Angular Core
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';

// RxJS
import { debounceTime, map, Subject, Subscription, switchMap } from 'rxjs';

// External Libraries
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

// Services
import { AppService } from '@src/app/app.service';
import { WagonviewService } from '../../services/wagonview.service';
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';

// Utilities & Decorators
import { AutoUnsubscribe } from '@src/app/shared/decorater/auto-unsubscribe.decorater';
import { StringUtils } from '@src/app/shared/utils/string-utils';

// Enums & Constants
import { ConstValues } from '@src/app/shared/enums/const-values.enum';
import { StorageKeys } from '@src/app/shared/services/storage/storage.service.base';

// Models
import {
  PartnerRole,
  PartnerSummary,
  WagonSearchEventType,
  WagonSearchSummary,
  WagonSearchSummaryDetailedResponse,
  WagonSummaryRequest,
  WagonSummaryRequest4Storage,
  WagonSummaryResponse,
} from '../../models/api-wagon-list';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { StationType } from '@src/app/trainorder/models/location.models';
import { CommercialLocationSummary } from '@src/app/order-management/models/om-internal-api';
import { LocationRequest } from '@src/app/order-management/models/rail-order-api';
import { RailOrderStatus } from '@src/app/order-management/models/general-order';

// Components & Pipes
import {
  ListKeyValue,
  MultiselectAutocompleteComponent,
  MultiselectAutocompleteParameters,
} from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import { ListFilterBase } from '@src/app/shared/utils/list-filter-base';
import { LocationNameOutputFormat, LocationNamePipe } from '@src/app/shared/pipes/location-name.pipe';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';import { countryFormatNameCode } from '@src/app/shared/constants/Constants';

const FOCUSED = 'focused';

@Component({
  selector: 'app-wagon-view-filter',
  templateUrl: './wagon-view-filter.component.html',
  styleUrl: './wagon-view-filter.component.scss'
})
@AutoUnsubscribe
export class WagonViewFilterComponent extends ListFilterBase implements OnInit, AfterViewChecked, AfterViewInit {

  // #region ViewChilds
  @ViewChild('msss') multiselectSendingStation: MultiselectAutocompleteComponent;
  @ViewChild('msrs') multiselectReceivingStation: MultiselectAutocompleteComponent;
  @ViewChild('mscl') multiselectCurrentLocations: MultiselectAutocompleteComponent;
  @ViewChild('msconsigner') multiselectConsignor: MultiselectAutocompleteComponent;
  @ViewChild('msconsignee') multiselectConsignee: MultiselectAutocompleteComponent;
  @ViewChild('mssendingstationcountrycode') multiselectSendingStationCountryCode: MultiselectAutocompleteComponent;
  @ViewChild('msreceivingstationcountrycode') multiselectReceivingStationCountryCode: MultiselectAutocompleteComponent;
  // #endregion

  // #region Properties
  public wagonSummarys: WagonSearchSummary[] = new Array();
  public showLoadMoreButton$: Subject<boolean> = new Subject();
  protected maxDate = ConstValues.MAX_DATE;
  protected debounceTimeValue = 500;
  protected filterForm: FormGroup;
  //protected activeFilterCount: number;
  public sortConditions: SortConditionsModel[] = [{ asc: true, field: "wagonNumber" }];
  protected loadingInProgress: boolean;
  readonly MAX_FILTER_COUNT = 10000;
  public totalNumberOfWagons = 0;
  // #endregion

  // #region Multiselect Parameter
  protected multiselectAutocompleteParametersReceiving: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersSending: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersCurrentLocation: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersConsignor: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersConsignee: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersSendingStationCountryCode: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersReceivingStationCountryCode: MultiselectAutocompleteParameters;
  // #endregion

  // #region Subjects
  private receivingStationSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private sendingStationSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private currentLocationSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private consignorSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private consigneeSearchSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private availableSenderIsoCountryCodesSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private availableDeliveryIsoCountryCodesSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  // #endregion

  private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
  private availableSenderIsoCountryCodes: ListKeyValue[] = [];
  private availableDeliveryIsoCountryCodes: ListKeyValue[] = [];
  private locationNamePipe: LocationNamePipe = inject(LocationNamePipe);

  constructor(appService: AppService,
    private wagonviewService: WagonviewService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    private fileExportService: FileExportService  ) {
    super(appService, StorageKeys.WAGON_VIEW_FILTER_STORAGE_KEY);
    this.createFilterForm();
  }

  // #region Lifecycle Hooks

  ngOnInit(): void {
    this.addFilterPropertiesToBeIgnored([]);

    const wagonSummaryRequest: WagonSummaryRequest = {
      wagonNumber: null,
      orderNumber: null,
      orderAuthority: null,
      shippingDateFrom: null,
      shippingDateTo: null,
      incomingBy: null,
      sendingStations: [],
      receivingStations: [],
      consignorProfiles: [],
      consigneeProfiles: [],
      emptyWagons: null,
      currentLocations: [],
      reference: '',
      sendingStationCountryCodes: [],
      receivingStationCountryCodes: [],
      customerProfiles: [],
      offset: 0,
      sort: null,
      limit: ListFilterBase.DEFAULT_LIMIT

    };
    this.request = wagonSummaryRequest;

    this.setMultiselectParamsSendingStation();
    this.setMultiselectParamsReceivingStation();
    this.setMultiselectParamsCurrentLocations();
    this.setMultiselectParamsConsignor();
    this.setMultiselectParamsConsignee();
    this.setMultiselectParamsSendingStationCountryCode();
    this.setMultiselectParamsReceivingStationCountryCode();
    this.setupSearchSubjects();
  }

  ngAfterViewInit(): void {
    this.filterForm.addControl('childFormSending', this.multiselectSendingStation.multiselectForm);
    this.multiselectSendingStation.multiselectForm.setParent(this.filterForm);
    this.filterForm.addControl('childFormReceiving', this.multiselectReceivingStation.multiselectForm);
    this.multiselectReceivingStation.multiselectForm.setParent(this.filterForm);
    this.filterForm.addControl('childFormCurrentLocation', this.multiselectCurrentLocations.multiselectForm);
    this.multiselectCurrentLocations.multiselectForm.setParent(this.filterForm);
    this.filterForm.addControl('childFormConsignor', this.multiselectConsignor.multiselectForm);
    this.multiselectConsignor.multiselectForm.setParent(this.filterForm);
    this.filterForm.addControl('childFormConsignee', this.multiselectConsignee.multiselectForm);
    this.multiselectConsignee.multiselectForm.setParent(this.filterForm);

    this.registerForLoadingStatusChanges();
    this.restoreFilterFromStorage();
    //this.setStorageValuesInForm();
    this.setInitialShippingDateFrom();
    this.storageToRequest();
    this.fetchData();
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }
  // #endregion

  private registerForLoadingStatusChanges(): void {
    this.loadingInProgress$.subscribe(loading => {
      this.loadingInProgress = loading;
    });
  }

  private setInitialShippingDateFrom(): void {
    const nowMinusSixDays = new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000));
    nowMinusSixDays.setHours(0, 0, 0, 0);
    let shippingDateFrom = (this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateFrom ? formatDate((this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateFrom, 'yyyy-MM-dd', 'de') : null;
    if (!shippingDateFrom) {
      shippingDateFrom = formatDate(nowMinusSixDays, 'yyyy-MM-dd', 'de');
    }
    this.dispatchDateFrom.setValue(shippingDateFrom);
  }
  // #region SetterMultiselect

  private setMultiselectParamsSendingStation() {
    console.log('setMultiselectParamsSendingStation');
    this.multiselectAutocompleteParametersSending = {
      i18n: {
        fieldText: this.translate.instant('Wagon-overview.Filter.Place-holder.Sending-station'),
        labelText: this.translate.instant('Wagon-overview.Filter.Label.Sending-station'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "sendingStation",
      fieldId: "sendingStation",
      divId: "sendingStationDiv",
      formControlName: "sendingStation",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.sendingStationSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as WagonSummaryRequest4Storage).sendingStationsStorage ? (this.request4Storage as WagonSummaryRequest4Storage).sendingStationsStorage : []
    };
  }

  private setMultiselectParamsReceivingStation() {
    this.multiselectAutocompleteParametersReceiving = {
      i18n: {
        fieldText: this.translate.instant('Wagon-overview.Filter.Place-holder.Receiving-station'),
        labelText: this.translate.instant('Wagon-overview.Filter.Label.Receiving-station'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "receivingStation",
      fieldId: "receivingStation",
      divId: "receivingStationDiv",
      formControlName: "receivingStation",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.receivingStationSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as WagonSummaryRequest4Storage).receivingStationsStorage ? (this.request4Storage as WagonSummaryRequest4Storage).receivingStationsStorage : []
    };
  }

  private setMultiselectParamsCurrentLocations() {
    this.multiselectAutocompleteParametersCurrentLocation = {
      i18n: {
        fieldText: this.translate.instant('Wagon-overview.Filter.Place-holder.Location'),
        labelText: this.translate.instant('Wagon-overview.Filter.Label.Location'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "location",
      fieldId: "location",
      divId: "locationDiv",
      formControlName: "location",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.currentLocationSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as WagonSummaryRequest4Storage).currentLocationsStorage ? (this.request4Storage as WagonSummaryRequest4Storage).currentLocationsStorage : []
    };
  }

  private setMultiselectParamsConsignor() {
    this.multiselectAutocompleteParametersConsignor = {
      i18n: {
        fieldText: this.translate.instant('Wagon-overview.Filter.Place-holder.Consignor'),
        labelText: this.translate.instant('Wagon-overview.Filter.Label.Consignor'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "consignor",
      fieldId: "consignor",
      divId: "consignorDiv",
      formControlName: "consignor",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.consignorSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as WagonSummaryRequest4Storage).consignorProfilesStorage ? (this.request4Storage as WagonSummaryRequest4Storage).consignorProfilesStorage : []
    };
  }

  private setMultiselectParamsConsignee() {
    this.multiselectAutocompleteParametersConsignee = {
      i18n: {
        fieldText: this.translate.instant('Wagon-overview.Filter.Place-holder.Consignee'),
        labelText: this.translate.instant('Wagon-overview.Filter.Label.Consignee'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "consignee",
      fieldId: "consignee",
      divId: "consigneeDiv",
      formControlName: "consignee",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.consigneeSearchSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as WagonSummaryRequest4Storage).consigneeProfilesStorage ? (this.request4Storage as WagonSummaryRequest4Storage).consigneeProfilesStorage : []
    };
  }

  private setMultiselectParamsSendingStationCountryCode(): void {
      this.multiselectAutocompleteParametersSendingStationCountryCode = {
        i18n: {
          fieldText: this.translate.instant('Wagon-overview.Filter.Place-holder.senderIsoCountryCode'),
          labelText: this.translate.instant('Wagon-overview.Filter.Place-holder.senderIsoCountryCode'),
          errorText: this.translate.instant('error text'),
          searchPlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.searchPlaceholderText'),
          noDataAvailablePlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.noDataAvailablePlaceholderText')
        },
        fieldName: "senderisocountrycodesname",
        fieldId: "senderisocountrycodesid",
        divId: "senderisocountrycodesdiv",
        formControlName: "SenderIsoCountryCodes",
        minQueryLength: 3,

        dataCallback: (searchInput: string, array: ListKeyValue[]) => {

          this.availableSenderIsoCountryCodesSubject.next({ searchInput, array });
        },
        selectedItems: this.request4Storage && (this.request4Storage as WagonSummaryRequest4Storage).sendingStationCountryCodesStorage ? (this.request4Storage as WagonSummaryRequest4Storage).sendingStationCountryCodesStorage : [],
      };
    }

    private setMultiselectParamsReceivingStationCountryCode(): void {
      this.multiselectAutocompleteParametersReceivingStationCountryCode = {
        i18n: {
          fieldText: this.translate.instant('Wagon-overview.Filter.Place-holder.deliveryIsoCountryCode'),
          labelText: this.translate.instant('Wagon-overview.Filter.Place-holder.deliveryIsoCountryCode'),
          errorText: this.translate.instant('error text'),
          searchPlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.searchPlaceholderText'),
          noDataAvailablePlaceholderText: this.translate.instant('Wagon-overview.Filter.ControlMultiSelect.noDataAvailablePlaceholderText')
        },
        fieldName: "deliveryisocountrycodesname",
        fieldId: "deliveryisocountrycodesid",
        divId: "deliveryisocountrycodesdiv",
        formControlName: "DeliveryIsoCountryCodes",
        minQueryLength: 3,

        dataCallback: (searchInput: string, array: ListKeyValue[]) => {

          this.availableDeliveryIsoCountryCodesSubject.next({ searchInput, array });
        },
        selectedItems: this.request4Storage && (this.request4Storage as WagonSummaryRequest4Storage).receivingStationCountryCodesStorage ? (this.request4Storage as WagonSummaryRequest4Storage).receivingStationCountryCodesStorage : [],
      };
    }

  // #endregion

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

    this.currentLocationSearchSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput, array }) =>
        this.wagonviewService.getRailOrdersCurrentLocations(searchInput).pipe(
          map(locations => ({ locations, array }))
        )
      )
    ).subscribe({
      next: ({ locations, array }) => {
        const resultList: ListKeyValue[] = [...array];
        locations.forEach(location => {
          //const locationKey = JSON.stringify({ key: location, value: location });
          const found = resultList.find(kv => kv.key == location && kv.value == location);
          if (!found) {
            resultList.push({ key: location, value: location });
          }
        });
        this.multiselectCurrentLocations.dataList = resultList;
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
        this.multiselectSendingStationCountryCode.dataList = resultList;
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
  }
  private getSendingStationCountryCodeSuggestions(): void {
    this.multiselectSendingStationCountryCode.dataList = this.availableSenderIsoCountryCodes;
  }

  private getReceivingStationCountryCodeSuggestions(): void {
    this.multiselectReceivingStationCountryCode.dataList = this.availableDeliveryIsoCountryCodes;
  }

  protected createFilterForm(): void {
    this.filterForm = new FormGroup({
      wagonNumber: new FormControl('', Validators.min(12)),
      zabOrderNumber: new FormControl(''),
      dispatchDateFrom: new FormControl(''),
      dispatchDateTo: new FormControl(''),
      incomingBy: new FormControl(''),
      loadingstate: new FormControl(),
      reference: new FormControl('')
    },
      [this.validateDates()]
    );
  }

  protected setStorageValuesInForm(): void {
    this.reference.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.reference);
    this.wagonNumber.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.wagonNumber);
    this.zabOrderNumber.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.orderNumber);
    this.loadingState.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.emptyWagons);
    this.dispatchDateFrom.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateFrom ? formatDate((this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateFrom, 'yyyy-MM-dd', 'de') : null);
    this.dispatchDateTo.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateTo ? formatDate((this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateTo, 'yyyy-MM-dd', 'de') : null);
    this.incomingBy.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.incomingBy ? this.toLocalDateTimeStr((this.request4Storage as WagonSummaryRequest4Storage).incomingBy) : null);
    this.setSendingStationsFromStorage();
    this.setReceivingStationsFromStorage();
    this.setCurrentLocationssFromStorage();
    this.setConsignorFromStorage();
    this.setConsigneeFromStorage();
    this.setSendingStationCountryCodeFromStorage();
    this.setReceivingStationCountryCodeFromStorage();
  }

  //Consignor
  private setConsignorFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as WagonSummaryRequest4Storage).consignorProfilesStorage);
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
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
    this.getConsignorSuggestions((this.request4Storage as WagonSummaryRequest4Storage).consignorProfilesSearchInput, listKeyValues);
  }

  private getConsignorSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput) {
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
        }
      });
    }
  }

  //Consignee
  private setConsigneeFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as WagonSummaryRequest4Storage).consigneeProfilesStorage);
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
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
    this.getConsigneeSuggestions((this.request4Storage as WagonSummaryRequest4Storage).consigneeProfilesSearchInput, listKeyValues);
  }

  private setSendingStationCountryCodeFromStorage(): void {
      const valuesFromStorage = ((this.request4Storage as WagonSummaryRequest4Storage).sendingStationCountryCodesStorage);
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
      const valuesFromStorage = ((this.request4Storage as WagonSummaryRequest4Storage).receivingStationCountryCodesStorage);
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
  private getConsigneeSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput) {
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
        }
      });
    }
  }

  //CurrentLocations
  private setCurrentLocationssFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as WagonSummaryRequest4Storage).currentLocationsStorage);
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
      for (let item of valuesFromStorage) {
        //const locationRequest: LocationRequest = JSON.parse(item.key);
        const stationname: string = item.value;
        const listKeyValue: ListKeyValue = {
          //key: '{"authority":' + locationRequest.authority + ',"locationCode":"' + locationRequest.locationCode + '"}',
          key: stationname,
          value: stationname
        }
        listKeyValues.push(listKeyValue);
      }
      this.currentLocations.setValue(listKeyValues);
    }
    this.getCurrentLocationSuggestions((this.request4Storage as WagonSummaryRequest4Storage).currentLocationsSearchInput, []);
  }

  private getCurrentLocationSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput) {
      this.wagonviewService.getRailOrdersCurrentLocations(searchInput).subscribe({
        next: (locations: string[]) => {
          const resultList: ListKeyValue[] = [...array];
          locations.forEach(location => {
            const locationKey = JSON.stringify({ key: location, value: location });
            const found = resultList.find(kv => kv.key == location && kv.value == location);
            if (!found) {
              resultList.push({ key: location, value: location });
            }
          });
          this.multiselectCurrentLocations.dataList = resultList;
        }
      });
    }
  }

  //ReceivingStations
  private setReceivingStationsFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as WagonSummaryRequest4Storage).receivingStationsStorage);
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
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
    this.getReceivingStationSuggestions((this.request4Storage as WagonSummaryRequest4Storage).receivingStationsSearchInput, listKeyValues);
  }

  private getReceivingStationSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput) {
      this.railOrderInternalService.getRailOrdersCommercialLocations(searchInput, StationType.DEPARTURE).subscribe({
        next: (locations: CommercialLocationSummary[]) => {
          const resultList: ListKeyValue[] = [...array];
          this.prepareDataListForMultiselect(resultList, locations);
          this.multiselectReceivingStation.dataList = resultList;
          return resultList;
        }
      });
    }
  }

  //SendingStations
  private setSendingStationsFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as WagonSummaryRequest4Storage).sendingStationsStorage);
    const listKeyValues: ListKeyValue[] = [];
    if (valuesFromStorage) {
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
    this.getSendingStationSuggestions((this.request4Storage as WagonSummaryRequest4Storage).sendingStationsSearchInput, listKeyValues);
  }

  private getSendingStationSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput) {
      this.railOrderInternalService.getRailOrdersCommercialLocations(searchInput, StationType.DESTINATION).subscribe({
        next: (locations: CommercialLocationSummary[]) => {
          const resultList: ListKeyValue[] = [...array];
          this.prepareDataListForMultiselect(resultList, locations);
          this.multiselectSendingStation.dataList = resultList;
          return resultList;
        }
      });
    }
  }


  protected filterFormToRequest4Storage(): void {
    const dispatchDateFrom = this.dispatchDateFrom.value ? moment(this.dispatchDateFrom.value).toDate() : null;
    const dispatchDateTo = this.dispatchDateTo.value ? moment(this.dispatchDateTo.value).toDate() : null;
    const incomingByDateTime = this.incomingBy.value ? this.toZuluTime(this.incomingBy.value) : null;

    let sendingStations: LocationRequest[] | null = null;
    let receivingStations: LocationRequest[] | null = null;
    let currentLocations: string[] | null = null;
    let consignor: CustomerProfile[] | null = null;
    let consignee: CustomerProfile[] | null = null;
    let emptyWagons: boolean | null;
    const sendingStationsSearchInput = this.multiselectSendingStation?.searchInput?.length > 0 ? this.multiselectSendingStation?.searchInput : (this.request4Storage as WagonSummaryRequest4Storage)?.sendingStationsSearchInput;
    const sendingStationsStorage = this.multiselectSendingStationControl?.value as Array<ListKeyValue>;
    const receivingStationsSearchInput = this.multiselectReceivingStation?.searchInput?.length > 0 ? this.multiselectReceivingStation?.searchInput : (this.request4Storage as WagonSummaryRequest4Storage)?.receivingStationsSearchInput;
    const receivingStationsStorage = this.multiselectReceivingStationControl?.value as Array<ListKeyValue>;
    const currentLocationsSearchInput = this.multiselectCurrentLocations?.searchInput?.length > 0 ? this.multiselectCurrentLocations?.searchInput : (this.request4Storage as WagonSummaryRequest4Storage)?.currentLocationsSearchInput;
    const currentLocationsStorage = this.currentLocations?.value as Array<ListKeyValue>;
    const consignorSearchInput = this.multiselectConsignor?.searchInput?.length > 0 ? this.multiselectConsignor?.searchInput : (this.request4Storage as WagonSummaryRequest4Storage)?.consignorProfilesSearchInput;
    const consignorStorage = this.multiselectConsignorControl?.value as Array<ListKeyValue>;
    const consigneeSearchInput = this.multiselectConsignee?.searchInput?.length > 0 ? this.multiselectConsignee?.searchInput : (this.request4Storage as WagonSummaryRequest4Storage)?.consigneeProfilesSearchInput;
    const consigneeStorage = this.multiselectConsigneeControl?.value as Array<ListKeyValue>;
    const sendingStationCountryCodesInput = this.multiselectSendingStationCountryCode.searchInput?.length > 0 ? this.multiselectSendingStationCountryCode.searchInput : (this.request4Storage as WagonSummaryRequest4Storage).sendingStationCountryCodesSearchInput;
    const sendingStationCountryCodesStorage = this.getSelectedSendingStationCountryCode();
    const sendingStationCountryCodesKeys = this.getSelectedSendingStationCountryCodeKeys();
    const receivingStationCountryCodesInput = this.multiselectReceivingStationCountryCode.searchInput?.length > 0 ? this.multiselectReceivingStationCountryCode.searchInput : (this.request4Storage as WagonSummaryRequest4Storage).receivingStationCountryCodesSearchInput;
    const receivingStationCountryCodesStorage = this.getSelectedReceivingStationCountryCode();
    const receivingStationCountryCodesKeys = this.getSelectedReceivingStationCountryCodeKeys();
    if (sendingStationsStorage && sendingStationsStorage.length > 0) {
      sendingStations = [];
      sendingStationsStorage.forEach(station => {
        const lReq = JSON.parse(station.key);
        sendingStations.push(lReq);
      });
    }

    if (receivingStationsStorage && receivingStationsStorage.length > 0) {
      receivingStations = [];
      receivingStationsStorage.forEach(station => {
        const lReq = JSON.parse(station.key);
        receivingStations.push(lReq);
      });
    }

    if (currentLocationsStorage && currentLocationsStorage.length > 0) {
      currentLocations = [];
      currentLocationsStorage.forEach(station => {
         currentLocations.push(station.key);
      });
    }

    if (consignorStorage && consignorStorage.length > 0) {
      consignor = [];
      consignorStorage.forEach(partner => {
        const pr = JSON.parse(partner.key);
        consignor.push(pr);
      });
    }

    if (consigneeStorage && consigneeStorage.length > 0) {
      consignee = [];
      consigneeStorage.forEach(partner => {
        const pr = JSON.parse(partner.key);
        consignee.push(pr);
      });
    }

    if (this.loadingState.value === true || this.loadingState.value === "true") {
      emptyWagons = true;
    } else if (this.loadingState.value === false || this.loadingState.value === "false") {
      emptyWagons = false;
    } else {
      emptyWagons = null;
    }

    this.setRequest4Storage(({
      wagonNumber:StringUtils.nullOnEmptyString(this.wagonNumber.value)?.replace(/\D/g, ''),

      orderAuthority: (() => {
        const cleaned = StringUtils.nullOnEmptyString(this.zabOrderNumber.value)?.replace(/\D/g, '') ?? null;
        return (cleaned && cleaned.length === 17) ? Number(cleaned.slice(0, 2)) : null;
      })(),
      orderNumber: (() => {
        const cleaned = StringUtils.nullOnEmptyString(this.zabOrderNumber.value)?.replace(/\D/g, '') ?? null;
        return (cleaned && cleaned.length === 17) ? cleaned.slice(2) : cleaned;
      })(),


      sendingStationsSearchInput: sendingStationsSearchInput,
      sendingStations: sendingStations,
      sendingStationsStorage: sendingStationsStorage,
      receivingStationsSearchInput: receivingStationsSearchInput,
      receivingStations: receivingStations,
      receivingStationsStorage: receivingStationsStorage,
      currentLocationsSearchInput: currentLocationsSearchInput,
      currentLocations: currentLocations,
      currentLocationsStorage: currentLocationsStorage,
      emptyWagons: emptyWagons,
      shippingDateFrom: dispatchDateFrom,
      shippingDateTo: dispatchDateTo,
      incomingBy: incomingByDateTime,
      consignorProfilesSearchInput: consignorSearchInput,
      consignorProfiles: consignor,
      consignorProfilesStorage: consignorStorage,
      consigneeProfilesSearchInput: consigneeSearchInput,
      consigneeProfiles: consignee,
      dispatchDateFromChanged: false,
      reference: StringUtils.nullOnEmptyString(this.reference?.value),
      sendingStationCountryCodesSearchInput: sendingStationCountryCodesInput,
      receivingStationCountryCodesSearchInput: receivingStationCountryCodesInput,
      sendingStationCountryCodes: sendingStationCountryCodesKeys,
      receivingStationCountryCodes: receivingStationCountryCodesKeys,
      sendingStationCountryCodesStorage: sendingStationCountryCodesStorage,
      receivingStationCountryCodesStorage: receivingStationCountryCodesStorage,
      consigneeProfilesStorage: consigneeStorage,
      offset: this.offset,
      limit: this.limit,
      sort: this.request.sort,
    } as WagonSummaryRequest4Storage));

  }

  protected requestData(): void {

    this.loadingInProgress$.next(true);
    this.addSortToRequest();

    // set customerProfiles in WagonSummaryRequest
    //this.wagonSummaryRequest.customerProfiles = this.customerProfiles;


    this.wagonviewService.getWagonList(this.request).subscribe({
      next: ((result: WagonSummaryResponse) => {

        if (this.request.offset == 0) {
          // Initial Summary Array before Add new result summaries
          this.wagonSummarys = new Array();
        }
        // Append next 25 lines when pressing Load more button
        result.summaries.forEach(wagon => {
          wagon.timeConstraintType = this.getTrafficLight(wagon);
        })
        this.wagonSummarys = this.wagonSummarys.concat(result.summaries);
        this.offset = result.offset;
        this.limit = result.limit;
        this.totalNumberOfWagons = result.total;
        this.loadingInProgress$.next(false);
        this.setLoadMoreButtonState();
      })
    }
    );
  }

  private prepareDataListForMultiselect(resultList: ListKeyValue[],locations: CommercialLocationSummary[]): void {
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

  protected resetFilterConditions(): void {
    this.multiselectSendingStationControl.setValue([]);
    this.multiselectReceivingStationControl.setValue([]);
    this.currentLocations.setValue([]);
    this.multiselectConsignorControl.setValue([]);
    this.multiselectConsigneeControl.setValue([]);
    this.wagonNumber.setValue('');
    this.zabOrderNumber.setValue('');
    this.dispatchDateFrom.setValue('');
    this.dispatchDateTo.setValue('');
    this.loadingState.setValue(null);
    this.incomingBy.setValue('');
    this.reference.setValue('');
    this.multiselectSendingStationCountryCodeControl.setValue('');
    this.multiselectReceivingStationCountryCodeControl.setValue('');
    this.resetAllFilters();
  }

  protected afterRestoreFilterFromStorage() {
    // set values in form
    this.setDispatchDateFromValue();
    this.wagonNumber.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.wagonNumber);
    this.dispatchDateTo.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateTo ? formatDate((this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateTo, 'yyyy-MM-dd', 'de') : null);
    this.incomingBy.setValue(
      (this.request4Storage as WagonSummaryRequest4Storage)?.incomingBy
        ? this.toLocalDateTimeStr((this.request4Storage as WagonSummaryRequest4Storage).incomingBy)
        : null
    );
    this.zabOrderNumber.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.orderNumber);
    this.loadingState.setValue((this.request4Storage as WagonSummaryRequest4Storage)?.emptyWagons);
  }

  private setDispatchDateFromValue(): void {
    const nowMinusSixDays = new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000));
    nowMinusSixDays.setHours(0, 0, 0, 0);
    let dispatchDateFrom = formatDate(nowMinusSixDays, 'yyyy-MM-dd', 'de');
    if ((this.request4Storage as WagonSummaryRequest4Storage)?.dispatchDateFromChanged) {
      dispatchDateFrom = (this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateFrom ? formatDate((this.request4Storage as WagonSummaryRequest4Storage)?.shippingDateFrom, 'yyyy-MM-dd', 'de') : null;
    } else {
      (this.request4Storage as WagonSummaryRequest4Storage).shippingDateFrom = nowMinusSixDays;
    }
    this.dispatchDateFrom.setValue(dispatchDateFrom);
  }

  private setEmptyWagonSummaryRequest4Storage() {
    (this.request4Storage as WagonSummaryRequest4Storage) = {
      offset: this.request.offset,
      limit: this.request.limit,
      sort: this.request.sort
    };
  }

   protected afterStorageToRequest(): void {

    const cleanedReference = (this.request as WagonSummaryRequest).reference
          ? (this.request as WagonSummaryRequest).reference.trim()
          : null;
        (this.request as WagonSummaryRequest).reference = cleanedReference && cleanedReference.length > 0
          ? cleanedReference
          : null;
   }

  protected onChangeFilter(e: any) {
    if (!this.filterForm.valid) {
      return;
    }

    this.resetRequest();
    this.filterFormToRequest4Storage();

    if (e && e.target.name == "dispatchDateFrom") {
      this.onChangeDispatchDateFrom();
    }

    this.writeFilterToStorage();
    this.storageToRequest();

    this.fetchData();
  }

  private onChangeDispatchDateFrom() {
    (this.request4Storage as WagonSummaryRequest4Storage).dispatchDateFromChanged = true;
  }

  protected resetRequest(limit: number = 25): void {
    this.offset = 0;
    this.limit = limit;
  }

  protected clearSearchInput(key: string) {
    switch (key) {
      case "sendingStation":
        // this.storage.removeItem(StorageKeys.WAGON_VIEW_FILTER_STORAGE_KEY);
        // this.filterForm.controls["sendingStation"].setValue('');
        // this.filterForm.controls["sendingStationObjectKeySequence"].setValue('');
        // this.filterForm.controls["sendingStationObjectKeyAlpha"].setValue('');
        // this.sendingStationObjectKeyAlpha.setValue('');
        // this.sendingStationObjectKeySequence.setValue('');
        // this.sendingStation.setValue('');

        // TODO delete sending- and receiving station values
        break;
      case "receivingStation":
        // TODO delete sending- and receiving station values

        break;
    }
  }

private toZuluTime(localDateTimeStr: string): Date {
  // Parse the local date-time string with Moment
  const momentDate = moment(localDateTimeStr);

  // Convert to UTC and return a native Date object
  return momentDate.utc().toDate();
}


  private toLocalDateTimeStr(zuluTimeStr) {
    // Parse the Zulu time string as UTC and convert to local time
    const localDateTimeStr = moment.utc(zuluTimeStr).local().format("YYYY-MM-DDTHH:mm:ss");

    return localDateTimeStr;
  }
  private addSortToRequest(): void {
    this.request.sort = this.sortConditions.map(sc => (sc.asc ? '+' : '-') + sc.field).join(',');
  }

  private setLoadMoreButtonState(): void {
    if (this.wagonSummarys && this.totalNumberOfWagons > 0 && this.totalNumberOfWagons > this.wagonSummarys.length) {
      this.showLoadMoreButton$.next(true);
    } else {
      this.showLoadMoreButton$.next(false);
    }
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

  //#region Getters
  get wagonNumber(): FormControl {
    return this.filterForm.get("wagonNumber") as FormControl;
  }

  get reference(): FormControl {
    return this.filterForm.get('reference') as FormControl;
  }

  get multiselectSendingStationCountryCodeControl(): FormControl {
    return this.multiselectSendingStationCountryCode?.multiselectForm.get(this.multiselectAutocompleteParametersSendingStationCountryCode.fieldId) as FormControl;
  }

  get multiselectReceivingStationCountryCodeControl(): FormControl {
    return this.multiselectReceivingStationCountryCode?.multiselectForm.get(this.multiselectAutocompleteParametersReceivingStationCountryCode.fieldId) as FormControl;
  }

  get zabOrderNumber(): FormControl {
    return this.filterForm.get("zabOrderNumber") as FormControl;
  }

  get dispatchDateFrom(): FormControl {
    return this.filterForm.get("dispatchDateFrom") as FormControl;
  }

  get dispatchDateTo(): FormControl {
    return this.filterForm.get("dispatchDateTo") as FormControl;
  }

  get incomingBy(): FormControl {
    return this.filterForm.get("incomingBy") as FormControl;
  }

  get loadingState(): FormControl {
    return this.filterForm.get("loadingstate") as FormControl;
  }

  get multiselectSendingStationControl(): FormControl {
    return this.multiselectSendingStation?.multiselectForm.get(this.multiselectAutocompleteParametersSending.fieldId) as FormControl;
  }

  get multiselectReceivingStationControl(): FormControl {
    return this.multiselectReceivingStation?.multiselectForm.get(this.multiselectAutocompleteParametersReceiving.fieldId) as FormControl;
  }

  get currentLocations(): FormControl {
    return this.multiselectCurrentLocations?.multiselectForm.get(this.multiselectAutocompleteParametersCurrentLocation.fieldId) as FormControl;
  }

  get multiselectConsignorControl(): FormControl {
    return this.multiselectConsignor?.multiselectForm.get(this.multiselectAutocompleteParametersConsignor.fieldId) as FormControl;
  }

  get multiselectConsigneeControl(): FormControl {
    return this.multiselectConsignee?.multiselectForm.get(this.multiselectAutocompleteParametersConsignee.fieldId) as FormControl;
  }

   private getSelectedSendingStationCountryCode() : Array<ListKeyValue> {
    if (this.multiselectSendingStationCountryCodeControl) {
      return this.multiselectSendingStationCountryCodeControl.value as Array<ListKeyValue>;
    }
    return [];
  }

private getSelectedSendingStationCountryCodeKeys(): Array<string> {
  // Ensure value is defined and is an array
  if (Array.isArray(this.multiselectSendingStationCountryCodeControl?.value)) {
    const listKeyValues = this.multiselectSendingStationCountryCodeControl.value as Array<ListKeyValue>;
    return listKeyValues.map(item => item.key);
  }
  // If value is not an array or is undefined, return an empty array
  return [];
}

private getSelectedReceivingStationCountryCode() : Array<ListKeyValue> {
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
  //#endregion

  // #region Hilfsmethoden
  protected multiselectChangeEventListener($event: any) {
    console.log("multiselectChangeEventListener()", $event);
    this.onChangeFilter($event);
  }

  protected log(event: Event, arg0: string) {
    console.log(event);
    console.log(arg0);
  }

  private getTrafficLight(wagon: WagonSearchSummary): string {
    const { railOrderStatus, lastWagonEventType, estimatedArrivalTime, lastWagonEventTime } = wagon;
    const currentDate = new Date();
    const dateLatestArrivalTime = wagon.latestArrivalTime ? new Date(wagon.latestArrivalTime) : null;
    const dateExpectedArrivalTime = estimatedArrivalTime ? new Date(estimatedArrivalTime) : null;
    const dateLastWagonEventTime = lastWagonEventTime ? new Date(lastWagonEventTime) : null;

    // Check for any invalid date conversions
    if (dateLatestArrivalTime?.toString() === "Invalid Date" ||
      dateExpectedArrivalTime?.toString() === "Invalid Date" ||
      dateLastWagonEventTime?.toString() === "Invalid Date") {
      console.error("Invalid date format provided.");
      return ""; // Return empty if any date is invalid
    }

    // Check for the "CLOSED" status AND ARRIVAL event first and if lastWagonEventTime is there
    if (railOrderStatus === RailOrderStatus.CLOSED && lastWagonEventType === WagonSearchEventType.ARRIVAL && lastWagonEventTime) {
      // If the scheduled date is after the target, return "red"
      if (lastWagonEventTime > dateLatestArrivalTime) return "red";
      // If the scheduled date is before the target, return "green"
      if (lastWagonEventTime <= dateLatestArrivalTime) return "green";
    } else {
      //   // If there's no latestArrivalTime, return "grey"
      if (dateLatestArrivalTime && dateExpectedArrivalTime && (dateExpectedArrivalTime > dateLatestArrivalTime)) return "red";
      if (dateLatestArrivalTime && currentDate && (currentDate > dateLatestArrivalTime)) return "red";
      if (dateExpectedArrivalTime && dateLatestArrivalTime && (dateExpectedArrivalTime <= dateLatestArrivalTime)) return "green"
      if (!dateLatestArrivalTime || !dateExpectedArrivalTime) return "grey";
    }

    // Return an empty string if no conditions matched
    return "";
  }

  /**
   * Validates that the dispatch date from is before the dispatch date to
   */
  private validateDates(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.get('dispatchDateFrom')?.value || !control.get('dispatchDateTo')?.value)
        return null;
      return control.get('dispatchDateFrom')?.value <= control.get('dispatchDateTo')?.value ? null : { dateToBeforeDateFrom: true };
    }
  }

  protected saveCompleteListToCSV() {
    this.downloadInProgress = true;
    var limit = this.request.limit;
    var offset = this.request.offset
    this.request.limit = this.totalNumberOfWagons;
    this.request.offset = 0;
    this.wagonviewService
      .getDetailedWagonList(this.request)
      .subscribe((result: WagonSearchSummaryDetailedResponse) => {
        this.fileExportService.exportFullWagonListToCsv(result.detailedSummaries);
        this.downloadInProgress = false;
      });

    this.request.limit = limit;
    this.request.offset = offset;
  }
  // #endregion
}
