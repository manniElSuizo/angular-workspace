import { firstValueFrom } from 'rxjs';
import { AfterViewInit, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { SectionBase } from '../section.base';
import { SectionName } from '../../enums/order-enums';
import { RailOrder, SpecialTreatmentCharging, SpecialTreatmentOrder } from '../../../../models/rail-order-api';
import { KeyValuePair } from '../../models/api-dynamic-storage';
import { CommercialLocationSummary, RailAuthority } from '@src/app/order-management/models/general-order';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';
import { NewOrderService } from '../../service/new-order.service';
import { PaymentOption } from '../../models/api-payment-type';
import { FormFieldService } from '../../service/form-field.service';
import { SpecialTreatment } from '@src/app/order-management/models/om-internal-api';

@Component({
  selector: 'app-new-order-service',
  templateUrl: './new-order-service.component.html',
  styleUrls: ['../../new-order-main/new-order-main.component.scss', './new-order-service.component.scss']
})
export class NewOrderServiceComponent extends SectionBase implements OnInit, AfterViewInit, OnDestroy {

  @Input() currentSectionName: SectionName;
  @Input() editMode: boolean;

  public formGroup: FormGroup;

  protected SectionName = SectionName;
  protected railOrder: RailOrder;
  protected locationCodeInvalid: { [index: number]: boolean } = {};
  protected serviceTypeList: KeyValuePair[] = [];
  protected prepaymentTypeList: KeyValuePair[] = [];
  protected locationCodeAutocomplete: CommercialLocationSummary[][] = [];
  protected authorityList$: Observable<RailAuthority[]> = of([]);
  protected specialTreatmentsList: SpecialTreatment[] = [];
  protected paymentOptions: PaymentOption[] = [
    { value: 'TRANSFER', label: 'Shared.Payment-transfer' },
    { value: 'PREPAID', label: 'Shared.Payment-prepayed' }
  ];

  protected ALLOWED_LENGTH_SERVICE_SPECIFICATION = 8;

  protected shownSpecialTreatmentOrders: SpecialTreatmentOrder[] = [];
  private hiddenSpecialTreatmentOrders: SpecialTreatmentOrder[] = [];
  private hiddenButInProductExtraCharge: SpecialTreatmentOrder[] = [];

  private isOrderTemplate: boolean = false;

  private subscription: Subscription = new Subscription();
  private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
  private formFieldService: FormFieldService = inject(FormFieldService);
  private newOrderService: NewOrderService = inject(NewOrderService);

  private selectedLocationCode: string = '';
  private selectedLocationName: string = '';
  private hasAC: boolean;

  constructor(private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef) {
    super();
    this.loadLists();
    this.createForm();
  }

  ngOnInit(): void {
    // this.fetchCommercialServiceCodes();
    this.subscription.add(
      this.formGroup.get('authority')?.valueChanges.subscribe((authorityValue) => {
        const locationCodeControl = this.formGroup.get('locationCode');
        if (authorityValue && !this.hasAC) {
          locationCodeControl?.enable();
        } else {
          locationCodeControl?.disable();
          if(!this.hasAC) {
            locationCodeControl?.reset();
          }
        }
      }));
  };

  ngAfterViewInit() {
    if (!this.editMode || this.hasAC) {
      this.formGroup.disable({ emitEvent: false });
    }
  };

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  };

  protected onSelectStation(idx: number): void {
    const input = (this.formGroup.get('serviceSpecification') as FormArray).controls[idx].get('locationCode').value
    const result = input.split(')');
    if (result && result.length === 2) {
      let locationCode = result[0];
      if (locationCode) {
        locationCode = locationCode.replace('(', '');
      }
      const locationName = result[1];
      this.selectedLocationCode = locationCode;
      this.selectedLocationName = locationName.trim();
      this.updateSpecialTreatmentOrder(idx);
    }
  }

  protected onInputLocationCode($event: any, idx: number): void {
    const input = $event.target.value;
    const validOptions = this.getValidOptions(idx);

    if (validOptions.length > 0 && validOptions.includes(input)) {
      return;
    }

    if (input.length >= 3) {
      this.fetchAutocompleteData(input, idx);
    } else {
      this.locationCodeAutocomplete[idx] = [];
    }
  }

  private fetchAutocompleteData(input: string, index: number): void {
    const authority = this.serviceSpecification?.at(index)?.get('authority')?.value;
    if (authority) {
      this.subscription.add(
        this.railOrderInternalService.getCommercialLocations(input, null, authority).subscribe({
          next: locations => {
            // Entferne doppelte Einträge basierend auf locationCode und name
            const uniqueLocations = locations.filter((item, idx, self) =>
                idx === self.findIndex((t) =>
                    t.locationCode === item.locationCode && t.name === item.name
                )
            );
            this.locationCodeAutocomplete[index] = uniqueLocations
                .slice(0, 30)
                .sort((a, b) => a.name.localeCompare(b.name));
        },
          error: err => console.error('Error fetching locations:', err)
        }));
    }
  }

  private createForm(): void {
    this.formGroup = new FormGroup({
      serviceSpecification: this.formBuilder.array([])
    });
  }

  private updateRailOrderSubj: BehaviorSubject<SpecialTreatmentOrder[]> = new BehaviorSubject<SpecialTreatmentOrder[]>(null);

  public updateRailOrder(ro: RailOrder) {
    this.railOrder = ro;
    this.isOrderTemplate = ro.templateNumber ? true : false;
    this.updateRailOrderSubj.next(ro.specialTreatmentOrders);
    this.cd.detectChanges();
  }

  private disableFields() {
    this.formFieldService.disableFields(this.formGroup, 'service', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  }

  protected getServiceSpecificationRow(index: number): FormGroup {
    return this.serviceSpecification.at(index) as FormGroup;
  }

  private prepareSpecialTreatmentOrdersLists(specialTreatmentOrdersList: SpecialTreatmentOrder[]) {
    this.shownSpecialTreatmentOrders = new Array();
    this.hiddenSpecialTreatmentOrders = new Array();
    this.hiddenButInProductExtraCharge = new Array();
    let shownElementsCount = 0;
    specialTreatmentOrdersList.forEach((sptro) => {
      if (shownElementsCount < this.ALLOWED_LENGTH_SERVICE_SPECIFICATION && this.specialTreatmentsList.find(s => s.code == sptro.productExtraChargeCode)) {
        this.shownSpecialTreatmentOrders.push(sptro);
        shownElementsCount++;
      } else {
        this.hiddenSpecialTreatmentOrders.push(sptro);
        if(sptro.includedInPrepaymentNote && this.hiddenButInProductExtraCharge.length < 5) {
          this.hiddenButInProductExtraCharge.push(sptro);
        }
      }
    });

    if(!this.isOrderTemplate) {
      this.hiddenSpecialTreatmentOrders = new Array();
      this.railOrder.specialTreatmentOrders = this.shownSpecialTreatmentOrders.concat(this.hiddenButInProductExtraCharge);
    }
  }

  private setFormValues(): void {
    const templateNumber = this.railOrder?.templateNumber?.toString().trim();
    this.hasAC = !!templateNumber;
    this.serviceSpecification.clear();
    if (this.shownSpecialTreatmentOrders.length < 1) {
      this.addLine(null);
    } else {
      this.shownSpecialTreatmentOrders.forEach(sto => this.addLine(sto));
    }
    this.disableFields();
  }

  protected updateSpecialTreatmentOrder(idx: number): void {
    const productExtraChargeCode = (this.formGroup.get('serviceSpecification') as FormArray).controls[idx].get('productExtraChargeCode').value;
    if (!productExtraChargeCode) {
      if (this.shownSpecialTreatmentOrders[idx]) {
        this.shownSpecialTreatmentOrders.splice(idx, 1);
      }
      this.railOrder.specialTreatmentOrders = this.shownSpecialTreatmentOrders.concat(this.hiddenButInProductExtraCharge);

      return;
    }

    const specialTreatmentCharging: SpecialTreatmentCharging = {
      startAuthority: this.railOrder.acceptancePoint?.authority,
      startLocationCode: this.railOrder.acceptancePoint?.locationCode,
      endAuthority: this.railOrder.deliveryPoint?.authority,
      endLocationCode: this.railOrder.deliveryPoint?.locationCode,
      prepayment: (this.formGroup.get('serviceSpecification') as FormArray).controls[idx].get('specialTreatmentChargingPrepayment').value,
    };

    const specialTreatmentOrder: SpecialTreatmentOrder = {
      info: (this.formGroup.get('serviceSpecification') as FormArray).controls[idx].get('info').value,
      productExtraChargeCode: Number(productExtraChargeCode),
      authority: (this.formGroup.get('serviceSpecification') as FormArray).controls[idx].get('authority').value,
      locationCode: this.selectedLocationCode,
      locationName: this.selectedLocationName,
      specialTreatmentChargings: [specialTreatmentCharging],
    }

    const existingSpecialTreatment: SpecialTreatmentOrder = this.shownSpecialTreatmentOrders[idx];
    if(existingSpecialTreatment && productExtraChargeCode == existingSpecialTreatment.productExtraChargeCode) {
      specialTreatmentOrder.includedInPrepaymentNote = existingSpecialTreatment.includedInPrepaymentNote;
    }

    this.shownSpecialTreatmentOrders[idx] = specialTreatmentOrder;
    this.railOrder.specialTreatmentOrders = this.shownSpecialTreatmentOrders.filter(sto => sto && sto.productExtraChargeCode).concat(this.hiddenButInProductExtraCharge);
  }

  private loadLists(): void {
    this.authorityList$ = this.railOrderInternalService.getRailAuthorities();
    this.newOrderService.getSpecialTreatments().subscribe({
      next: stoList => {
        this.specialTreatmentsList = stoList;
        this.updateRailOrderSubj.subscribe({
          next: roSpTrList => {
            if(roSpTrList) {
              this.prepareSpecialTreatmentOrdersLists(roSpTrList);
              this.setFormValues();
            }
          }
        });
      }
    });
  }

  public validate(): string[] {
    return [];
  }

  protected async addLine(item?: SpecialTreatmentOrder | null): Promise<void> {
    let firstLocation: CommercialLocationSummary | undefined;

    if (item?.locationCode) {
      try {
        const locations = await firstValueFrom(
          this.railOrderInternalService.getCommercialLocations(
            item.locationCode,
            null,
            item.authority
          )
        );
        firstLocation = locations[0];
        item.locationCode = firstLocation?.locationCode;
        item.locationName = firstLocation?.name;
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    const itemGroup: FormGroup = this.formBuilder.group({
      productExtraChargeCode: new FormControl(item?.productExtraChargeCode),
      authority: new FormControl(item?.authority),
      locationCode: new FormControl(
        item?.locationCode && item.locationName
          ? { value: item ? `(${item.locationCode}) ${item.locationName}` : null, disabled: !item?.authority }
          : null
      ),
      specialTreatmentChargingPrepayment: new FormControl(item?.specialTreatmentChargings?.[0]?.prepayment),
      info: new FormControl(item?.info),
    });

    this.subscription.add(
      itemGroup.get('productExtraChargeCode')?.valueChanges.subscribe(value => {
        const shouldDisable = !value;
        ['authority', 'specialTreatmentChargingPrepayment', 'info'].forEach(field => {
          if (shouldDisable || this.hasAC) {
            itemGroup.get(field)?.disable();
            if(shouldDisable) {
              itemGroup.get(field)?.reset();
          }
          } else {
            itemGroup.get(field)?.enable();
          }
        });
      }));

      if (this.hasAC) {
        itemGroup.get('productExtraChargeCode')?.disable();
      } else {
        itemGroup.get('productExtraChargeCode')?.enable();
      }

    const productExtraChargeCodeControl = itemGroup.get('productExtraChargeCode');
    if (productExtraChargeCodeControl) {
      productExtraChargeCodeControl.setValue(
        productExtraChargeCodeControl.value,
        { emitEvent: true }
      );
    }

    this.subscription.add(
      itemGroup.get('authority')?.valueChanges.subscribe((authorityValue) => {
        const locationCodeControl = itemGroup.get('locationCode');

        if (authorityValue && !this.hasAC) {
          locationCodeControl?.enable();
        } else {
          locationCodeControl?.disable();
          if (!this.hasAC) {
            locationCodeControl?.reset();
          }
        }
      }));

    const authorityControl = itemGroup.get('authority');
    if (authorityControl) {
      authorityControl.setValue(
        authorityControl.value,
        { emitEvent: true }
      );
    }



    if (this.serviceSpecification.length < this.ALLOWED_LENGTH_SERVICE_SPECIFICATION) {
      this.serviceSpecification.push(itemGroup);
    }

    if (!this.editMode) {
      itemGroup.disable({ emitEvent: false });
    }
  }

  protected removeLine(index: number): void {
    if (this.serviceSpecification.length <= 1) {
      return;
    }

    this.serviceSpecification.removeAt(index);
    this.railOrder.specialTreatmentOrders.splice(index, 1);
    this.locationCodeAutocomplete.splice(index, 1);
  }

  protected get serviceSpecification(): FormArray {
    return this.formGroup.get('serviceSpecification') as FormArray;
  }

  protected clearSearchInput(index: number): void {
    const rowGroup = this.serviceSpecification.at(index) as FormGroup;
    if (rowGroup) {
      rowGroup.get('locationCode').setValue(null);
    }
    this.locationCodeAutocomplete[index] = [];
  }

  protected validateLocationCode(event: Event, index: number): void {
    const inputElement = event.target as HTMLInputElement;
    const enteredValue = inputElement.value;
    if (!enteredValue) {
      this.setValidationState(index, false, null);
      return;
    }

    const validOptions = this.getValidOptions(index);
    if (validOptions.length == 0) {
      this.setValidationState(index, false, null);
      return;
    }
    const isValid = validOptions.includes(enteredValue.split(")")[0].slice(1, 10), 10);

    this.setValidationState(index, !isValid, isValid ? enteredValue : null);
  }

  private getValidOptions(index: number): string[] {
    return this.locationCodeAutocomplete[index]?.map(option => option.locationCode) || [];
  }

  private setValidationState(index: number, isInvalid: boolean, value: string | null): void {
    this.locationCodeInvalid[index] = isInvalid;
    if (value) this.formGroup.get(['serviceSpecification', index, 'locationCode'])?.setValue(value);
  }

  protected getProductExtraChargeCode(index: number): FormControl {
    return this.serviceSpecification.at(index).get('productExtraChargeCode') as FormControl;
  }

  protected getAuthority(index: number): FormControl {
    return this.serviceSpecification.at(index).get('authority') as FormControl;
  }

  protected getLocationCode(index: number): FormControl {
    return this.serviceSpecification.at(index).get('locationCode') as FormControl;
  }

  protected getSpecialTreatmentChargingPrepayment(index: number): FormControl {
    return this.serviceSpecification.at(index).get('specialTreatmentChargingPrepayment') as FormControl;
  }

  protected getInfo(index: number): FormControl {
    return this.serviceSpecification.at(index).get('info') as FormControl;
  }
}
