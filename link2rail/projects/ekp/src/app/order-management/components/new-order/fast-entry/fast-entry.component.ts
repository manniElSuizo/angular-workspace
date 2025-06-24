import { Component, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RailOrder } from '@src/app/order-management/models/rail-order-api';
import { SharedModule } from '@src/app/shared/shared.module';
import { ElSAutocompleteModule } from "../../../../shared/components/form-dialog/el-s-autocomplete/el-s-autocomplete.module";
import { InputFieldModule } from "../../../../shared/components/form-dialog/input-field/input-field.module";
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { SitePipe } from '@src/app/shared/pipes/sgv-sites.pipe';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';
import { RailAuthorityPipe } from '@src/app/shared/pipes/rail-authority.pipe';
import { CountryPipe } from '@src/app/shared/pipes/country.pipe';
import { ConstValues } from '@src/app/shared/enums/const-values.enum';
import moment from 'moment';
import { WagonInformationComponent } from "./wagon-information/wagon-information.component";
import { RailOrderBillOfLadingService } from '../../order-view/order-view-list/services/rail-order-bill-of-loading.service';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';
import { RailOrderStage } from '../../wagon-view/models/api-wagon-list';
import { RailOrderService } from '@src/app/order-management/service/rail-order.service';
import { ValidationMode } from '../validators/validator-field.config';
import { WagonValidationService } from '../service/wagon-validation-service.service';
import { FastEntryValidationService } from './fast-entry-wagon-validation.service';
import { DateValidators } from '@src/app/shared/validators/date.validators';
import { BehaviorSubject } from 'rxjs';
import { OrderTemplateCachingService } from '../service/order-template-caching.service';
import { LockedFieldsService } from '../service/locked-fields.service';
@Component({
  selector: 'app-fast-entry',
  standalone: true,
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ElSAutocompleteModule,
    InputFieldModule,
    WagonInformationComponent
  ],
  templateUrl: './fast-entry.component.html',
  styleUrl: './fast-entry.component.scss'
})
export class FastEntryComponent implements OnInit {
  @ViewChild(WagonInformationComponent) wagonInformationComponent: WagonInformationComponent;

  protected railOrder: RailOrder;
  protected fastEntryForm: FormGroup;
  protected loadingInProgress: boolean = false;
  protected templateResultList: RailOrder[] = [];
  protected maxDateTime = ConstValues.MAX_DATE_TIME;
  protected validationMode: ValidationMode = ValidationMode.VALIDATORS_DRAFT;
  protected isShippingDateInPast: boolean = false;

  private validationMode$: BehaviorSubject<ValidationMode> = new BehaviorSubject(ValidationMode.VALIDATORS_DRAFT);

  private trainOrderService: TrainorderService = inject(TrainorderService);
  private sitePipe: SitePipe = inject(SitePipe);
  private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
  private railAuthority: RailAuthorityPipe = inject(RailAuthorityPipe);
  private countryPipe: CountryPipe = inject(CountryPipe);
  private railOrderBillOfloadingService: RailOrderBillOfLadingService = inject(RailOrderBillOfLadingService);
  private errorDialogService: ErrorDialogService = inject(ErrorDialogService);
  private railOrderService: RailOrderService = inject(RailOrderService);
  private wagonValidationService: WagonValidationService = inject(WagonValidationService);
  private fastEntryValidationService: FastEntryValidationService = inject(FastEntryValidationService);
  private orderTemplateCachingService: OrderTemplateCachingService = inject(OrderTemplateCachingService);
  private lockedFieldsService: LockedFieldsService = inject(LockedFieldsService);

  protected isValidTemplate: boolean = true;


  constructor(private dialogRef: MatDialogRef<FastEntryComponent>, @Inject(MAT_DIALOG_DATA) data: {railOrder: RailOrder}) {
    this.railOrder = data.railOrder;
    this.orderTemplateCachingService.setOrderTemplate(this.railOrder);
    this.templateResultList = [this.railOrder];

  }

  ngOnInit(): void {
    this.removeReferenceIdsFromWagon();
    this.checkTemplateValidity();
    this.initForm();
    this.registerForValidationModeChanges();
    this.getPartner();
    this.getRailAuthorities();
    this.getCountries();
  }

  private removeReferenceIdsFromWagon(): void {
    this.railOrder.wagonInformation.forEach((wagon) => {

      if (wagon?.transportPlanId) {
        delete wagon.transportPlanId;
      }

      if (wagon?.referenceId) {
        delete wagon.referenceId;
      }

      wagon.goods.forEach((good) => {
        if (good?.referenceId) {
          delete good.referenceId;
        }
        good.dangerousGoods.forEach((dangerousGood) => {
          if (dangerousGood?.referenceId) {
            delete dangerousGood.referenceId;
          }
        });
      });
    });
  }

  private checkTemplateValidity() {
    this.isValidTemplate = this.lockedFieldsService.railOrderTemplateCanBeSaved(this.railOrder);
  }

