import { AfterViewInit, ChangeDetectorRef, Component, inject, Inject, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SectionName } from '../enums/order-enums';
import { CommercialTransportConditions, initialRailOrder, RailOrder, SpecialTreatmentOrder, TemplateSummary, WagonInformation } from '../../../models/rail-order-api';
import { NewOrderConsignorConsigneeComponent } from '../new-order-sections/new-order-consignor-consignee/new-order-consignor-consignee.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NewOrderPickupDeliveryComponent } from '../new-order-sections/new-order-pickup-delivery/new-order-pickup-delivery.component';
import { NewOrderTransportComponent } from '../new-order-sections/new-order-transport/new-order-transport.component';
import { NewOrderCommercialComponent } from '../new-order-sections/new-order-commercial/new-order-commercial.component';
import { NewOrderSenderPolicyComponent } from '../new-order-sections/new-order-sender-policy/new-order-sender-policy.component';
import { NewOrderServiceComponent } from '../new-order-sections/new-order-service/new-order-service.component';
import { NewOrderWagonDataComponent } from '../new-order-sections/new-order-wagon-data/new-order-wagon-data.component';
import { NewOrderSenderPolicyModule } from '../new-order-sections/new-order-sender-policy/new-order-sender-policy.modules';
import { NewOrderCommercialModule } from '../new-order-sections/new-order-commercial/new-order-commercial.modules';
import { NewOrderConsignorConsigneeModule } from '../new-order-sections/new-order-consignor-consignee/new-order-consignor-consignee.modules';
import { NewOrderPickupDeliveryModule } from '../new-order-sections/new-order-pickup-delivery/new-order-pickup-delivery.modules';
import { NewOrderServiceModule } from '../new-order-sections/new-order-service/new-order-service.modules';
import { NewOrderTransportModule } from '../new-order-sections/new-order-transport/new-order-transport.modules';
import { NewOrderWagonDataModule } from '../new-order-sections/new-order-wagon-data/new-order-wagon-data.modules';
import { OrderInfoData } from '../models/order-info-data.model';
import { NewOrderService } from '../service/new-order.service';
import { FormValidationService } from '../../../../shared/services/form-validation.service';
import { ValidationMode } from '../validators/validator-field.config';
import { RailOrderService } from '@src/app/order-management/service/rail-order.service';
import { RailOrderStage } from '../../wagon-view/models/api-wagon-list';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';
import { Action } from '@src/app/order-management/models/general-order';
import { WagonValidationService } from '../service/wagon-validation-service.service';
import { ModelService } from '../service/model.service';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { DangerousGoodObject } from '@src/app/trainorder/models/Cargo.model';
import { OrderNumberPipe } from '@src/app/shared/pipes/order-number.pipe';
import { RailOrderNoTemplate, RailOrderNoTemplateService } from '../models/initial-railOrder';
import { SpecialTreatment } from '@src/app/order-management/models/om-internal-api';
import { RailOrderBillOfLadingService } from '../../order-view/order-view-list/services/rail-order-bill-of-loading.service';
import { AutocompleteInternalModule } from '@src/app/shared/components/form-dialog/autocomplete-internal/autocomplete-internal.module';
import { LoadingSpinnerService } from '@src/app/shared/services/loading-spinner/loading-spinner.service';
import { OrderTemplateCachingService } from '../service/order-template-caching.service';
// Ensure the file exists at the correct location or update the path if necessary
import { LockedFieldsService } from '../service/locked-fields.service';
@Component({
  selector: 'app-new-order-main',
  templateUrl: './new-order-main.component.html',
  styleUrl: './new-order-main.component.scss',
  standalone: true,
  imports: [
    SharedModule,
    TranslateModule,
    NewOrderConsignorConsigneeModule,
    NewOrderPickupDeliveryModule,
    NewOrderTransportModule,
    NewOrderWagonDataModule,
    NewOrderCommercialModule,
    NewOrderServiceModule,
    NewOrderSenderPolicyModule,
    MatDialogModule,
    AutocompleteInternalModule
  ]
})
export class NewOrderMainComponent implements AfterViewInit {

  @ViewChild(NewOrderConsignorConsigneeComponent, { static: false }) sectionConsigneeConsignor!: NewOrderConsignorConsigneeComponent;
  @ViewChild(NewOrderPickupDeliveryComponent, { static: false }) sectionPickupDelivery!: NewOrderPickupDeliveryComponent;
  @ViewChild(NewOrderTransportComponent, { static: false }) sectionTransport!: NewOrderTransportComponent;
  @ViewChild(NewOrderWagonDataComponent, { static: false }) sectionWagonData!: NewOrderWagonDataComponent;
  @ViewChild(NewOrderCommercialComponent, { static: false }) sectionCommercial!: NewOrderCommercialComponent;
  @ViewChild(NewOrderServiceComponent, { static: false }) sectionService!: NewOrderServiceComponent;
  @ViewChild(NewOrderSenderPolicyComponent, { static: false }) sectionSenderPolicy!: NewOrderSenderPolicyComponent;

