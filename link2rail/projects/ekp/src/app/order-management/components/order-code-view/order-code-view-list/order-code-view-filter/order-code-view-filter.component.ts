// Angular Imports
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, map, Subject, switchMap } from 'rxjs';

// Third-party Imports
import { TranslateService } from '@ngx-translate/core';

// App-Level Services
import { AppService } from '@src/app/app.service';
import { FileExportService } from '@src/app/shared/services/file-export/file-export.service';

// Shared Imports
import { StorageKeys } from '@src/app/shared/services/storage/storage.service.base';
import { ListFilterBase } from '@src/app/shared/utils/list-filter-base';
import { countryFormatNameCode } from '@src/app/shared/constants/Constants';

// Shared Components and Form Dialogs
import { ListKeyValue, MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';

// Models (Entities used in the Component)
import { StationType } from '@src/app/trainorder/models/location.models';
import { PartnerRole, PartnerSummary } from '../../../wagon-view/models/api-wagon-list';
import { DangerousGood, NHMCodes, RailOrderCodeSearchSummary, RailOrderCodeSummaryRequest, RailOrderCodeSummaryRequest4Storage, RailOrderCodeSummaryResponse } from '../../models/ApiRailOrderCode.model';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { LocationRequest, TemplateSummary } from '../../../../models/rail-order-api';
import { CommercialLocationSummary } from '@src/app/order-management/models/om-internal-api';

// Custom Services and Utilities
import { RailOrderCodeSearchService } from '../../service/rail-order-code-search.service';

@Component({
  selector: 'app-order-code-view-filter',
  templateUrl: './order-code-view-filter.component.html',
  styleUrl: './order-code-view-filter.component.scss'
})

export class OrderCodeViewFilterComponent extends ListFilterBase {
  @ViewChild('mstc') multiselectTemplateCode: MultiselectAutocompleteComponent;
  @ViewChild('msnhm') multiselectNHM: MultiselectAutocompleteComponent;
  @ViewChild('msun') multiselectUN: MultiselectAutocompleteComponent;
  @ViewChild('msss') multiselectSendingStation: MultiselectAutocompleteComponent;
  @ViewChild('msrs') multiselectReceivingStation: MultiselectAutocompleteComponent;
  @ViewChild('msconsigner') multiselectConsignor: MultiselectAutocompleteComponent;
  @ViewChild('msconsignee') multiselectConsignee: MultiselectAutocompleteComponent;
  @ViewChild('mssendingstationcountrycode') multiselectSendingStationCountryCode: MultiselectAutocompleteComponent;
  @ViewChild('msreceivingstationcountrycode') multiselectReceivingStationCountryCode: MultiselectAutocompleteComponent;

  public railOrderCodes: RailOrderCodeSearchSummary[] = [];

  protected multiselectAutocompleteParameterstemplateNumber: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersNHM: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersUN: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersReceiving: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersSending: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersConsignor: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersConsignee: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersSendingStationCountryCode: MultiselectAutocompleteParameters;
  protected multiselectAutocompleteParametersReceivingStationCountryCode: MultiselectAutocompleteParameters;
  protected totalNumberOfOrders: number = 0;
  protected totalNumberOfOrdersfound: number = 0;
  protected filterForm: FormGroup;
  protected loadingInProgress: boolean;

  private debounceTimeValue: number = 500;
  private templateNumberSubject = new Subject<string>();
  private nhmCodesSubject = new Subject<string>();
  private unCodesSubject = new Subject<string>();
  private sendingStationSubject = new Subject<string>();
  private receivingStationSubject = new Subject<string>();
  private consignorSubject = new Subject<string>();
  private consigneeSubject = new Subject<string>();
  private availableSenderIsoCountryCodesSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private availableDeliveryIsoCountryCodesSubject = new Subject<{ searchInput: string, array: ListKeyValue[] }>();
  private availableSenderIsoCountryCodes: ListKeyValue[] = [];
  private availableDeliveryIsoCountryCodes: ListKeyValue[] = [];

  constructor(appService: AppService,
    private railOrderCodeSearchService: RailOrderCodeSearchService,
    private translate: TranslateService,
    private fileExportService: FileExportService
  ) {
    super(appService, StorageKeys.ORDER_CODE_VIEW_FILTER_STORAGE_KEY);
    this.createFilterForm();
  }

  ngOnInit(): void {
    this.addFilterPropertiesToBeIgnored([]);
    const railOrderCodeSummaryRequest: RailOrderCodeSummaryRequest = {
      templateNumber: '',
      orderTemplateNumbers: [],
      sendingStations: [],
      receivingStations: [],
      consignorProfiles: [],
      consigneeProfiles: [],
      nhmCodes: [],
      unCodes: [],
      sendingStationCountryCodes: [],
      receivingStationCountryCodes: [],
      customerProfiles: [],
      offset: 0,
      sort: null,
      limit: ListFilterBase.DEFAULT_LIMIT

    };
    this.request = railOrderCodeSummaryRequest;

    this.setMultiselectParamsTemplateNumber();
    this.setMultiselectParamsNHM();
    this.setMultiselectParamsUN();
    this.setMultiselectParamsSendingStation();
    this.setMultiselectParamsReceivingStation();
    this.setMultiselectParamsConsignor();
    this.setMultiselectParamsConsignee();
    this.setMultiselectParamsSendingStationCountryCode();
    this.setMultiselectParamsReceivingStationCountryCode();
    this.setupSearchSubjects();
  }

  ngAfterViewInit(): void {
    this.registerForLoadingStatusChanges();
    this.restoreFilterFromStorage();
    this.setStorageValuesInForm();
    this.storageToRequest();
    this.fetchData();
  }

  private registerForLoadingStatusChanges(): void {
    this.loadingInProgress$.subscribe(loading => {
      this.loadingInProgress = loading;
    });
  }

  protected multiselectChangeEventListener($event: any) {
    this.onChangeFilter($event);
  }

  protected createFilterForm(): void {
    this.filterForm = new FormGroup({
      templateNumber: new FormControl(''),
      consignerName: new FormControl(''),
      sendingCountry: new FormControl(''),
      sendingStation: new FormControl(''),
      nhmCodes: new FormControl(''),
      unCodes: new FormControl(''),
      consigneeName: new FormControl(''),
      receivingCountry: new FormControl(''),
      receivingStation: new FormControl('')
    });
  }

  protected setStorageValuesInForm(): void {
    this.setOrderTemplateNamesFromStorage();
    this.setNhmCodesFromStorage()
    this.setUnCodesFromStorage()
    this.setSendingStationsFromStorage();
    this.setReceivingStationsFromStorage();
    this.setConsignorFromStorage();
    this.setConsigneeFromStorage();
    this.setSendingStationCountryCodeFromStorage();
    this.setReceivingStationCountryCodeFromStorage();
  }

  protected filterFormToRequest4Storage(): void {
    const sendingStations = this.getSelectedSendingStations();
    const sendingStationsCode = this.getSendingStationsCode();
    const sendingStationsSearchInput = this.multiselectSendingStation.searchInput?.length > 0 ? this.multiselectSendingStation.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationsSearchInput;
    const receivingStations = this.getSelectedReceivingStations();
    const receivingStationsCode = this.getReceivingStationsCode();
    const receivingStationsSearchInput = this.multiselectReceivingStation.searchInput?.length > 0 ? this.multiselectReceivingStation.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationsSearchInput;
    const consignorProfiles = this.getSelectedConsignors();
    const consignorProfilesCode = this.getSelectedConsignorProfilesCode();
    const consigneeProfiles = this.getSelectedConsignees();
    const consigneeProfilesCode = this.getSelectedConsigneeProfilesCode();
    const consignorSearchInput = this.multiselectConsignor.searchInput?.length > 0 ? this.multiselectConsignor.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).consignorSearchInput;
    const consigneeSearchInput = this.multiselectConsignee.searchInput?.length > 0 ? this.multiselectConsignee.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).consigneeSearchInput;
    const orderTemplateNumber = this.getSelectedOrderTemplateNumber();
    const orderTemplateNumberSearchInput = this.multiselectTemplateCode.searchInput?.length > 0 ? this.multiselectTemplateCode.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).templateNumberSearchInput;
    const templateNumberArray = this.getOrderTemplateNumbers();
    const nhmCodes = this.getSelectedNhmCodes();
    const nhmCodesSearchInput = this.multiselectNHM.searchInput?.length > 0 ? this.multiselectNHM.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).nhmCodesSearchInput;
    const nhmCodesArray = this.getNhmCodes();
    const unCodes = this.getSelectedUnCodes();
    const unCodesSearchInput = this.multiselectUN.searchInput?.length > 0 ? this.multiselectUN.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).unCodesSearchInput;
    const unCodesArray = this.getUnCodes();
    const sendingStationCountryCodesInput = this.multiselectSendingStationCountryCode.searchInput?.length > 0 ? this.multiselectSendingStationCountryCode.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationCountryCodesSearchInput;
    const sendingStationCountryCodesStorage = this.getSelectedSendingStationCountryCode();
    const sendingStationCountryCodesKeys = this.getSelectedSendingStationCountryCodeKeys();
    const receivingStationCountryCodesInput = this.multiselectReceivingStationCountryCode.searchInput?.length > 0 ? this.multiselectReceivingStationCountryCode.searchInput : (this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationCountryCodesSearchInput;
    const receivingStationCountryCodesStorage = this.getSelectedReceivingStationCountryCode();
    const receivingStationCountryCodesKeys = this.getSelectedReceivingStationCountryCodeKeys();

    this.setRequest4Storage(({
      orderTemplateNumbers: orderTemplateNumber,
      templateNumberSearchInput: orderTemplateNumberSearchInput,
      templateNumberArray: templateNumberArray,
      nhmCodes: nhmCodes,
      nhmCodesSearchInput: nhmCodesSearchInput,
      nhmCodesArray: nhmCodesArray,
      unCodes: unCodes,
      unCodesSearchInput: unCodesSearchInput,
      unCodesArray: unCodesArray,
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

      // Rename these to match interface exactly:
      sendingStationCountryCodesSearchInput: sendingStationCountryCodesInput,
      receivingStationCountryCodesSearchInput: receivingStationCountryCodesInput,
      sendingStationCountryCodes: sendingStationCountryCodesKeys,
      receivingStationCountryCodes: receivingStationCountryCodesKeys,
      sendingStationCountryCodesStorage: sendingStationCountryCodesStorage,
      receivingStationCountryCodesStorage: receivingStationCountryCodesStorage,

      offset: this.offset,
      limit: this.limit,
      sort: this.request?.sort,
    } as RailOrderCodeSummaryRequest4Storage
    ));
  }
  getUnCodes() {
    if (this.multiselectUNControl) {
      return this.multiselectUNControl.value as Array<ListKeyValue>;
    }
    return [];
  }
  getNhmCodes() {
    if (this.multiselectNHMControl) {
      return this.multiselectNHMControl.value as Array<ListKeyValue>;
    }
    return [];
  }
  getOrderTemplateNumbers() {
    if (this.multiselectTemplatCodeControl) {
      return this.multiselectTemplatCodeControl.value as Array<ListKeyValue>;
    }
    return [];
  }

  private getSelectedOrderTemplateNumber(): string[] {
    const result: string[] = [];
    if (this.multiselectTemplatCodeControl) {
      const codes4Storage = this.multiselectTemplatCodeControl.value as Array<ListKeyValue>;
      if (codes4Storage.length > 0) {
        for (const item of codes4Storage) {
          const TemplateNumberRequest: string = item.key;
          result.push(TemplateNumberRequest);
        }
      }
    }
    return result;
  }

  private getSelectedUnCodes(): string[] {
    const result: string[] = [];
    if (this.multiselectUNControl) {
      const codes4Storage = this.multiselectUNControl.value as Array<ListKeyValue>;
      if (codes4Storage.length > 0) {
        for (const item of codes4Storage) {
          const UNCodesRequest: string = item.key;
          result.push(UNCodesRequest);
        }
      }
    }
    return result;
  }

  getSelectedNhmCodes(): string[] {
    const result: string[] = [];
    if (this.multiselectNHMControl) {
      const codes4Storage = this.multiselectNHMControl.value as Array<ListKeyValue>;
      if (codes4Storage.length > 0) {
        for (const item of codes4Storage) {
          result.push(item.key);
        }
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

  private getReceivingStationsCode(): Array<ListKeyValue> {
    if (this.multiselectReceivingStationControl) {
      return this.multiselectReceivingStationControl.value as Array<ListKeyValue>;
    }
    return [];
  }

  protected requestData(): void {
    this.requestSubscription = this.railOrderCodeSearchService.getRailOrderCodeList(this.request as RailOrderCodeSummaryRequest).subscribe({
      next: (result: RailOrderCodeSummaryResponse) => {
        if (result.offset === 0) {
          this.railOrderCodes = [];
        }
        if (result['summaries']) {
          for (const item of result['summaries']) {
            this.railOrderCodes.push(item);
          }
        }
        this.totalNumberOfOrdersfound = result.total;
        this.totalNumberOfOrders = this.railOrderCodes?.length;
        this.totalNumberOfElements$.next(result.total);
        this.showLoadMoreButton$.next(false);
        if (this.railOrderCodes.length < result.total) {
          this.showLoadMoreButton$.next(true);
        } else {
          this.showLoadMoreButton$.next(false);
        }
        this.loadingInProgress$.next(false);
      }
    });
  }

  private getSelectedSendingStationCountryCode(): Array<ListKeyValue> {
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

  private getSelectedReceivingStationCountryCode(): Array<ListKeyValue> {
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
  protected saveCompleteListToCSV() {
    this.downloadInProgress = true;
    var limit = this.request.limit;
    var offset = this.request.offset;
    this.request.limit = this.totalNumberOfOrdersfound;
    this.request.offset = 0;

    this.railOrderCodeSearchService.getRailOrderCodeList(this.request as RailOrderCodeSummaryRequest).subscribe({
      next: (result: RailOrderCodeSummaryResponse) => {
        const railOrderCodes: RailOrderCodeSearchSummary[] = [];
        if (result['summaries']) {
          for (let item of result['summaries']) {
            railOrderCodes.push(item);
          }
        }
        this.fileExportService.exportRailOrderCodesToCsv(railOrderCodes);
        this.downloadInProgress = false;
      }, error: (err: Error) => {
        console.error(err);
        this.downloadInProgress = false;
      }
    });

    this.request.limit = limit;
    this.request.offset = offset;

  }

  protected activeFilterAmount(): number {
    return this.activeFilterCount;
  }

  protected setLoadMoreButtonState(): void {
    if (this.railOrderCodes && this.totalNumberOfOrders > 0 && this.totalNumberOfOrders > this.railOrderCodes.length) {
      this.showLoadMoreButton$.next(true);
    } else {
      this.showLoadMoreButton$.next(false);
    }
  }

  protected resetFilterConditions(): void {
    this.multiselectTemplatCodeControl.setValue('');
    this.multiselectNHMControl.setValue('');
    this.multiselectUNControl.setValue('');
    this.multiselectSendingStationControl.setValue('');
    this.multiselectReceivingStationControl.setValue('');
    this.multiselectConsigneeControl.setValue('');
    this.multiselectConsignorControl.setValue('');
    this.multiselectSendingStationCountryCodeControl.setValue('');
    this.multiselectSendingStationCountryCodeControl.setValue('');
    this.resetAllFilters();
  }

  //#region Getter

  get templateNumber() {
    return this.filterForm.get('templateNumber') as FormControl;
  }

  get nhmCodes() {
    return this.filterForm.get('nhmCodes') as FormControl;
  }

  get unCodes() {
    return this.filterForm.get('unCodes') as FormControl;
  }

  get consignerName() {
    return this.filterForm.get('consignerName') as FormControl;
  }

  get consigneeName() {
    return this.filterForm.get('consigneeName') as FormControl;
  }

  get sendingStation() {
    return this.filterForm.get('sendingStation') as FormControl;
  }

  get receivingStation() {
    return this.filterForm.get('receivingStation') as FormControl;
  }

  get multiselectTemplatCodeControl(): FormControl {
    return this.multiselectTemplateCode?.multiselectForm.get(this.multiselectAutocompleteParameterstemplateNumber.fieldId) as FormControl;
  }

  get multiselectNHMControl(): FormControl {
    return this.multiselectNHM?.multiselectForm.get(this.multiselectAutocompleteParametersNHM.fieldId) as FormControl;
  }

  get multiselectUNControl(): FormControl {
    return this.multiselectUN?.multiselectForm.get(this.multiselectAutocompleteParametersUN.fieldId) as FormControl;
  }

  get multiselectConsignorControl(): FormControl {
    return this.multiselectConsignor?.multiselectForm.get(this.multiselectAutocompleteParametersConsignor.fieldId) as FormControl;
  }

  get multiselectSendingStationControl(): FormControl {
    return this.multiselectSendingStation?.multiselectForm.get(this.multiselectAutocompleteParametersSending.fieldId) as FormControl;
  }

  get multiselectConsigneeControl(): FormControl {
    return this.multiselectConsignee?.multiselectForm.get(this.multiselectAutocompleteParametersConsignee.fieldId) as FormControl;
  }

  get multiselectReceivingStationControl(): FormControl {
    return this.multiselectReceivingStation?.multiselectForm.get(this.multiselectAutocompleteParametersReceiving.fieldId) as FormControl;
  }


  get multiselectSendingStationCountryCodeControl(): FormControl {
    return this.multiselectSendingStationCountryCode?.multiselectForm.get(this.multiselectAutocompleteParametersSendingStationCountryCode.fieldId) as FormControl;
  }
  get multiselectReceivingStationCountryCodeControl(): FormControl {
    return this.multiselectReceivingStationCountryCode?.multiselectForm.get(this.multiselectAutocompleteParametersReceivingStationCountryCode.fieldId) as FormControl;
  }

  //#endregion
  //#region MultiselectParams

  private setupSearchSubjects() {
    this.templateNumberSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(searchInput => this.railOrderCodeSearchService.getRailOrdersTemplate(searchInput))
    ).subscribe(template => {
      const resultList: ListKeyValue[] = [];
      template.forEach(template => {
        resultList.push({ key: template.templateNumber, value: "(" + template.templateNumber + ")" + template.templateName });
      });
      this.multiselectTemplateCode.dataList = resultList;
    });

    this.nhmCodesSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(searchInput => searchInput.length >= 3 ? this.railOrderCodeSearchService.getGoods(searchInput, 6) : [])
    ).subscribe(result => {
      const resultList: ListKeyValue[] = [];
      result.forEach(nhmCode => {
        resultList.push({ key: nhmCode.nhmCode, value: "(" + nhmCode.nhmCode + ")" + nhmCode.description });
      });
      this.multiselectNHM.dataList = resultList;
    });

    this.unCodesSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(searchInput => searchInput.length >= 3 ? this.railOrderCodeSearchService.getDangerousGoods(searchInput) : [])
    ).subscribe(result => {
      const resultList: ListKeyValue[] = [];
      result.forEach(unCode => {
        resultList.push({ key: unCode.unCode, value: "(" + unCode.unCode + ")" + unCode.unDescription });
      });
      this.multiselectUN.dataList = resultList;
    });

    this.sendingStationSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(searchInput => this.railOrderCodeSearchService.getRailOrdersCodeCommercialLocations(searchInput, StationType.DEPARTURE))
    ).subscribe(locations => {
      const resultList: ListKeyValue[] = [];
      this.prepareDataListForMultiselect(resultList, locations);
      this.multiselectSendingStation.dataList = resultList;
    });

    this.receivingStationSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(searchInput => this.railOrderCodeSearchService.getRailOrdersCodeCommercialLocations(searchInput, StationType.DESTINATION))
    ).subscribe(locations => {
      const resultList: ListKeyValue[] = [];
      this.prepareDataListForMultiselect(resultList, locations);
      this.multiselectReceivingStation.dataList = resultList;
    });

    this.consignorSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(searchInput => this.railOrderCodeSearchService.getRailOrdersCodePartners(searchInput, PartnerRole.CONSIGNOR))
    ).subscribe(partners => {
      const resultList: ListKeyValue[] = [];
      partners.forEach(partner => {
        const partnerKey = JSON.stringify({ partnerId: partner.partnerId, sgvId: partner.sgvId });
        const found = resultList.find(kv => kv.key == partnerKey && kv.value == partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")");
        if (!found) {
          resultList.push({ key: partnerKey, value: partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")" });
        }
      });
      this.multiselectConsignor.dataList = resultList;
    });

    this.consigneeSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(searchInput => this.railOrderCodeSearchService.getRailOrdersCodePartners(searchInput, PartnerRole.CONSIGNEE))
    ).subscribe(partners => {
      const resultList: ListKeyValue[] = [];
      partners.forEach(partner => {
        const partnerKey = JSON.stringify({ partnerId: partner.partnerId, sgvId: partner.sgvId });
        const found = resultList.find(kv => kv.key == partnerKey && kv.value == partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")");
        if (!found) {
          resultList.push({ key: partnerKey, value: partner.name + "(" + partner.sgvId + "/" + partner.partnerId + ")" });
        }
      });
      this.multiselectConsignee.dataList = resultList;
    });

    this.availableSenderIsoCountryCodesSubject.pipe(
      debounceTime(this.debounceTimeValue),
      switchMap(({ searchInput, array }) =>
        this.railOrderCodeSearchService.getRailOrdersTemplatesCountryCodes(searchInput, StationType.DEPARTURE).pipe(
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
        this.railOrderCodeSearchService.getRailOrdersTemplatesCountryCodes(searchInput, StationType.DESTINATION).pipe(
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


  // TemplateNumber
  private setMultiselectParamsTemplateNumber(): void {
    this.multiselectAutocompleteParameterstemplateNumber = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Template-number'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Template-number'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "templateNumber",
      fieldId: "templateNumber",
      divId: "templateNumberDiv",
      formControlName: "templateNumber",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.templateNumberSubject.next(searchInput);
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).templateNumberStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).templateNumberStorage : []
    };
  }

  // NHM
  private setMultiselectParamsNHM(): void {
    this.multiselectAutocompleteParametersNHM = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Label.NHM-code'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Label.NHM-code'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "nhmCodes",
      fieldId: "nhmCodes",
      divId: "nhmCodesDiv",
      formControlName: "nhmCodes",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.nhmCodesSubject.next(searchInput);
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).nhmCodesStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).nhmCodesStorage : []
    };
  }

  // UN
  private setMultiselectParamsUN(): void {
    this.multiselectAutocompleteParametersUN = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Label.UN-number'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Label.UN-number'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "unCodes",
      fieldId: "unCodes",
      divId: "unCodesDiv",
      formControlName: "unCodes",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.unCodesSubject.next(searchInput);
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).unCodesStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).unCodesStorage : []
    };
  }


  // SendingStation
  private setMultiselectParamsSendingStation(): void {
    this.multiselectAutocompleteParametersSending = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Sending-station'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Sending-station'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "sendingStation",
      fieldId: "sendingStation",
      divId: "sendingStationDiv",
      formControlName: "sendingStation",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.sendingStationSubject.next(searchInput);
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationsStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationsStorage : []
    };
  }

  // ReceivingStation
  private setMultiselectParamsReceivingStation(): void {
    this.multiselectAutocompleteParametersReceiving = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Receiving-station'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Receiving-station'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect..noDataAvailablePlaceholderText')
      },
      fieldName: "receivingStation",
      fieldId: "receivingStation",
      divId: "receivingStationDiv",
      formControlName: "receivingStation",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.receivingStationSubject.next(searchInput);
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationsStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationsStorage : []
    };
  }
  // Consignor
  private setMultiselectParamsConsignor() {
    this.multiselectAutocompleteParametersConsignor = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Consignor-name'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Consignor-name'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "consignor",
      fieldId: "consignor",
      divId: "consignorDiv",
      formControlName: "consignor",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.consignorSubject.next(searchInput);
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).consignorProfilesStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).consignorProfilesStorage : []
    };
  }

  private setMultiselectParamsConsignee() {
    this.multiselectAutocompleteParametersConsignee = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Consignee-name'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Label.Consignee-name'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "consignee",
      fieldId: "consignee",
      divId: "consigneeDiv",
      formControlName: "consignee",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.consigneeSubject.next(searchInput);
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).consigneeProfilesStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).consigneeProfilesStorage : []
    };
  }
  private setMultiselectParamsSendingStationCountryCode(): void {
    this.multiselectAutocompleteParametersSendingStationCountryCode = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Place-holder.senderIsoCountryCode'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Place-holder.senderIsoCountryCode'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "senderisocountrycodesname",
      fieldId: "senderisocountrycodesid",
      divId: "senderisocountrycodesdiv",
      formControlName: "SenderIsoCountryCodes",
      minQueryLength: 3,

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {

        this.availableSenderIsoCountryCodesSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationCountryCodesStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationCountryCodesStorage : [],
    };
  }

  private setMultiselectParamsReceivingStationCountryCode(): void {
    this.multiselectAutocompleteParametersReceivingStationCountryCode = {
      i18n: {
        fieldText: this.translate.instant('Order-Management.Order-code-view-filter.Place-holder.deliveryIsoCountryCode'),
        labelText: this.translate.instant('Order-Management.Order-code-view-filter.Place-holder.deliveryIsoCountryCode'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "deliveryisocountrycodesname",
      fieldId: "deliveryisocountrycodesid",
      divId: "deliveryisocountrycodesdiv",
      formControlName: "DeliveryIsoCountryCodes",
      minQueryLength: 3,

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {

        this.availableDeliveryIsoCountryCodesSubject.next({ searchInput, array });
      },
      selectedItems: this.request4Storage && (this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationsStorage ? (this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationCountryCodesStorage : [],
    };
  }

  //#endregion
  //#region getSuggestions
  private getSendingStationCountryCodeSuggestions(): void {
    this.multiselectSendingStationCountryCode.dataList = this.availableSenderIsoCountryCodes;
  }

  private getReceivingStationCountryCodeSuggestions(): void {
    this.multiselectReceivingStationCountryCode.dataList = this.availableDeliveryIsoCountryCodes;
  }
  private getTemplateNumberSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput) {
      this.railOrderCodeSearchService.getRailOrdersTemplate(searchInput).subscribe({
        next: (template: TemplateSummary[]) => {
          const resultList: ListKeyValue[] = [...array];
          template.forEach(template => {

            resultList.push({ key: template.templateNumber, value: "(" + template.templateNumber + ") " + template.templateName });
          });
          this.multiselectTemplateCode.dataList = resultList
          return resultList;
        }
      });
    }
  }

  private getNhmCodesSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput && searchInput.length >= 3) {
      this.railOrderCodeSearchService.getGoods(searchInput, 6).subscribe({
        next: (result: NHMCodes[]) => {
          const resultList: ListKeyValue[] = [...array];
          result.forEach(nhmCode => {
            resultList.push({ key: nhmCode.nhmCode, value: "(" + nhmCode.nhmCode + ")" + nhmCode.description });
          });
          this.multiselectNHM.dataList = resultList;
          return resultList;
        }
      });
    }
  }

  private getUnCodesSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput && searchInput.length >= 3) {
      this.railOrderCodeSearchService.getDangerousGoods(searchInput).subscribe({
        next: (result: DangerousGood[]) => {
          const resultList: ListKeyValue[] = [...array];
          result.forEach(unCode => {
            resultList.push({ key: unCode.unCode, value: "(" + unCode.unCode + ")" + unCode.unDescription });
          });
          this.multiselectUN.dataList = resultList;
          return resultList;
        }
      });
    }
  }

  private getSendingStationSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput) {
      this.railOrderCodeSearchService.getRailOrdersCodeCommercialLocations(searchInput, StationType.DEPARTURE).subscribe({
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
    if (searchInput) {
      this.railOrderCodeSearchService.getRailOrdersCodeCommercialLocations(searchInput, StationType.DESTINATION).subscribe({
        next: (locations: CommercialLocationSummary[]) => {
          const resultList: ListKeyValue[] = [...array];
          this.prepareDataListForMultiselect(resultList, locations);
          this.multiselectReceivingStation.dataList = resultList;
          return resultList;
        }
      });
    }
  }

  private getConsignorSuggestions(searchInput: string, array: ListKeyValue[]) {
    if (searchInput) {
      this.railOrderCodeSearchService.getRailOrdersCodePartners(searchInput, PartnerRole.CONSIGNOR).subscribe({
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
    if (searchInput) {
      this.railOrderCodeSearchService.getRailOrdersCodePartners(searchInput, PartnerRole.CONSIGNEE).subscribe({
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

  //#endregion

  private setOrderTemplateNamesFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).templateNumberArray);
    if (valuesFromStorage) {
      this.multiselectTemplatCodeControl.setValue(valuesFromStorage);
    }
    this.getTemplateNumberSuggestions((this.request4Storage as RailOrderCodeSummaryRequest4Storage).templateNumberSearchInput, []);
  }

  private setNhmCodesFromStorage() {
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).nhmCodesArray);
    if (valuesFromStorage) {
      this.multiselectNHMControl.setValue(valuesFromStorage);
    }
    this.getNhmCodesSuggestions((this.request4Storage as RailOrderCodeSummaryRequest4Storage).nhmCodesSearchInput, []);
  }


  private setUnCodesFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).unCodesArray);
    if (valuesFromStorage) {
      this.multiselectUNControl.setValue(valuesFromStorage);
    }
    this.getUnCodesSuggestions((this.request4Storage as RailOrderCodeSummaryRequest4Storage).unCodesSearchInput, []);
  }

  private setConsignorFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).consignorProfilesCode);
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
    this.getConsignorSuggestions((this.request4Storage as RailOrderCodeSummaryRequest4Storage).consignorSearchInput, []);
  }

  private setConsigneeFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).consigneeProfilesCode);
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
    this.getConsigneeSuggestions((this.request4Storage as RailOrderCodeSummaryRequest4Storage).consigneeSearchInput, []);
  }
  private setSendingStationCountryCodeFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationCountryCodesStorage);
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
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationCountryCodesStorage);
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
    this.getReceivingStationCountryCodeSuggestions();
  }
  private setSendingStationsFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationsCode);
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
    this.getSendingStationSuggestions((this.request4Storage as RailOrderCodeSummaryRequest4Storage).sendingStationsSearchInput, []);
  }

  private setReceivingStationsFromStorage(): void {
    const valuesFromStorage = ((this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationsCode);
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
    this.getReceivingStationSuggestions((this.request4Storage as RailOrderCodeSummaryRequest4Storage).receivingStationsSearchInput, []);
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

  private prepareDataListForMultiselect(
    resultList: ListKeyValue[],
    locations: CommercialLocationSummary[]
  ): void {
    locations.forEach((location) => {
      const key = JSON.stringify({
        locationCode: location.locationCode,
        authority: location.authority
      });

      // Skip if this key already exists
      if (resultList.some(kv => kv.key === key)) {
        return;
      }

      const listKeyValue: ListKeyValue = { key };
      listKeyValue.value = location.locationName
      if (location.locationCode) {
        listKeyValue.value += ` (${location.locationCode})`;
      }
      resultList.push(listKeyValue);
    });
  }
}