  private registerForValidationModeChanges() {
    this.validationMode$.subscribe({
      next: (c) => {
        this.validationMode = c;
        this.date.clearValidators();
        this.time.clearValidators();
        this.shippingTimestamp.clearValidators();
        if (this.validationMode == ValidationMode.VALIDATORS_ORDER_AC) {
          this.date.setValidators([Validators.required]);
          this.time.setValidators([Validators.required]);
        } else if (this.validationMode == ValidationMode.VALIDATORS_BOOKING_AC) {
          this.date.setValidators([Validators.required]);
          this.time.setValidators([Validators.required]);
          this.shippingTimestamp.setValidators([DateValidators.dateTimeInPast]);
        }
        this.date.updateValueAndValidity({ emitEvent: false });
        this.time.updateValueAndValidity({ emitEvent: false });
        this.shippingTimestamp.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  private initForm() {
    const extRef = this.railOrder.externalReferences.find(ref => ref.type === 'RAR');
    this.fastEntryForm = new FormGroup({
      template: new FormControl(null, Validators.required),
      consignor: new FormGroup({
        name: new FormControl(this.railOrder.consignor?.name),
        partner: new FormControl(),
      }),
      consignee: new FormGroup({
        authorityOfCustomerId: new FormControl(),
        sgv: new FormControl(this.railOrder.consignee?.customerId?.sgv),
        name: new FormControl(this.railOrder.consignee?.name)
      }),
      acceptancePoint: new FormGroup({
        authority: new FormControl(),
        locationName: new FormControl(this.railOrder.acceptancePoint?.locationName),
        pointOfLoading: new FormControl(),
      }),
      deliveryPoint: new FormGroup({
        authority: new FormControl(),
        locationName: new FormControl(this.railOrder.deliveryPoint?.locationName),
        pointOfUnloading: new FormControl(),
      }),
      shippingTimestamp: new FormControl(),
      shippingDateTime: new FormGroup({
        date: new FormControl(),
        time: new FormControl()
      }),
      numberOfWagons: new FormControl(this.railOrder.numberOfWagons),
      externalReferences: new FormGroup({
        type: new FormControl(extRef?.identifier)
      }),
      separateConsignmentNotes: new FormControl()
    });
    this.fastEntryForm.disable();
    this.shippingDateTime.enable();
    this.shippingTimestamp.enable();
    this.numberOfWagons.enable();
    this.externalReferences.enable();
    this.separateConsignmentNotes.enable();


    if(this.railOrder.operationalTransportConditions?.pointOfLoading?.code) {
      this.getLoadingPoints(this.railOrder.acceptancePoint?.locationCode, this.acceptancePoint.get('pointOfLoading') as FormControl);
    }

    if(this.railOrder.operationalTransportConditions?.pointOfUnloading?.code) {
      this.getLoadingPoints(this.railOrder.deliveryPoint?.locationCode, this.deliveryPoint.get('pointOfUnloading') as FormControl);
    }


    this.type.valueChanges.subscribe(c => this.onChangeExternalReferenceType());
  }

  private getPartner() {
    this.trainOrderService.getPartner(this.railOrder?.consignor?.customerId?.sgv, this.railOrder?.consignor?.partnerId?.site).subscribe(s => {
      if(s) {
        this.fastEntryForm.get('consignor').get('partner').setValue(this.sitePipe.transform({siteName: s.name, partnerId: s.partnerId}));
      }
    });
  }

  private getRailAuthorities() {
    this.railOrderInternalService.getRailAuthorities().subscribe({
      next: (ras) => {
        const found = ras.find(ra => ra.uicCompanyCode == this.railOrder?.consignee?.customerId?.authorityOfCustomerId);
        if(found) {
          this.consignee.get('authorityOfCustomerId').setValue(this.railAuthority.transform(found));
        }
      }
    });
  }

  private getCountries() {
    this.railOrderInternalService.getCountries().subscribe({
      next: countryList => {
        if(countryList) {
          let found = countryList.find(c => c.uicCountryCode == this.railOrder.acceptancePoint?.authority);
          if(found) {
            this.acceptancePoint.get('authority').setValue(this.countryPipe.transform(found));
          }
          found = countryList.find(c => c.uicCountryCode == this.railOrder.deliveryPoint?.authority);
          if(found) {
            this.deliveryPoint.get('authority').setValue(this.countryPipe.transform(found));
          }
        }
      }
    });
  }

  private getLoadingPoints(locationCode: string, field: FormControl): void {
    this.railOrderInternalService.getLoadingPoints(locationCode).subscribe({
      next: lps => {
        const found = lps.find(lp => lp.code);
        if(found) {
          field.setValue(found.name);
        }
      }
    });
  }

  protected updateRailOrder($event: RailOrder) {
    this.railOrder = $event;
  }

  protected close() {
    this.dialogRef.close();
  }

  protected transformTemplateName(): Function {
    return (o) => o.templateName != o.templateNumber ? o.templateName + " (" + o.templateNumber + ")" : o.templateName;
  }

  protected onChangeshippingDateTime(): void {
    const dateTime: {date: string, time: string} = this.shippingDateTime.value;
    let timestamp = null;
    if(dateTime.date) {
      timestamp = dateTime.date;
      if(dateTime.time) {
        timestamp = `${timestamp}T${dateTime.time}`;
      }
      this.isShippingDateInPast = new Date(timestamp) < new Date();
    }
    this.shippingTimestamp.setValue(timestamp);
    this.railOrder.shippingTimestamp = timestamp ? moment(timestamp).toISOString() : timestamp;
  }

  private onChangeExternalReferenceType(): void {
    const extRefType = this.type.value;
    const foundIdx = this.railOrder.externalReferences?.findIndex(e => e.type == 'RAR');
    if(foundIdx > -1) {
      if(!extRefType) {
        this.railOrder.externalReferences.splice(foundIdx, 1);
        return;
      }
      this.railOrder.externalReferences[foundIdx].identifier = extRefType;
      return;
    }

    if(!this.railOrder.externalReferences && extRefType) {
      this.railOrder.externalReferences = [];
    }
    this.railOrder.externalReferences.push({ type: 'RAR', identifier: extRefType });
  }

  protected book(): void {
    this.validationMode$.next(ValidationMode.VALIDATORS_BOOKING_AC);
    if(!this.fastEntryValidationService.validateRailOrder(this.railOrder).isValid) {
      // TODO evtl. Rücksprache mit AM:
      // Was soll passieren, wenn AC keinen AcceptancePoint bzw. keinen DeliveryPoint hat?
      // return;
    }
    this.fastEntryValidationService.validateWagons(this.railOrder, this.validationMode, this.fastEntryForm.get('wagonInformation') as FormArray);
    this.wagonValidationService.validateAllWagonsByFormArray(this.railOrder, this.validationMode, this.fastEntryForm.get('wagonInformation') as FormArray);
    this.save(RailOrderStage.BOOKING);
  }

  protected order(): void {
    this.validationMode$.next(ValidationMode.VALIDATORS_ORDER_AC);
    if(!this.fastEntryValidationService.validateRailOrder(this.railOrder).isValid) {
      // TODO evtl. Rücksprache mit AM:
      // Was soll passieren, wenn AC keinen AcceptancePoint bzw. keinen DeliveryPoint hat?
      // return;
    }
    this.fastEntryValidationService.validateWagons(this.railOrder, this.validationMode, this.fastEntryForm.get('wagonInformation') as FormArray);
    this.wagonValidationService.validateAllWagonsByFormArray(this.railOrder, this.validationMode, this.fastEntryForm.get('wagonInformation') as FormArray);
    this.save(RailOrderStage.TRANSPORT_ORDER);
  }

  private save(stage: RailOrderStage): void {
    console.log(this.railOrder);
    if(!this.fastEntryForm.valid) {
      return;
    }
    this.loadingInProgress = true;

    const scn = this.separateConsignmentNotes.value || false;
    this.railOrderService.railOrdersPost(this.railOrder, stage, scn).subscribe({
      next: (ro: RailOrder) => {
        this.loadingInProgress = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingInProgress = false;
        this.errorDialogService.openApiErrorDialog(err);
      }
    });
  }

  protected getCurrentConsignmentNote(): void {
    this.loadingInProgress = true;

    this.railOrderBillOfloadingService.postRailOrdersBillOfLoading(
            this.railOrder,
            (err) => {
              this.loadingInProgress = false;
              this.errorDialogService.openApiErrorDialog(err);
            },
            () => this.loadingInProgress = false
    );
  }

  // Form Getters
  get templateControl(): FormControl {
    return this.fastEntryForm.get('template') as FormControl;
  }

  get consignor(): FormGroup {
    return this.fastEntryForm.get('consignor') as FormGroup;
  }
  get consignee(): FormGroup {
    return this.fastEntryForm.get('consignee') as FormGroup;
  }
  get acceptancePoint(): FormGroup {
    return this.fastEntryForm.get('acceptancePoint') as FormGroup;
  }
  get shippingDateTime(): FormGroup {
    return this.fastEntryForm.get('shippingDateTime') as FormGroup;
  }
  get shippingTimestamp(): FormControl {
    return this.fastEntryForm.get('shippingTimestamp') as FormControl;
  }
  get date(): FormControl {
    return this.shippingDateTime.get('date') as FormControl;
  }
  get time(): FormControl {
    return this.shippingDateTime.get('time') as FormControl;
  }
  get deliveryPoint(): FormGroup {
    return this.fastEntryForm.get('deliveryPoint') as FormGroup;
  }
  get externalReferences(): FormGroup {
    return this.fastEntryForm.get('externalReferences') as FormGroup;
  }
  get type(): FormControl {
    return this.externalReferences.get('type') as FormControl;
  }
  get numberOfWagons(): FormControl {
    return this.fastEntryForm.get('numberOfWagons') as FormControl;
  }
  get separateConsignmentNotes(): FormControl {
    return this.fastEntryForm.get('separateConsignmentNotes') as FormControl;
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
}