  private orderNumberPipe: OrderNumberPipe = inject(OrderNumberPipe);

  private consignorConsigneeFormGroupName = 'consignorConsignee';
  private pickupDeliveryFormGroupName = 'pickupDelivery';
  private transportFormGroupName = 'transport';
  private wagonDataFormGroupName = 'wagonData';
  private commercialFormGroupName = 'commercial';
  private serviceFormGroupName = 'service';
  private senderPolicyFormGroupName = 'senderPolicy';

  protected orderInfoData: OrderInfoData;
  protected currentSectionName: SectionName = SectionName.SECTION_CONSIGNEE_CONSIGNOR;
  protected SectionName = SectionName;
  protected nextIsVisibel: boolean = true;
  protected backIsVisibel: boolean = false;
  protected templateNumberSuggestions: TemplateSummary[] = [];
  protected headLine: string;
  protected closeButtonText: string;
  protected formGroup: FormGroup;
  protected editMode: boolean = true;
  protected isNew: boolean = false;
  protected isValidTemplate: boolean = true;

  protected validationStage: ValidationMode = null;

  private translateService: TranslateService = inject(TranslateService);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  private orderDialogValidationService: FormValidationService = inject(FormValidationService);
  private wagonValidationService: WagonValidationService = inject(WagonValidationService);
  private railOrderService: RailOrderService = inject(RailOrderService);
  private apiErrorDialogService: ErrorDialogService = inject(ErrorDialogService);
  private loadingSpinnerService: LoadingSpinnerService = inject(LoadingSpinnerService);
  private orderTemplateCachingService: OrderTemplateCachingService = inject(OrderTemplateCachingService);

  private railOrderNoTemplateService: RailOrderNoTemplateService = inject(RailOrderNoTemplateService);
  private tempRailOrderNoTemplate: RailOrderNoTemplate;
  templateNumber: any;

  constructor(
    private lockedFieldsService: LockedFieldsService,
    private dialogRef: MatDialogRef<NewOrderMainComponent>,
    private modelService: ModelService,
    private railOrderBillOfloadingService: RailOrderBillOfLadingService,
    private trainOrderService: TrainorderService,
    @Inject(MAT_DIALOG_DATA) data: OrderInfoData, private newOrderService: NewOrderService) {
    this.orderInfoData = data;
    this.editMode = this.orderInfoData.editMode;
    this.isNew = this.orderInfoData.isNew;

    this.setHeadLine();
  }

  ngOnInit() {
    this.checkTemplateValidity();
    this.setFocus();
    this.createForm();
  }

  ngAfterViewInit(): void {
    this.formInit();
    if (this.isNew ) {
      this.loadingSpinnerService.startLoading(document.getElementById('order-edit-modal'));
      this.loadTemplateSummarySuggestions();
    }
    this.orderTemplateCachingService.setOrderTemplate(null);
    if (this.orderInfoData.railOrder.templateNumber) {
      this.orderTemplateCachingService.setOrderTemplate(this.orderInfoData.railOrder);
    }
    this.cd.detectChanges();
  }

  private formInit() {
    this.addSubFormGroups();
  }

  private addSubFormGroups() {
    // setTimeout(() => {
    this.formGroup.addControl(this.consignorConsigneeFormGroupName, this.sectionConsigneeConsignor.formGroup);
    // this.sectionConsigneeConsignor.formGroup.setParent(this.formGroup);
    this.formGroup.addControl(this.pickupDeliveryFormGroupName, this.sectionPickupDelivery.formGroup);
    // this.sectionPickupDelivery.formGroup.setParent(this.formGroup);
    this.formGroup.addControl(this.transportFormGroupName, this.sectionTransport.formGroup);
    // this.sectionTransport.formGroup.setParent(this.formGroup);
    this.formGroup.addControl(this.wagonDataFormGroupName, this.sectionWagonData.formGroup);
    // // this.sectionWagonData.formGroup.setParent(this.formGroup);
    this.formGroup.addControl(this.senderPolicyFormGroupName, this.sectionSenderPolicy.formGroup);
    // // this.sectionSenderPolicy.formGroup.setParent(this.formGroup);
    this.formGroup.addControl(this.serviceFormGroupName, this.sectionService.formGroup);
    // // this.sectionService.formGroup.setParent(this.formGroup);
    this.formGroup.addControl(this.commercialFormGroupName, this.sectionCommercial.formGroup);
    // this.sectionCommercial.formGroup.setParent(this.formGroup);
    this.updateAllSections();
    // });
  }

