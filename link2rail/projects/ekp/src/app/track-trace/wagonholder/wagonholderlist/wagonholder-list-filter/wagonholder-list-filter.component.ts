import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { ListKeyValue, MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from '@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import { VehicleKeeperSummaryRequest, VehicleKeeperSummaryResponse, VehicleSummaryForVehicleKeeper } from '../../models/ApiWagonholderList.models';
import { StorageKeys } from '@src/app/shared/services/storage/storage.service.base';
import { WagonholderService } from '../../service/wagonholder.service';
import { StringUtils } from '@src/app/shared/utils/string-utils';
import { ListFilterBase } from '@src/app/shared/utils/list-filter-base';
import { RUNNABILITIES, Runnability } from '@src/app/shared/enums/runnability';
import { AppService } from '@src/app/app.service';


export interface VehicleKeeperSummaryRequest4Storage extends VehicleKeeperSummaryRequest {
  vehicleKeeperCodesStorage?: ListKeyValue[];
  vehicleTypesStorage?: ListKeyValue[];
  damageTypesStorage?: ListKeyValue[];
  lastStatusCountryCodeStorage?: ListKeyValue[];
  lastStatusLocationNamesStorage?: ListKeyValue[];
}

@Component({
  selector: 'app-wagonholder-list-filter',
  templateUrl: './wagonholder-list-filter.component.html',
  styleUrl: './wagonholder-list-filter.component.scss'
})
export class WagonholderListFilterComponent extends ListFilterBase implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  @ViewChild('msvkc') multiselectVehicleKeeperCodes: MultiselectAutocompleteComponent;
  @ViewChild('msvt') multiselectVehicleTypes: MultiselectAutocompleteComponent;
  @ViewChild('msdt') multiselectDamageTypes: MultiselectAutocompleteComponent;
  @ViewChild('mslscc') multiselectLastStatusCountryCode: MultiselectAutocompleteComponent;
  @ViewChild('mslsln') multiselectLastStatusLocationNames: MultiselectAutocompleteComponent;

  protected multiselectParamsVehicleKeeperCodes: MultiselectAutocompleteParameters;
  protected multiselectParamsVehicleTypes: MultiselectAutocompleteParameters;
  protected multiselectParamsDamageTypes: MultiselectAutocompleteParameters;
  protected multiselectParamsLastStatusCountryCode: MultiselectAutocompleteParameters;
  protected multiselectParamsLastStatusLocationNames: MultiselectAutocompleteParameters;

  protected runnabilities: Runnability[] = RUNNABILITIES;

  protected filterForm: FormGroup;

  public vehicleSummariesForVehicleKeeper: VehicleSummaryForVehicleKeeper[] = new Array();

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private wagonholderService: WagonholderService,
    injectedAppService: AppService
  ) {
    super(injectedAppService);
    const vehicleKeeperSummaryRequest: VehicleKeeperSummaryRequest = {
      limit: ListFilterBase.DEFAULT_LIMIT,
      offset: 0,
      sort: '+vehicleNumber',
      damageTypes: null,
      vehicleNumber: null,
      lastStatusCountryCode: null,
      lastStatusLocationNames: null,
      suitableForRunning: null,
      vehicleKeeperCodes: null,
      vehicleTypes: null
    };
    this.request4Storage = null as VehicleKeeperSummaryRequest4Storage;
    this.storageKey = StorageKeys.WAGON_HOLDER_LIST_FILTER_STORAGE_KEY;
    this.request = vehicleKeeperSummaryRequest;
  }

  ngOnInit(): void {
    this.createFilterForm();
    this.restoreFilterFromStorage();
    this.initMultiselectParameters();
  }

  ngAfterViewInit(): void {
    this.addMultiselectFormsToFormGroup();
    this.setStorageValuesInForm();
    this.fetchData();
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    super.destroy();
    this.requestSubscription.unsubscribe();
  }

  protected afterCountActiveFilter(): void {

  }

  protected createFilterForm(): void {
    this.filterForm = new FormGroup({
      vehicleNumber: new FormControl(),
      suitableForRunning: new FormControl(),
      // lastStatusCountryCode: new FormControl(),
      // lastStatusLocationNames: new FormControl()
    });
  }

  private addMultiselectFormsToFormGroup(): void {
    this.filterForm.addControl('childFormVehicleKeeperCodes', this.multiselectVehicleKeeperCodes.multiselectForm);
    this.multiselectVehicleKeeperCodes.multiselectForm.setParent(this.filterForm);

    this.filterForm.addControl('childFormVehicleTypes', this.multiselectVehicleTypes.multiselectForm);
    this.multiselectVehicleTypes.multiselectForm.setParent(this.filterForm);

    this.filterForm.addControl('childFormDamageTypes', this.multiselectDamageTypes.multiselectForm);
    this.multiselectDamageTypes.multiselectForm.setParent(this.filterForm);

    this.filterForm.addControl('childFormLastStatusCountryCode', this.multiselectLastStatusCountryCode.multiselectForm);
    this.multiselectLastStatusCountryCode.multiselectForm.setParent(this.filterForm);

    this.filterForm.addControl('childFormLastStatusLocationNames', this.multiselectLastStatusLocationNames.multiselectForm);
    this.multiselectLastStatusLocationNames.multiselectForm.setParent(this.filterForm);
  }

  protected setStorageValuesInForm() {
    const request4Storage: VehicleKeeperSummaryRequest4Storage = this.request4Storage;
    // this.lastStatusCountryCode.setValue(request4Storage.lastStatusCountryCode);
    this.vehicleNumber.setValue(request4Storage.vehicleNumber);
    this.suitableForRunning.setValue(request4Storage.suitableForRunning);
    this.setMultiselectFormFields();
  }

  private setMultiselectFormFields() {
    this.vehicleKeeperCodes.setValue((this.request4Storage as VehicleKeeperSummaryRequest4Storage).vehicleKeeperCodesStorage);
    this.vehicleTypes.setValue((this.request4Storage as VehicleKeeperSummaryRequest4Storage).vehicleTypesStorage);
    this.damageTypes.setValue((this.request4Storage as VehicleKeeperSummaryRequest4Storage).damageTypesStorage);
    this.lastStatusCountryCode.setValue((this.request4Storage as VehicleKeeperSummaryRequest4Storage).lastStatusCountryCodeStorage);
    this.lastStatusLocationNames.setValue((this.request4Storage as VehicleKeeperSummaryRequest4Storage).lastStatusLocationNamesStorage);
  }

  protected filterFormToRequest4Storage() {
    let vehicleKeeperCodes4Storage = this.vehicleKeeperCodes.value as Array<ListKeyValue>;
    let vehicleKeeperCodes = null;

    if (vehicleKeeperCodes4Storage && vehicleKeeperCodes4Storage.length > 0) {
      vehicleKeeperCodes = [];
      vehicleKeeperCodes4Storage.forEach(code => vehicleKeeperCodes.push(code.key));
    }

    let vehicleTypes4Storage = this.vehicleTypes.value as Array<ListKeyValue>;
    let vehicleTypes = null;

    if (vehicleTypes4Storage && vehicleTypes4Storage.length > 0) {
      vehicleTypes = [];
      vehicleTypes4Storage.forEach(code => vehicleTypes.push(code.key));
    }

    let damageTypes4Storage = this.damageTypes.value as Array<ListKeyValue>;
    let damageTypes = null;

    if (damageTypes4Storage && damageTypes4Storage.length > 0) {
      damageTypes = [];
      damageTypes4Storage.forEach(code => damageTypes.push(code.key));
    }

    let lastStatusCountryCode4Storage = this.lastStatusCountryCode.value as Array<ListKeyValue>;
    let lastStatusCountryCode = null;

    if (lastStatusCountryCode4Storage && lastStatusCountryCode4Storage.length > 0) {
      lastStatusCountryCode = [];
      lastStatusCountryCode4Storage.forEach(code => lastStatusCountryCode.push(code.key));
    }

    let lastStatuslocationNames4Storage = this.lastStatusLocationNames.value as Array<ListKeyValue>;
    let lastStatusLocationNames = null;

    if (lastStatuslocationNames4Storage && lastStatuslocationNames4Storage.length > 0) {
      lastStatusLocationNames = [];
      lastStatuslocationNames4Storage.forEach(code => lastStatusLocationNames.push(code.key));
    }

    this.setRequest4Storage(({
      vehicleKeeperCodes: vehicleKeeperCodes,
      vehicleKeeperCodesStorage: vehicleKeeperCodes4Storage,
      vehicleNumber: StringUtils.nullOnEmptyString(this.vehicleNumber.value),
      vehicleTypes: vehicleTypes,
      vehicleTypesStorage: vehicleTypes4Storage,
      damageTypes: damageTypes,
      damageTypesStorage: damageTypes4Storage,
      suitableForRunning: StringUtils.nullOnEmptyString(this.suitableForRunning.value),
      lastStatusCountryCode: lastStatusCountryCode,
      lastStatusCountryCodeStorage: lastStatusCountryCode4Storage,
      lastStatusLocationNames: lastStatusLocationNames,
      lastStatuslocationNames4Storage: lastStatuslocationNames4Storage,
      offset: 0,
      limit: 0,
      sort: null
    } as VehicleKeeperSummaryRequest4Storage));
  }

  private initMultiselectParameters() {
    const request4Storage: VehicleKeeperSummaryRequest4Storage | null = this.request4Storage;
    this.multiselectParamsVehicleKeeperCodes = {
      i18n: {
        fieldText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Vehicle-keeper'),
        labelText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Vehicle-keeper'),
        errorText: this.translate.instant('error text')
      },
      fieldName: "vehicleKeeperCodes",
      fieldId: "vehicleKeeperCodes",
      divId: "vehicleKeeperCodesDiv",
      formControlName: "vehicleKeeperCodes",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.getVehicleKeeperCodesSuggestions(searchInput, array);
      },
      selectedItems: request4Storage && request4Storage.vehicleKeeperCodesStorage ? request4Storage.vehicleKeeperCodesStorage : []
    };
    this.multiselectParamsVehicleTypes = {
      i18n: {
        fieldText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Vehicle-type'),
        labelText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Vehicle-type'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "vehicleTypes",
      fieldId: "vehicleTypes",
      divId: "vehicleTypesDiv",
      formControlName: "vehicleTypes",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.getVehicleTypesSuggestions(searchInput, array);
      },
      selectedItems: request4Storage && request4Storage.vehicleTypesStorage ? request4Storage.vehicleTypesStorage : []
    };
    this.multiselectParamsDamageTypes = {
      i18n: {
        fieldText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Damage-Code'),
        labelText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Damage-Code'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "damageTypes",
      fieldId: "damageTypes",
      divId: "damageTypesDiv",
      formControlName: "damageTypes",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.getDamageTypesSuggestions(searchInput, array);
      },
      selectedItems: request4Storage && request4Storage.damageTypesStorage ? request4Storage.damageTypesStorage : []
    };
    this.multiselectParamsLastStatusCountryCode = {
      i18n: {
        fieldText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Location-country'),
        labelText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Location-country'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "lastStatusCountryCode",
      fieldId: "lastStatusCountryCode",
      divId: "lastStatusCountryCodeDiv",
      formControlName: "lastStatusCountryCode",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.getLastStatusCountryCode(searchInput, array);
      },
      selectedItems: request4Storage && request4Storage.lastStatusCountryCodeStorage ? request4Storage.lastStatusCountryCodeStorage : []
    };
    this.multiselectParamsLastStatusLocationNames = {
      i18n: {
        fieldText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Location'),
        labelText: this.translate.instant('Wagonholder-component.Vehiclekeeper-filter.Location'),
        errorText: this.translate.instant('error text'),
        searchPlaceholderText: this.translate.instant('ControlMultiSelect.searchPlaceholderText'),
        noDataAvailablePlaceholderText: this.translate.instant('ControlMultiSelect.noDataAvailablePlaceholderText')
      },
      fieldName: "lastStatusLocationNames",
      fieldId: "lastStatusLocationNames",
      divId: "lastStatusLocationNamesDiv",
      formControlName: "lastStatusLocationNames",

      dataCallback: (searchInput: string, array: ListKeyValue[]) => {
        this.getLastStatusLocationNames(searchInput, array);
      },
      selectedItems: request4Storage && request4Storage.lastStatusLocationNamesStorage ? request4Storage.lastStatusLocationNamesStorage : []
    };
  }

  private getVehicleKeeperCodesSuggestions(searchInput: string, array: ListKeyValue[]) {
    // TODO
    this.dummyData('VK').subscribe({
      next: (keepers) => {
        const resultList: ListKeyValue[] = [...array];
        keepers.forEach(keeper => {
          const found = resultList.find(kv => kv.key == keeper.code && kv.value == keeper.name);
          if (!found) {
            resultList.push({ key: keeper.code, value: keeper.name });
          }
        });
        this.multiselectVehicleKeeperCodes.dataList = resultList;
        return resultList;
      }
    });
  }

  private getVehicleTypesSuggestions(searchInput: string, array: ListKeyValue[]) {
    // TODO
    this.dummyData('VK').subscribe({
      next: (keepers) => {
        const resultList: ListKeyValue[] = [...array];
        keepers.forEach(keeper => {
          const found = resultList.find(kv => kv.key == keeper.code && kv.value == keeper.name);
          if (!found) {
            resultList.push({ key: keeper.code, value: keeper.name });
          }
        });
        this.multiselectVehicleTypes.dataList = resultList;
        return resultList;
      }
    });
  }

  private getDamageTypesSuggestions(searchInput: string, array: ListKeyValue[]) {
    // TODO
    this.dummyData('VK').subscribe({
      next: (damages) => {
        const resultList: ListKeyValue[] = [...array];
        damages.forEach(damage => {
          const found = resultList.find(kv => kv.key == damage.code && kv.value == damage.name);
          if (!found) {
            resultList.push({ key: damage.code, value: damage.name });
          }
        });
        this.multiselectDamageTypes.dataList = resultList;
        return resultList;
      }
    });
  }

  private getLastStatusCountryCode(searchInput: string, array: ListKeyValue[]) {
    // TODO
    this.dummyData('VK').subscribe({
      next: (keepers) => {
        const resultList: ListKeyValue[] = [...array];
        keepers.forEach(keeper => {
          const found = resultList.find(kv => kv.key == keeper.code && kv.value == keeper.name);
          if (!found) {
            resultList.push({ key: keeper.code, value: keeper.name });
          }
        });
        this.multiselectLastStatusCountryCode.dataList = resultList;
        return resultList;
      }
    });
  }

  private getLastStatusLocationNames(searchInput: string, array: ListKeyValue[]) {
    // this.wagonviewService.getRailOrdersCurrentLocations(searchInput).subscribe({
    //   next: (locations: InfrastructureLocationSummary[]) => {
    //     const resultList: ListKeyValue[] = [...array];
    //     locations.forEach(location => {
    //       const locationKey = JSON.stringify({ objectKeyAlpha: location.objectKeyAlpha, objectKeySequence: location.objectKeySequence });
    //       const found = resultList.find(kv => kv.key == locationKey && kv.value == location.name);
    //       if(!found) {
    //         resultList.push({ key: locationKey, value: location.name });
    //       }
    //     });
    //     this.multiselectCurrentLocations.dataList = resultList;
    //     return resultList;
    //   }
    // });
  }


  private dummyData(type: string): Subject<any[]> {
    let dummyData = null;
    switch (type) {
      case 'VK':
        dummyData = [{ code: 123, name: "Vehicle keeper one" }, { code: 456, name: "Vehicle keeper two" }, { code: 789, name: "Vehicle keeper three" }];
        break;
      default:
        throw "error";
    }
    const subj: Subject<any[]> = new Subject();
    setTimeout(() => {
      subj.next(dummyData);
    }, 1200);
    return subj;
  }

  protected afterStorageToRequest(): void {

  }

  protected afterRestoreFilterFromStorage(): void {

  }

  protected requestData() {
    const request: VehicleKeeperSummaryRequest = this.request;
    this.requestSubscription = this.wagonholderService.getWagonkeeperList(request).subscribe((result: VehicleKeeperSummaryResponse) => {
      if (result.offset == 0) {
        this.vehicleSummariesForVehicleKeeper = new Array();
      }
      this.vehicleSummariesForVehicleKeeper = this.vehicleSummariesForVehicleKeeper.concat(result.items);
      this.totalNumberOfElements$.next(result.total);
      if (this.vehicleSummariesForVehicleKeeper.length < result.total) {
        this.showLoadMoreButton$.next(true);
      }
      this.loadingInProgress$.next(false);
    });
  }

  protected multiselectChangeEventListener(event: Event) {
    this.onChangeFilter(event);
  }

  get vehicleKeeperCodes(): FormControl {
    return this.multiselectVehicleKeeperCodes.multiselectForm.get(this.multiselectParamsVehicleKeeperCodes.fieldId) as FormControl;
  }

  get vehicleNumber(): FormControl {
    return this.filterForm.get("vehicleNumber") as FormControl;
  }

  get vehicleTypes(): FormControl {
    return this.multiselectVehicleTypes.multiselectForm.get(this.multiselectParamsVehicleTypes.fieldId) as FormControl;
  }

  get suitableForRunning(): FormControl {
    return this.filterForm.get("suitableForRunning") as FormControl;
  }

  get damageTypes(): FormControl {
    return this.multiselectDamageTypes.multiselectForm.get(this.multiselectParamsDamageTypes.fieldId) as FormControl;
  }

  get lastStatusCountryCode(): FormControl {
    return this.multiselectLastStatusCountryCode.multiselectForm.get(this.multiselectParamsLastStatusCountryCode.fieldId) as FormControl;
  }

  get lastStatusLocationNames(): FormControl {
    return this.multiselectLastStatusLocationNames.multiselectForm.get(this.multiselectParamsLastStatusLocationNames.fieldId) as FormControl;
  }
}
