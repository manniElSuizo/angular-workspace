import { AfterViewInit, ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { SectionName } from '../../enums/order-enums';
import { initailDeliveryPoint, initialAcceptancePoint, initialLoadingPoint, initialOperationalTransportConditions, RailOrder, LoadingPoint as RailOrderLoadingPoint } from '../../../../models/rail-order-api';
import { SectionBase } from '../section.base';
import { FormControl, FormGroup } from '@angular/forms';
import { CommercialLocationSummary, Country, LoadingPoint, RailAuthority } from '@src/app/order-management/models/general-order';
import { debounceTime, Observable } from 'rxjs';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';
import { DatePipe } from '@angular/common';
import { FormFieldService } from '../../service/form-field.service';
import { AutocompleteService } from '@src/app/shared/components/form-dialog/auto-complete/auto-complete';
import moment from 'moment';
import { ValidationMode } from '../../validators/validator-field.config';
import { CommercialLocationSummaryPipe } from '@src/app/shared/pipes/commercial-location-summary.pipe';

@Component({
  selector: 'app-new-order-pickup-delivery',
  templateUrl: './new-order-pickup-delivery.component.html',
  styleUrls: ['../../new-order-main/new-order-main.component.scss']
})
export class NewOrderPickupDeliveryComponent extends SectionBase implements AfterViewInit {

  @Input() currentSectionName: SectionName;
  @Input() editMode: boolean;
  @Input() validationMode: ValidationMode;

  protected SectionName = SectionName;
  public formGroup: FormGroup;
  protected isPickupLocationVisible: boolean;

  protected isDeliveryLocationVisible: boolean;
  protected railOrder: RailOrder;
  protected shippingDateInPast: boolean = false;
  protected authorities$: Observable<RailAuthority[]>;
  protected countries$: Observable<Country[]>;
  protected countries: Country[] = [];

  protected commercialLocationSummariesPickupStations: CommercialLocationSummary[] = [];
  protected loadingPointsPickupStation: LoadingPoint[] = [];

  protected commercialLocationSummariesDeliveryStations: CommercialLocationSummary[] = [];
  protected loadingPointsDeliveryStation: LoadingPoint[] = [];

  protected pickupStationFieldName: string = 'pickupStation';
  protected deliveryStationFieldName: string = 'deliveryStation';

  private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
  private dateTimePipe: DatePipe = inject(DatePipe);
  private formFieldService: FormFieldService = inject(FormFieldService);
  protected commercialLocationSummaryPipe: CommercialLocationSummaryPipe = inject(CommercialLocationSummaryPipe);

  private selectedPointOfUnloading: { code: string, country: string } = null;
  private selectedPointOfLoading: { code: string, country: string } = null;

  constructor(private cd: ChangeDetectorRef) {
    super();
    this.loadLists();
    this.createForm();
  }

  ngAfterViewInit() {
    if (!this.editMode) {
      this.formGroup.disable();
    }
    this.cd.detectChanges();
  }

  public updateRailOrder(ro: RailOrder) {
    this.railOrder = ro;
    this.setFormValues();
    this.disableFields();
  }

  protected togglePickupLocation(): void {
    this.isPickupLocationVisible = !this.isPickupLocationVisible;
  }

  protected toggleDeliveryLocation(): void {
    this.isDeliveryLocationVisible = !this.isDeliveryLocationVisible;
  }

  private disableFields() {
    this.formFieldService.disableFields(this.formGroup, 'pickup', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
    this.formFieldService.disableFields(this.formGroup, 'delivery', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  }

  private setFormValues(): void {
    this.setFormValuesPickup();
    this.setFormValuesDelivery();
    this.setFormValuesShippingDateTime();
  }

  private setFormValuesPickup(): void {
    this.pickupLocationInfo.setValue(this.railOrder?.acceptancePoint?.information);
    this.pickupLocationCode.setValue(this.railOrder?.operationalTransportConditions?.pointOfLoading?.codeDescription);
    this.pickupLocationText.setValue(this.railOrder?.operationalTransportConditions?.pointOfLoading?.nameDescription);
    this.pickupCountry.setValue(this.railOrder?.acceptancePoint?.authority);
    this.pickupStation.setValue(this.railOrder?.acceptancePoint?.locationName, { emitEvent: false });

    if (!this.pickupCountry.value || this.pickupCountry.value < 0) {
      this.pickupStation.disable({ emitEvent: false });
    }

    if (!this.pickupStation.value) {
      this.pickupSealoadingpoint.disable({ emitEvent: false });
    }

    this.loadingPointsPickupStation = [];

    if (this.railOrder.acceptancePoint?.locationCode && this.railOrder.acceptancePoint?.authority == 80) {
      this.railOrderInternalService.getLoadingPoints(this.railOrder.acceptancePoint.locationCode).subscribe({
        next: lpList => {
          // if this.railOrder.operationalTransportConditions.pointOfLoading.code is present in railOrder
          // and the set this.railOrder.operationalTransportConditions.pointOfLoading.code is not in the list:
          // add entry to list
          // const found = lpList.findIndex(l => l.code == this.railOrder.operationalTransportConditions.pointOfLoading.code && l.countryCode == this.railOrder.operationalTransportConditions.pointOfLoading.country);
          // if (found < 0) {
          //   lpList.push({
          //     code: `${this.railOrder.operationalTransportConditions.pointOfLoading.code}`,
          //     countryCode: this.railOrder.operationalTransportConditions.pointOfLoading.country,
          //     locationNumber: null,
          //     name: this.railOrder.operationalTransportConditions.pointOfLoading.name
          //   });
          // }
          lpList.forEach(lp => this.loadingPointsPickupStation.push(lp));
          this.pickupSealoadingpointCount.setValue(lpList?.length);

          if (this.railOrder.operationalTransportConditions?.pointOfLoading?.code) {
            this.pickupSealoadingpoint.setValue(this.railOrderLoadingPointValue(this.railOrder.operationalTransportConditions.pointOfLoading), { emitEvent: false });
            this.selectedPointOfLoading = { code: this.railOrder.operationalTransportConditions.pointOfLoading.code, country: this.railOrder.operationalTransportConditions.pointOfLoading.country };
          }
        }
      });
    }
  }

  private setFormValuesDelivery(): void {
    this.deliveryLocationInfo.setValue(this.railOrder?.deliveryPoint?.information);
    this.deliveryLocationCode.setValue(this.railOrder?.operationalTransportConditions?.pointOfUnloading?.codeDescription);
    this.deliveryLocationText.setValue(this.railOrder?.operationalTransportConditions?.pointOfUnloading?.nameDescription);
    this.deliveryCountry.setValue(this.railOrder?.deliveryPoint?.authority);
    this.deliveryStation.setValue(this.railOrder.deliveryPoint?.locationName, { emitEvent: false });

    if (!this.deliveryCountry.value) {
      this.deliveryStation.disable({ emitEvent: false });
    }

    if (!this.deliveryStation.value) {
      this.deliverySealoadingpoint.disable({ emitEvent: false });
    }
    this.loadingPointsDeliveryStation = [];
    if (this.railOrder.deliveryPoint?.locationCode && this.railOrder.deliveryPoint?.authority == 80) {
      this.railOrderInternalService.getLoadingPoints(this.railOrder.deliveryPoint.locationCode).subscribe({
        next: lpList => {
          // const found = lpList.findIndex(l => l.code == this.railOrder?.operationalTransportConditions?.pointOfUnloading?.code && l.countryCode == this.railOrder?.operationalTransportConditions?.pointOfUnloading?.country);
          // if(found < 0 && this.railOrder?.operationalTransportConditions?.pointOfUnloading?.code) {
          //   lpList.push({
          //     code: `${this.railOrder.operationalTransportConditions.pointOfUnloading.code}`,
          //     countryCode: this.railOrder.operationalTransportConditions.pointOfUnloading.country,
          //     locationNumber: null,
          //     name: this.railOrder.operationalTransportConditions.pointOfUnloading.name
          //   });
          // }
          this.deliverySealoadingpointCount.setValue(lpList?.length);
          lpList.forEach(lp => this.loadingPointsDeliveryStation.push(lp));

          if (this.railOrder?.operationalTransportConditions?.pointOfUnloading?.code) {
            this.deliverySealoadingpoint.setValue(this.railOrderLoadingPointValue(this.railOrder.operationalTransportConditions.pointOfUnloading), { emitEvent: false });
            this.selectedPointOfUnloading = { code: this.railOrder.operationalTransportConditions.pointOfUnloading.code, country: this.railOrder.operationalTransportConditions.pointOfUnloading.country };
          }
        }
      });
    }
  }

  private setFormValuesShippingDateTime() {
    this.shippingDate.setValue(this.dateTimePipe.transform(this.railOrder.shippingTimestamp, 'YYYY-MM-dd'));
    this.shippingTime.setValue(this.dateTimePipe.transform(this.railOrder.shippingTimestamp, 'HH:mm'));
  }


  // INFO:
  // Acceptance, Loading, Übernahme, pickup
  // and
  // Delivery, Unloading, Ablieferung
  private createForm(): void {
    this.formGroup = new FormGroup({
      pickupCountry: new FormControl(),
      pickupStation: new FormControl(),
      pickupSealoadingpoint: new FormControl(),
      pickupSealoadingpointCount: new FormControl(),
      pickupLocationInfo: new FormControl(),
      pickupLocationCode: new FormControl(),
      pickupLocationText: new FormControl(),
      shippingDate: new FormControl(),
      shippingTime: new FormControl(),
      deliveryLocationInfo: new FormControl(),
      deliveryLocationCode: new FormControl(),
      deliveryLocationText: new FormControl(),
      deliveryCountry: new FormControl(),
      deliveryStation: new FormControl(),
      deliverySealoadingpoint: new FormControl(),
      deliverySealoadingpointCount: new FormControl()
    });
  }

  protected updateRailOrderFromForm(): void {
    // Update railOrder with the form changes
    if (!this.railOrder.deliveryPoint && this.deliveryLocationInfo.value) {
      this.railOrder.deliveryPoint = initailDeliveryPoint();
    }
    if (this.railOrder.deliveryPoint) {
      this.railOrder.deliveryPoint.information = this.deliveryLocationInfo.value ? this.deliveryLocationInfo.value : null;
    }
    // Update pointOfLoading
    this.updatePointOfLoading()
    // Update pointOfUnloading
    this.updatePointOfUnloading()

    if (!this.railOrder.acceptancePoint && this.pickupLocationInfo.value) {
      this.railOrder.acceptancePoint = initialAcceptancePoint();
    }
    if (this.railOrder.acceptancePoint) {
      this.railOrder.acceptancePoint.information = this.pickupLocationInfo.value ? this.pickupLocationInfo.value : null;
    }

    if (this.shippingDate.value) {
      this.railOrder.shippingTimestamp = moment(this.getShippingDateTimeObj()).toISOString();
    }
  }

  private getShippingDateTimeObj(): Date {
    const date = this.shippingDate.value;
    const time = this.shippingTime.value ? this.shippingTime.value : '00:00';
    if (date) {
      return moment(date + "T" + time).toDate();
    }
    return null;
  }

  private isDateInPast(date: string, time: string): boolean {
    const combinedDateTime = new Date(`${date}T${time}`);
    return combinedDateTime < new Date();
  }

  protected isShippingDateInPast() {
    const shippingDateValue = this.shippingDate.value;
    const shippingTimeValue = this.shippingTime.value ? this.shippingTime.value : '00:00';
    if (this.shippingDate.value && this.shippingTime.value) {
      this.shippingDateInPast = this.isDateInPast(shippingDateValue, shippingTimeValue);
    } else {
      this.shippingDateInPast = false;
    }
    this.updateRailOrderFromForm();
  }

  private loadLists(): void {
    this.authorities$ = this.railOrderInternalService.getRailAuthorities();
    this.countries$ = this.railOrderInternalService.getCountries();
    this.countries$.subscribe({ next: cl => this.countries = cl });
  }

  protected onSelectPickupStation(comLoc: CommercialLocationSummary) {
    if (!comLoc) {
      this.deleteStation("pickupStation");
      return;
    }

    this.selectedPointOfLoading = null;
    this.pickupSealoadingpoint.setValue(null, { emitEvent: false });
    this.loadingPointsPickupStation = [];

    this.updateRailOrderLoadingPoints();
    // Update pointOfLoading
    this.updatePointOfLoading()
    // Update pointOfUnloading
    this.updatePointOfUnloading()

    this.onSelectionChangePickupStation(comLoc);

  }

  protected onSelectDeliveryStation(comLoc: CommercialLocationSummary) {
    if (!comLoc) {
      this.deleteStation("deliveryStation");
      return;
    }

    this.selectedPointOfUnloading = null;
    this.deliverySealoadingpoint.setValue(null);
    this.loadingPointsDeliveryStation = [];

    this.updateRailOrderLoadingPoints();
    // Update pointOfLoading
    this.updatePointOfLoading()
    // Update pointOfUnloading
    this.updatePointOfUnloading()

    this.onSelectionChangeDeliveryStation(comLoc);
  }

  //#region PickupStation event handler
  private onSelectionChangePickupStation(found: CommercialLocationSummary): void {
    this.setRailOrderAcceptancePoint(found);
    if (this.pickupCountry.value == 80) {
      this.railOrderInternalService.getLoadingPoints(found.locationCode).subscribe({
        next: lpList => {
          this.pickupSealoadingpoint.enable();
          this.loadingPointsPickupStation = lpList;
          this.pickupSealoadingpointCount.setValue(lpList?.length);
        }
      });
    }
  }

  private setRailOrderAcceptancePoint(cl: CommercialLocationSummary) {
    this.railOrder.acceptancePoint.locationCode = cl?.locationCode ? `${cl?.locationCode}` : null;
    this.railOrder.acceptancePoint.authority = cl?.uicRailAuthorityCode;
    this.railOrder.acceptancePoint.locationName = cl?.name;
    const found = this.countries.find(c => c.uicCountryCode == this.pickupCountry.value);
    this.railOrder.acceptancePoint.countryCode = found?.countryCode;
  }
  //#endregion

  //#region DeliveryStation event handler
  private onSelectionChangeDeliveryStation(cl: CommercialLocationSummary): void {
    this.updateRailOrderDeliveryPoint(cl);
    if (this.deliveryCountry.value == 80) {
      this.railOrderInternalService.getLoadingPoints(cl.locationCode).subscribe({
        next: lpList => {
          this.deliverySealoadingpoint.enable();
          this.loadingPointsDeliveryStation = lpList;
          this.deliverySealoadingpointCount.setValue(lpList?.length);
        }
      });
    }
  }

  private updateRailOrderDeliveryPoint(cl: CommercialLocationSummary) {
    this.railOrder.deliveryPoint.locationCode = cl?.locationCode ? `${cl?.locationCode}` : null;
    this.railOrder.deliveryPoint.authority = cl?.uicRailAuthorityCode;
    this.railOrder.deliveryPoint.locationName = cl?.name;
    const found = this.countries.find(c => c.uicCountryCode == this.deliveryCountry.value);
    this.railOrder.deliveryPoint.countryCode = found?.countryCode;
  }
  //#endregion

  private deleteStation(targetName: any) {
    if (targetName == "pickupStation") {
      this.pickupStation.setValue(null);
      this.selectedPointOfLoading = null;
      this.pickupSealoadingpoint.setValue(null, { emitEvent: false });
      this.pickupSealoadingpoint.disable({ emitEvent: false });
      if (this.railOrder.operationalTransportConditions) {
        this.railOrder.operationalTransportConditions.pointOfLoading = this.selectedPointOfLoading;
      }
      this.setRailOrderAcceptancePoint({ objectKeyAlpha: null, objectKeySequence: null, locationCode: null, uicRailAuthorityCode: null, name: null });
    } else if (targetName == "deliveryStation") {
      this.deliveryStation.setValue(null);
      this.selectedPointOfUnloading = null;
      this.deliverySealoadingpoint.setValue(null);
      this.deliverySealoadingpoint.disable({ emitEvent: false });
      if (this.railOrder.operationalTransportConditions) {
        this.railOrder.operationalTransportConditions.pointOfUnloading = this.selectedPointOfUnloading;
      }
      this.updateRailOrderDeliveryPoint({ objectKeyAlpha: null, objectKeySequence: null, locationCode: null, uicRailAuthorityCode: null, name: null });
    }
  }

  protected clearInput(fieldName: string) {
    this.deleteStation(fieldName);
  }

  protected loadingPointValue(lp: LoadingPoint): string {
    return `${lp.code}-${lp.countryCode}`;
  }

  protected railOrderLoadingPointValue(lp: RailOrderLoadingPoint): string {
    return `${lp.code}-${lp.country}`;
  }

  protected onChangeLoadingPoint($event: any): void {
    if (!$event.target.value || $event.target.value.length < 4) {
      if ($event.target.name == 'pickupSealoadingpoint') {
        this.selectedPointOfLoading = null;
      } else if ($event.target.name == 'deliverySealoadingpoint') {
        this.selectedPointOfUnloading = null;
      }
      this.updateRailOrderLoadingPoints();
      // Update pointOfLoading
      this.updatePointOfLoading()
      // Update pointOfUnloading
      this.updatePointOfUnloading()
      return;
    }
    const arr = $event.target.value.split("-");
    const predicate = (lp: LoadingPoint) => lp.code == arr[0] && lp.countryCode == arr[1];
    if ($event.target.name == 'pickupSealoadingpoint') {
      const found = this.loadingPointsPickupStation.find(predicate);
      this.selectedPointOfLoading = { code: found.code, country: found.countryCode };
    } else if ($event.target.name == 'deliverySealoadingpoint') {
      const found = this.loadingPointsDeliveryStation.find(predicate);
      this.selectedPointOfUnloading = { code: found.code, country: found.countryCode };
    }
    this.updateRailOrderLoadingPoints();
    // Update pointOfLoading
    this.updatePointOfLoading()
    // Update pointOfUnloading
    this.updatePointOfUnloading()
  }

  private updateRailOrderLoadingPoints(): void {
    if (this.selectedPointOfLoading || this.selectedPointOfUnloading) {
      //if (!this.railOrder.operationalTransportConditions) {
      this.railOrder.operationalTransportConditions = {};
      //}
      if (this.selectedPointOfLoading) {
        this.railOrder.operationalTransportConditions.pointOfLoading = this.selectedPointOfLoading;
      }
      if (this.selectedPointOfUnloading) {
        this.railOrder.operationalTransportConditions.pointOfUnloading = this.selectedPointOfUnloading;
      }

    }
  }

  public validate(): string[] {
    return [];
  }

  protected onChangeCountry($event) {
    // delete depending fields
    if ($event.target.name == 'pickupCountry') {
      this.pickupSealoadingpoint.setValue(null);
      this.pickupSealoadingpoint.setErrors(null, { emitEvent: false });
      this.pickupStation.setValue(null);
      this.pickupStation.disable({ emitEvent: false });
      this.pickupSealoadingpoint.disable({ emitEvent: false });
      this.commercialLocationSummariesPickupStations = new Array();
      this.loadingPointsPickupStation = new Array();
      this.railOrder.acceptancePoint = initialAcceptancePoint();
      if (this.railOrder.operationalTransportConditions?.pointOfLoading) {
        this.railOrder.operationalTransportConditions.pointOfLoading = null;
      }
      if ($event.target.value) {
        this.railOrder.acceptancePoint.countryCode = $event.target.value;
      }
    } else if ($event.target.name == 'deliveryCountry') {
      this.deliverySealoadingpoint.setValue(null);
      this.deliverySealoadingpoint.setErrors(null, { emitEvent: false });
      this.deliveryStation.setValue(null);
      this.deliveryStation.disable({ emitEvent: false });
      this.deliverySealoadingpoint.disable({ emitEvent: false });
      this.commercialLocationSummariesDeliveryStations = new Array();
      this.loadingPointsDeliveryStation = new Array();
      this.railOrder.deliveryPoint = initailDeliveryPoint();
      if (this.railOrder.operationalTransportConditions?.pointOfUnloading) {
        this.railOrder.operationalTransportConditions.pointOfUnloading = null;
      }
      if ($event.target.value) {
        this.railOrder.deliveryPoint.countryCode = $event.target.value;
      }
    }

    if (this.pickupCountry.value) {
      this.pickupStation.enable({ emitEvent: false });
    }

    if (this.deliveryCountry.value) {
      this.deliveryStation.enable({ emitEvent: false });
    }
  }

  protected get deliveryCountry(): FormControl {
    return this.formGroup.get('deliveryCountry') as FormControl;
  }

  protected get deliveryLocationInfo(): FormControl {
    return this.formGroup.get('deliveryLocationInfo') as FormControl;
  }

  protected get deliveryLocationCode(): FormControl {
    return this.formGroup.get('deliveryLocationCode') as FormControl;
  }

  protected get deliveryLocationText(): FormControl {
    return this.formGroup.get('deliveryLocationText') as FormControl;
  }

  protected get deliveryStation(): FormControl {
    return this.formGroup.get('deliveryStation') as FormControl;
  }

  protected get deliverySealoadingpoint(): FormControl {
    return this.formGroup.get('deliverySealoadingpoint') as FormControl;
  }
  protected get deliverySealoadingpointCount(): FormControl {
    return this.formGroup.get('deliverySealoadingpointCount') as FormControl;
  }

  protected get szv(): FormControl {
    return this.formGroup.get('bzv') as FormControl;
  }

  protected get pickupCountry(): FormControl {
    return this.formGroup.get('pickupCountry') as FormControl;
  }

  protected get pickupLocationInfo(): FormControl {
    return this.formGroup.get('pickupLocationInfo') as FormControl;
  }

  protected get pickupLocationCode(): FormControl {
    return this.formGroup.get('pickupLocationCode') as FormControl;
  }

  protected get shippingDate(): FormControl {
    return this.formGroup.get('shippingDate') as FormControl;
  }

  protected get shippingTime(): FormControl {
    return this.formGroup.get('shippingTime') as FormControl;
  }


  protected get pickupLocationText(): FormControl {
    return this.formGroup.get('pickupLocationText') as FormControl;
  }

  protected get pickupStation(): FormControl {
    return this.formGroup.get('pickupStation') as FormControl;
  }

  protected get pickupSealoadingpoint(): FormControl {
    return this.formGroup.get('pickupSealoadingpoint') as FormControl;
  }
  protected get pickupSealoadingpointCount(): FormControl {
    return this.formGroup.get('pickupSealoadingpointCount') as FormControl;
  }

  protected loadPickupStations($event: any): void {
    this.railOrderInternalService.getCommercialLocations($event, this.pickupCountry.value).subscribe({
      next: (clList: CommercialLocationSummary[]) => {
        // Entferne doppelte Einträge basierend auf der locationCode-Eigenschaft
        const uniqueList = clList.filter((item, index, self) =>
          index === self.findIndex((t) => t.locationCode === item.locationCode)
        );
        this.commercialLocationSummariesPickupStations = uniqueList;
      }
    });
  }

  protected loadDeliveryStations($event: any): void {
    this.railOrderInternalService.getCommercialLocations($event, this.deliveryCountry.value).subscribe({
      next: (clList: CommercialLocationSummary[]) => {
        // Entferne doppelte Einträge basierend auf der locationCode-Eigenschaft
        const uniqueList = clList.filter((item, index, self) =>
          index === self.findIndex((t) => t.locationCode === item.locationCode)
        );
        this.commercialLocationSummariesDeliveryStations = uniqueList;
      }
    });
  }

  protected updatePointOfLoading(): void {

    if (!this.railOrder.operationalTransportConditions) {
      this.railOrder.operationalTransportConditions = {};
    }

    if (this.pickupLocationCode.value && this.pickupLocationCode.value != "") {
      if (!this.railOrder.operationalTransportConditions.pointOfLoading) {
        this.railOrder.operationalTransportConditions.pointOfLoading = {
          codeDescription: this.pickupLocationCode.value
        }
      } else {
        this.railOrder.operationalTransportConditions.pointOfLoading.codeDescription = this.pickupLocationCode.value
      };
    } else {
      if (this.railOrder.operationalTransportConditions?.pointOfLoading) {
        delete this.railOrder.operationalTransportConditions.pointOfLoading.codeDescription;
      }
    }

    if (this.pickupLocationText.value && this.pickupLocationText.value != "") {
      if (!this.railOrder.operationalTransportConditions.pointOfLoading) {
        this.railOrder.operationalTransportConditions.pointOfLoading = {
          nameDescription: this.pickupLocationText.value
        }
      } else {
        this.railOrder.operationalTransportConditions.pointOfLoading.nameDescription = this.pickupLocationText.value
      };
    } else {
      if (this.railOrder.operationalTransportConditions?.pointOfLoading) {
        delete this.railOrder.operationalTransportConditions.pointOfLoading.nameDescription;
      }
    }
  }

  protected updatePointOfUnloading(): void {

    if (!this.railOrder.operationalTransportConditions) {
      this.railOrder.operationalTransportConditions = {};
    }

    if (this.deliveryLocationCode.value && this.deliveryLocationCode.value != "") {
      if (!this.railOrder.operationalTransportConditions.pointOfUnloading) {
        this.railOrder.operationalTransportConditions.pointOfUnloading = {
          codeDescription: this.deliveryLocationCode.value
        }
      } else {
        this.railOrder.operationalTransportConditions.pointOfUnloading.codeDescription = this.deliveryLocationCode.value;
      };

    } else {
      if (this.railOrder.operationalTransportConditions?.pointOfUnloading) {
        delete this.railOrder.operationalTransportConditions.pointOfUnloading.codeDescription;
      }
    }

    if (this.deliveryLocationText.value && this.deliveryLocationText.value != "") {
      if (!this.railOrder.operationalTransportConditions.pointOfUnloading) {
        this.railOrder.operationalTransportConditions.pointOfUnloading = {
          nameDescription: this.deliveryLocationText.value
        }
      } else {
        this.railOrder.operationalTransportConditions.pointOfUnloading.nameDescription = this.deliveryLocationText.value
      };
    } else {
      if (this.railOrder.operationalTransportConditions?.pointOfUnloading) {
        delete this.railOrder.operationalTransportConditions.pointOfUnloading.nameDescription;
      }
    }

  }

}