  private loadOrderTemplate(template: TemplateSummary): void {
    if (!template) {
      this.orderInfoData.railOrder = initialRailOrder();
      this.formGroup.enable({ emitEvent: false });

      this.formGroup.reset();
      this.updateAllSections();
      return;
    }
    const templateNumber = template.templateNumber;
    this.loadingSpinnerService.startLoading(document.getElementById('order-edit-modal'));
    this.newOrderService.getRailOrderTemplateByTemplateNumber(templateNumber).subscribe({
      next: ro => {
        this.orderInfoData.railOrder = ro;
        this.orderTemplateCachingService.setOrderTemplate(ro);
        this.addDgMasterData();
        this.removeReferenceIdsFromWagon();
        this.checkTemplateValidity();
        this.updateAllSections();
        this.loadingSpinnerService.stopLoading();
      },
      error: e => console.error(e)
    });

  }


  private enableDisableBookingTransportOrderButtons() {

    if (!this.isValidTemplate) {
      this.bookButtonEnabled = false;
      this.orderButtonEnabled = false;
    } else {
      this.bookButtonEnabled = true;
      this.orderButtonEnabled = true;
    }
  }

  protected transformTemplateSummary = (ots: TemplateSummary) => {
    if (ots.templateName && ots.templateName != ots.templateNumber) {
      return `(${ots.templateNumber}) ${ots.templateName}`;
    }
    return ots.templateNumber;
  }

  protected onSelectOrderTemplateSummary(ots: TemplateSummary) {
    if (ots) {
      this.loadOrderTemplate(ots);
    }
  }

  private loadTemplateSummarySuggestions(): void {
    this.newOrderService.getRailOrderTemplates('CREATE_ORDER').subscribe({
      next: (result: TemplateSummary[]) => {
        this.templateNumberSuggestions = result;
        this.loadingSpinnerService.stopLoading();
      },
      error: (err) => {
        this.loadingSpinnerService.stopLoading();
        throw err;
      }
    });
  }

  private removeReferenceIdsFromWagon(): void {
    this.orderInfoData.railOrder.wagonInformation.forEach((wagon) => {

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

  private addDgMasterData() {
    this.orderInfoData.railOrder.wagonInformation.forEach((wagon) => {
      wagon?.goods.forEach(async (good) => {
        const unNumber = good?.dangerousGoods?.at(0)?.unNr || null;
        if (unNumber) {
          try {
            const result: DangerousGoodObject[] = await this.trainOrderService.getDangerousCargo(unNumber);
            if (result.length > 0 && result[0]?.nagFlag !== undefined) {
              good.dangerousGoods[0].nagFlag = result[0]?.nagFlag;

              //good.dangerousGoods[0].approvalFlag = result[0]?.approvalFlag;
              good.dangerousGoods[0].restrictionFlag = result[0]?.restrictionFlag;

            } else {
              console.warn(`No valid NAG-Flag found for UN number: ${unNumber}`);
            }
          } catch (error) {
            console.error(`Error fetching dangerous cargo for UN number: ${unNumber}`, error);
          }
        }
      });
    });
  }

  private updateAllSections(): void {
    this.sectionConsigneeConsignor.updateRailOrder(this.orderInfoData.railOrder);
    this.sectionPickupDelivery.updateRailOrder(this.orderInfoData.railOrder);
    this.sectionTransport.updateRailOrder(this.orderInfoData.railOrder);
    this.sectionWagonData.updateRailOrder(this.orderInfoData.railOrder);
    this.sectionCommercial.updateRailOrder(this.orderInfoData.railOrder);
    this.sectionService.updateRailOrder(this.orderInfoData.railOrder);
    this.sectionSenderPolicy.updateRailOrder(this.orderInfoData.railOrder);
    this.templateNumberControl.setErrors(null);
  }
  private checkTemplateValidity() {
    if (this.editMode && this.orderInfoData.railOrder.templateNumber) {
      this.isValidTemplate = this.lockedFieldsService.railOrderTemplateCanBeSaved(this.orderInfoData.railOrder);
      this.enableDisableBookingTransportOrderButtons();
    }
  }

  private formatOrderCodeOption(option: TemplateSummary): string | null {
    const templateNumber = option.templateNumber ? `(${option.templateNumber})` : '';
    const templateName = option.templateName || '';

    const formatted = `${templateNumber} ${templateName}`.trim(); // Combine and trim
    return formatted ? formatted : null; // Return null if the result is empty
  }

  private setHeadLine() {
    this.headLine = this.translateService.instant('New-order.Main.Dialog-title');
    if (this.orderInfoData.railOrder?.orderId) {
      const orderNumberDisplay = this.orderInfoData.railOrder.orderKey?.orderNumber ? this.orderNumberPipe.transform(this.orderInfoData.railOrder.orderKey.orderNumber, this.orderInfoData.railOrder.orderKey.orderAuthority) : this.orderInfoData.railOrder.orderId;
      this.headLine = `${this.translateService.instant('New-order.Main.Order')} ${orderNumberDisplay}`;
    }
    this.closeButtonText = this.translateService.instant('New-order.Main.Button.Cancel');
    if (!this.editMode) {
      this.closeButtonText = this.translateService.instant('Shared.Close-button-label');
    }
  }

  private createForm(): void {
    const option: TemplateSummary = {
      templateNumber: this.orderInfoData.railOrder?.templateNumber || null,
      templateName: this.orderInfoData.railOrder?.templateName || null
    }

    this.formGroup = new FormGroup(
      {
        templateNumber: new FormControl(this.formatOrderCodeOption(option)),
        singleConsignmentNote: new FormControl(),

      }
    );
    if (!this.isNew ) {
      this.templateNumberControl.disable();
    }
    if (!this.editMode) {
      this.formGroup.disable();
    }
  }

  protected setSection(selectedSection: SectionName): void {
    this.currentSectionName = selectedSection;
    this.setFocus();
    this.setButtonVisibility();
    switch (selectedSection) {
      case (SectionName.SECTION_CONSIGNEE_CONSIGNOR):
        this.sectionConsigneeConsignor.updateRailOrder(this.orderInfoData.railOrder);
        break;
      case (SectionName.SECTION_PICKUP_DELIVERY):
        this.sectionPickupDelivery.updateRailOrder(this.orderInfoData.railOrder);
        break;
      case (SectionName.SECTION_TRANSPORT):
        this.sectionTransport.updateRailOrder(this.orderInfoData.railOrder);
        break;
      case (SectionName.SECTION_WAGON_DATA):
        this.sectionWagonData.updateRailOrder(this.orderInfoData.railOrder);
        break;
      case (SectionName.SECTION_COMMERCIAL):
        this.sectionCommercial.updateRailOrder(this.orderInfoData.railOrder);
        break;
      case (SectionName.SECTION_SERVICE):
        this.sectionService.updateRailOrder(this.orderInfoData.railOrder);
        break;
      case (SectionName.SECTION_SENDER_POLICY):
        this.sectionSenderPolicy.updateRailOrder(this.orderInfoData.railOrder);
        break;
    }
  }

  private setButtonVisibility(): void {
    switch (this.currentSectionName) {
      case (SectionName.SECTION_CONSIGNEE_CONSIGNOR):
        this.backIsVisibel = false;
        this.nextIsVisibel = true;
        break;
      case (SectionName.SECTION_PICKUP_DELIVERY):
        this.backIsVisibel = true;
        this.nextIsVisibel = true;
        break;
      case (SectionName.SECTION_TRANSPORT):
        this.backIsVisibel = true;
        this.nextIsVisibel = true;
        break;
      case (SectionName.SECTION_WAGON_DATA):
        this.backIsVisibel = true;
        this.nextIsVisibel = true;
        break;
      case (SectionName.SECTION_COMMERCIAL):
        this.backIsVisibel = true;
        this.nextIsVisibel = true;
        break;
      case (SectionName.SECTION_SERVICE):
        this.backIsVisibel = true;
        this.nextIsVisibel = true;
        break;
      case (SectionName.SECTION_SENDER_POLICY):
        this.backIsVisibel = true;
        this.nextIsVisibel = false;
        break;
    }
  }

  protected nextSection() {
    switch (this.currentSectionName) {
      case (SectionName.SECTION_CONSIGNEE_CONSIGNOR):
        this.currentSectionName = SectionName.SECTION_PICKUP_DELIVERY
        break;
      case (SectionName.SECTION_PICKUP_DELIVERY):
        this.currentSectionName = SectionName.SECTION_TRANSPORT
        break;
      case (SectionName.SECTION_TRANSPORT):
        this.currentSectionName = SectionName.SECTION_WAGON_DATA
        break;
      case (SectionName.SECTION_WAGON_DATA):
        this.currentSectionName = SectionName.SECTION_COMMERCIAL
        break;
      case (SectionName.SECTION_COMMERCIAL):
        this.currentSectionName = SectionName.SECTION_SERVICE
        break;
      case (SectionName.SECTION_SERVICE):
        this.currentSectionName = SectionName.SECTION_SENDER_POLICY
        break;
    }

    this.setSection(this.currentSectionName);
  }

  protected backSection() {
    switch (this.currentSectionName) {
      case (SectionName.SECTION_PICKUP_DELIVERY):
        this.currentSectionName = SectionName.SECTION_CONSIGNEE_CONSIGNOR
        break;
      case (SectionName.SECTION_TRANSPORT):
        this.currentSectionName = SectionName.SECTION_PICKUP_DELIVERY
        break;
      case (SectionName.SECTION_WAGON_DATA):
        this.currentSectionName = SectionName.SECTION_TRANSPORT
        break;
      case (SectionName.SECTION_COMMERCIAL):
        this.currentSectionName = SectionName.SECTION_WAGON_DATA
        break;
      case (SectionName.SECTION_SERVICE):
        this.currentSectionName = SectionName.SECTION_COMMERCIAL
        break;
      case (SectionName.SECTION_SENDER_POLICY):
        this.currentSectionName = SectionName.SECTION_SERVICE
        break;
    }
    this.setSection(this.currentSectionName);
  }

  private setFocus() {
    document.querySelectorAll<HTMLElement>('.tabs-item').forEach(el => {
      el.classList.remove('tabs-item-selected');
      el.classList.remove('tabs-item-valid');
      if (el.id == this.currentSectionName) {
        el.classList.add('tabs-item-selected');
      }
    });
  }

  public validate(): boolean {
    let sectionConsigneeConsignorResult = this.sectionConsigneeConsignor.validate();
    if (sectionConsigneeConsignorResult?.length > 0) {
      return false;
    }
    return true;
  }

  get templateNumberControl(): FormControl {
    return this.formGroup.get("templateNumber") as FormControl;
  }

  protected showOrderButton(): boolean {
    return this.orderInfoData.railOrder.allowedActions?.includes(Action.ORDER) || !this.orderInfoData.railOrder.orderId;
  }
  protected showDraftButton(): boolean {
    return this.orderInfoData.railOrder.allowedActions?.includes(Action.EDIT) || !this.orderInfoData.railOrder.orderId;
  }

  protected showBookButton(): boolean {
    return this.orderInfoData.railOrder.allowedActions?.includes(Action.BOOK) || !this.orderInfoData.railOrder.orderId;
  }

  protected showEditButton(): boolean {
    return this.orderInfoData.railOrder.allowedActions?.includes(Action.EDIT) || !this.orderInfoData.railOrder.orderId;
  }

  protected order() {
    console.log(this.orderInfoData.railOrder);
    this.checkRailOrder();
    this.validationStage = this.orderInfoData.railOrder.templateNumber ? ValidationMode.VALIDATORS_ORDER_AC : ValidationMode.VALIDATORS_ORDER;
    this.orderDialogValidationService.validateRailOrderForm(this.formGroup, this.validationStage);
    this.wagonValidationService.validateAllWagons(this.orderInfoData.railOrder, this.validationStage, this.formGroup);
    this.setValidStateInMenu();

    if (this.formGroup.valid) {
      this.save(RailOrderStage.TRANSPORT_ORDER);
    }
  }

  protected book() {
    console.log(this.orderInfoData.railOrder);
    this.checkRailOrder();
    this.validationStage = this.orderInfoData.railOrder.templateNumber ? ValidationMode.VALIDATORS_BOOKING_AC : ValidationMode.VALIDATORS_BOOKING;
    this.orderDialogValidationService.validateRailOrderForm(this.formGroup, this.validationStage);
    this.wagonValidationService.validateAllWagons(this.orderInfoData.railOrder, this.validationStage, this.formGroup);
    this.setValidStateInMenu();

    if (this.formGroup.valid) {
      this.save(RailOrderStage.BOOKING);
    }
  }

  protected draft() {
    console.log(this.orderInfoData.railOrder);
    this.checkRailOrder();
    //this.clearErrors(this.formGroup)
    this.validationStage = ValidationMode.VALIDATORS_DRAFT;
    this.orderDialogValidationService.validateRailOrderForm(this.formGroup, ValidationMode.VALIDATORS_DRAFT);
    this.setValidStateInMenu();

    if (this.formGroup.valid) {
      this.save(RailOrderStage.DRAFT);
    }
  }

  private save(stage: RailOrderStage): void {
    console.log(stage, this.orderInfoData.railOrder);
    this.consignmentButtonEnabled = false;
    this.orderButtonEnabled = false;
    this.bookButtonEnabled = false;
    this.draftButtonEnabled = false;
    this.loadingInProgress = true;
    if (this.orderInfoData.railOrder.orderId && this.orderInfoData.railOrder.orderId > 0) {
      this.railOrderService.railOrdersPut(this.orderInfoData.railOrder, stage).subscribe(this.railOrderSaveActions);
      return;
    }
    const scn = this.formGroup.get('singleConsignmentNote').value;

    this.railOrderService.railOrdersPost(this.orderInfoData.railOrder, stage, scn).subscribe(this.railOrderSaveActions);
  }

  private checkRailOrder(): void {
    this.orderInfoData.railOrder.wagonInformation = this.setWagonPosition(this.orderInfoData.railOrder.wagonInformation);
    this.orderInfoData.railOrder.attachedDocuments = this.modelService.preventEmptyAttachedDocuments(this.orderInfoData.railOrder.attachedDocuments);
    this.orderInfoData.railOrder.wagonInformation = this.modelService.preventEmptyWagonInformation(this.orderInfoData.railOrder.wagonInformation);
    this.orderInfoData.railOrder.specialAnnotations = this.modelService.preventEmptySpecialAnnotations(this.orderInfoData.railOrder.specialAnnotations);
    this.orderInfoData.railOrder.wagonInformation = this.modelService.preventEmptyPackingUnit(this.orderInfoData.railOrder.wagonInformation);
    this.orderInfoData.railOrder.wagonInformation = this.modelService.preventEmptyLoadingTackles(this.orderInfoData.railOrder.wagonInformation);
    this.orderInfoData.railOrder.wagonInformation = this.modelService.preventEmptyExceptionalConsignments(this.orderInfoData.railOrder.wagonInformation);
    this.orderInfoData.railOrder.wagonInformation = this.setDangerousGoodIndicator(this.orderInfoData.railOrder.wagonInformation);
    this.orderInfoData.railOrder.specialTreatmentOrders = this.specialTreatmentCharging(this.orderInfoData.railOrder.specialTreatmentOrders);
    if (!this.orderInfoData.railOrder.templateNumber) {
      this.orderInfoData.railOrder.commercialTransportConditions = this.chargingSection(this.orderInfoData.railOrder.commercialTransportConditions);
    }
    //this.orderInfoData.railOrder.numberOfWagons = this.orderInfoData.railOrder.wagonInformation?.length || 0;
  }

  private setWagonPosition(input: WagonInformation[]): WagonInformation[] {
    if (input) {
      for (let i = 0; i < input.length; i++) {
        if (input[i]) {
          input[i].wagonPosition = (i + 1);
        }
      }
    }
    return input;
  }

  protected consignmentButtonEnabled: boolean = true;
  protected orderButtonEnabled: boolean = true;
  protected draftButtonEnabled: boolean = true;
  protected bookButtonEnabled: boolean = true;
  protected loadingInProgress: boolean = false;

  private railOrderSaveActions = {
    next: (ro: RailOrder) => {
      // after saving draft the popup could be kept open if the two commented blocks are uncommented:
      // this.orderInfoData.railOrder = ro[0];
      // this.formGroup.reset();
      // this.addDgMasterData();
      // this.updateAllSections();
      this.consignmentButtonEnabled = true;
      this.orderButtonEnabled = true;
      this.bookButtonEnabled = true;
      this.draftButtonEnabled = true;
      this.loadingInProgress = false;
      // if(ro.orderKey && ro.orderKey.orderNumber) {
      //   this.dialogRef.close(true);
      // }
      this.dialogRef.close(true);
    },
    error: (err) => {
      this.apiErrorDialogService.openApiErrorDialog(err);
      this.consignmentButtonEnabled = true;
      this.orderButtonEnabled = true;
      this.bookButtonEnabled = true;
      this.draftButtonEnabled = true;
      this.loadingInProgress = false;
    }
  };

  private setValidStateInMenu() {
    document.querySelectorAll<HTMLElement>('.tabs-item').forEach(el => {
      el.classList.remove('tabs-item-selected');
      el.classList.remove('tabs-item-valid');
      if (el.id == this.currentSectionName) {
        el.classList.add('tabs-item-selected');
      }
    });
    if (this.formGroup.get(this.consignorConsigneeFormGroupName).valid) {
      if (SectionName.SECTION_CONSIGNEE_CONSIGNOR != this.currentSectionName) {
        document.getElementById(SectionName.SECTION_CONSIGNEE_CONSIGNOR).classList.add('tabs-item-valid');
      }
    }
    if (this.formGroup.get(this.pickupDeliveryFormGroupName).valid) {
      if (SectionName.SECTION_PICKUP_DELIVERY != this.currentSectionName) {
        document.getElementById(SectionName.SECTION_PICKUP_DELIVERY).classList.add('tabs-item-valid');
      }
    }
    if (this.formGroup.get(this.transportFormGroupName).valid) {
      if (SectionName.SECTION_TRANSPORT != this.currentSectionName) {
        document.getElementById(SectionName.SECTION_TRANSPORT).classList.add('tabs-item-valid');
      }
    }
    if (this.formGroup.get(this.wagonDataFormGroupName).valid) {
      if (SectionName.SECTION_WAGON_DATA != this.currentSectionName) {
        document.getElementById(SectionName.SECTION_WAGON_DATA).classList.add('tabs-item-valid');
      }
    }
    if (this.formGroup.get(this.serviceFormGroupName).valid || this.formGroup.get(this.serviceFormGroupName).disabled) {
      if (SectionName.SECTION_SERVICE != this.currentSectionName) {
        document.getElementById(SectionName.SECTION_SERVICE).classList.add('tabs-item-valid');
      }
    }
    if (this.formGroup.get(this.commercialFormGroupName).valid) {
      if (SectionName.SECTION_COMMERCIAL != this.currentSectionName) {
        document.getElementById(SectionName.SECTION_COMMERCIAL).classList.add('tabs-item-valid');
      }
    }
    if (this.formGroup.get(this.senderPolicyFormGroupName).valid) {
      if (SectionName.SECTION_SENDER_POLICY != this.currentSectionName) {
        document.getElementById(SectionName.SECTION_SENDER_POLICY).classList.add('tabs-item-valid');
      }
    }
  }

  protected get isSingleConsigmentNoteVisible(): boolean {
    return this.isNew; // Hide if isNew is true
  }

  protected showUnlockButton(): boolean {
    return this.orderInfoData.railOrder.templateNumber &&
           this.editMode &&
           !this.orderInfoData.railOrder.orderKey?.orderNumber &&
           !this.orderInfoData.railOrder.orderId;
  }

  protected unlockOrderTemplate(): void {
    this.orderInfoData.railOrder.templateNumber = null;
    this.orderTemplateCachingService.setOrderTemplate(null);
    this.bookButtonEnabled = true;
    this.orderButtonEnabled = true;

    this.removeOrderTemplateValuesFromRailOrder();
    this.isValidTemplate = true
    this.formGroup.enable({ emitEvent: false });
    this.updateAllSections();
  }

  private removeOrderTemplateValuesFromRailOrder() {
    this.tempRailOrderNoTemplate = this.copyFromTo(this.orderInfoData.railOrder, this.railOrderNoTemplateService.getCompleteInitialRailOrderNoTemplate());

    this.orderInfoData.railOrder = { ...this.tempRailOrderNoTemplate, orderId: this.orderInfoData.railOrder.orderId, allowedActions: null, authorization: null };

    this.removeSpecialTreatmentOrders();
  }

  private removeSpecialTreatmentOrders() {
    const tempSpecialTreatments = this.orderInfoData.railOrder.specialTreatmentOrders;
    this.orderInfoData.railOrder.specialTreatmentOrders = new Array();
    const specialTreatmentsPromise = new Promise<SpecialTreatment[]>((resolve) => {
      this.newOrderService.getSpecialTreatments(false).subscribe({
        next: (specialTOs) => { resolve(specialTOs) }
      });
    }).then(res => {
      tempSpecialTreatments.forEach((spo: SpecialTreatmentOrder) => {
        if (res.find(s => s.code == spo.productExtraChargeCode) || spo.includedInPrepaymentNote) {
          this.orderInfoData.railOrder.specialTreatmentOrders.push(spo);
        }
      });
      this.updateAllSections();
    });
  }

  private copyFromTo(objOrg, objDest) {
    Object.keys(objDest).forEach(k => {
      if (objOrg.hasOwnProperty(k)) {
        if (Array.isArray(objOrg[k])) {
          const constructorName = objDest[k][0]?.constructor?.name;
          if (objDest[k][0] && this.railOrderNoTemplateService.CLASSES_STRING.includes(constructorName)) {
            objDest[k] = new Array();
            objOrg[k].forEach(o => {
              objDest[k].push(this.copyFromTo(o, new this.railOrderNoTemplateService.CLASSES[constructorName]()));
            });
          } else {
            objDest[k] = objOrg[k];
          }
        } else if (typeof objOrg[k] == 'object' && objOrg[k]) {
          objDest[k] = this.copyFromTo(objOrg[k], objDest[k]);
          // if(Object.keys(objDest[k]).length === 0) {
          //   objDest[k] = null;
          // }
        } else {
          objDest[k] = objOrg[k];
        }
      } else {
        delete objDest[k];
      }
    });
    return objDest;
  }

  private setDangerousGoodIndicator(wagonInformation: WagonInformation[]): WagonInformation[] {

    if (!wagonInformation) {
      return wagonInformation;
    }

    wagonInformation.forEach(wi => {

      wi.dangerousGoodIndicator = false
      const goods = wi.goods;
      if (goods) {
        goods.forEach(good => {
          const dangerousGood = good.dangerousGoods[0];
          if (dangerousGood?.unNr != null && dangerousGood.unNr != "" && dangerousGood?.unNr != "null") {
            wi.dangerousGoodIndicator = true
          } else {
            good.dangerousGoods = [];
          }
        });
      }
    });

    return wagonInformation;

  }

  protected specialTreatmentCharging(specialTreatmentOrders: SpecialTreatmentOrder[] | null) {

    specialTreatmentOrders?.forEach(specialTreatmentOrder => {
      if (specialTreatmentOrder?.specialTreatmentChargings) {
        specialTreatmentOrder.specialTreatmentChargings.forEach(stc => {
          stc.startAuthority = this.orderInfoData.railOrder.acceptancePoint?.authority;
          stc.startLocationCode = this.orderInfoData.railOrder.acceptancePoint?.locationCode;
          stc.endAuthority = this.orderInfoData.railOrder.deliveryPoint?.authority;
          stc.endLocationCode = this.orderInfoData.railOrder.deliveryPoint?.locationCode;
        });
      }
    });

    return specialTreatmentOrders
  }

  protected getCurrentConsignmentNote(): void {
    // Disable buttons to prevent multiple requests
    this.consignmentButtonEnabled = false;
    this.orderButtonEnabled = false;
    this.draftButtonEnabled = false;
    this.bookButtonEnabled = false;

    // Indicate that a loading operation is in progress
    this.loadingInProgress = true;
    this.checkRailOrder();
    // Call the service to get the Bill of Lading (Blob)
    this.railOrderBillOfloadingService.postRailOrdersBillOfLoading(
      this.orderInfoData.railOrder,
      (err) => {
        console.error('Error opening Bill of Lading:', err);

        // Optionally, re-enable the buttons here if an error occurs to allow retry
        this.consignmentButtonEnabled = true;
        this.orderButtonEnabled = true;
        this.bookButtonEnabled = true;
        this.draftButtonEnabled = true;
        this.loadingInProgress = false;

        // Optionally show a user-friendly message, e.g., using a toast or modal
        this.apiErrorDialogService.openApiErrorDialog(err);
      },
      () => {
        // Ensure buttons are re-enabled and loading is stopped, regardless of success or failure
        this.loadingInProgress = false;
        this.consignmentButtonEnabled = true;
        this.orderButtonEnabled = true;
        this.bookButtonEnabled = true;
        this.draftButtonEnabled = true;
      }
    );
  }


  private chargingSection(commercialTransportConditions: CommercialTransportConditions): CommercialTransportConditions {
    if (commercialTransportConditions?.chargingSections) {

      // Check if the first charging section exists
      if (commercialTransportConditions.chargingSections[0]) {
        // Update the existing charging section with data if any values are present
        const chargingSection = commercialTransportConditions.chargingSections[0];

        const startAuthority = this.orderInfoData.railOrder.acceptancePoint?.authority;
        const startLocationCode = this.orderInfoData.railOrder.acceptancePoint?.locationCode;
        const endAuthority = this.orderInfoData.railOrder.deliveryPoint?.authority;
        const endLocationCode = this.orderInfoData.railOrder.deliveryPoint?.locationCode;

        // Assign values only if they are not null, undefined, or empty
        if (startAuthority || startLocationCode || endAuthority || endLocationCode) {
          chargingSection.startAuthority = startAuthority;
          chargingSection.startLocationCode = startLocationCode;
          chargingSection.endAuthority = endAuthority;
          chargingSection.endLocationCode = endLocationCode;
        }
      } else {
        // Create a new charging section if none exists
        const startAuthority = this.orderInfoData.railOrder.acceptancePoint?.authority;
        const startLocationCode = this.orderInfoData.railOrder.acceptancePoint?.locationCode;
        const endAuthority = this.orderInfoData.railOrder.deliveryPoint?.authority;
        const endLocationCode = this.orderInfoData.railOrder.deliveryPoint?.locationCode;

        // Only add the new charging section if it contains any valid data
        if (startAuthority || startLocationCode || endAuthority || endLocationCode) {
          const chargingSection = {
            startAuthority,
            startLocationCode,
            endAuthority,
            endLocationCode
          };
          commercialTransportConditions.chargingSections.push(chargingSection);
        }
      }
    }

    // Return the updated commercialTransportConditions
    return commercialTransportConditions;
  }

  private clearErrors(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        control.setErrors(null); // Setzt alle Fehler zurück
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        // Rekursive Behandlung für FormGroup oder FormArray
        this.clearErrors(control);
      }
    });
  }

}
