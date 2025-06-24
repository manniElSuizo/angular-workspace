import { AfterViewInit, ChangeDetectorRef, Component, inject, Injector, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CurrencyCode, getCurrencyList } from "../../models/new-order.model"
import { debounceTime, Observable, Subscription } from 'rxjs';
import { CodeNamePair, Country } from '@src/app/order-management/models/general-order';
import { AutocompleteDataList, AutocompleteService } from '@src/app/shared/components/form-dialog/auto-complete/auto-complete';
import { RailOrderInternalService } from '../../../../../order-management/service/rail-order-internal.service';
import { SectionName } from '../../enums/order-enums';
import { BorderAndCommercialLocationSummary, CarrierDeclaration, CommercialSpecification, CommercialTransportConditions, ConsignorDeclaration, ExternalReference, initialChargingSection, initialCommercialSpecification, initialPrepaymentUpTo, initialSpecialAnnotations, LoadingPoint, RailOrder, SectionalInvoicing, SpecialTreatmentOrder } from '../../../../models/rail-order-api';
import { FormFieldService } from '../../service/form-field.service';
import { NewOrderService } from '../../service/new-order.service';
import { SectionBase } from '../section.base';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { CommercialLocationSummaryPipe } from '@src/app/shared/pipes/commercial-location-summary.pipe';
import { PrepaymentNote, SpecialTreatment } from '@src/app/order-management/models/om-internal-api';
@Component({
  selector: 'app-new-order-commercial',
  templateUrl: './new-order-commercial.component.html',
  styleUrls: ['../../new-order-main/new-order-main.component.scss', './new-order-commercial.component.scss']
})
export class NewOrderCommercialComponent extends SectionBase implements OnInit, AfterViewInit {
  protected readonly authorization = Authorization;
  protected permissionService: PermissionService = inject(PermissionService);

  @Input() currentSectionName: SectionName;
  @Input() editMode: boolean;

  public formGroup: FormGroup;

  protected specialTreatments: SpecialTreatment[] = [];
  protected SectionName = SectionName;
  protected isAdditionalPrepaymentInput: boolean;
  protected isCommercialSpecification: boolean;
  protected isAdditionalCommercialInformation: boolean;
  protected isAnnotationOfConsignorDescription: boolean;
  protected isDbInternal: boolean;
  protected isSectionalInvoicing: boolean;
  protected railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);
  protected newOrderService: NewOrderService = inject(NewOrderService);
  protected railOrder: RailOrder;
  protected countries$: Observable<Country[]>;
  protected countries: Country[] = [];
  protected currencyList: CurrencyCode[] = [];
  protected suggestionsPepaymentUpToBoarderStations: AutocompleteDataList<BorderAndCommercialLocationSummary>[] = [];
  protected PepaymentUpToBoarderStation: LoadingPoint[] = [];
  protected selectedPepaymentUpToBoarderStation: BorderAndCommercialLocationSummary = null;
  protected commercialSpecificationsCodeName: CodeNamePair[] = [];
  protected prepaymentNodeCodeText: PrepaymentNote[] = [];

  private autocompleteService: AutocompleteService = inject(AutocompleteService);
  private formFieldService: FormFieldService = inject(FormFieldService);
  private commercialLocationPipe: CommercialLocationSummaryPipe = inject(CommercialLocationSummaryPipe);
  private subscription: Subscription = new Subscription();

  private shownSpecialTreatmentOrders: SpecialTreatmentOrder[] = new Array();
  private hiddenSpecialTreatmentOrders: SpecialTreatmentOrder[] = new Array();

  constructor(private injector: Injector,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef) {
    super();
    this.createForm();
  }

  ngOnInit(): void {
    this.loadCommercialSpecifications();
    this.loadPrepaymentNotes();
    this.loadspecialTreatments();
    this.countries$ = this.railOrderInternalService.getCountries();
    this.countries$.subscribe({ next: cl => this.countries = cl });
    this.currencyList = getCurrencyList();
    this.subscribeToFormChanges();
  }

  private loadCommercialSpecifications(): void {
    this.railOrderInternalService.getCommercialSpecifications().subscribe({
      next: (data: CodeNamePair[]) => {
        this.commercialSpecificationsCodeName = data;
      },
      error: (error) => {
        console.error('Error loading ComercialSepcifications', error);
      }
    });
  }

  private loadspecialTreatments(): void {
    this.subscription.add(
      this.newOrderService.getSpecialTreatments(false).subscribe({
        next: (data: SpecialTreatment[]) => {

          this.specialTreatments = data;
        },
        error: (err) => {
          console.error('Error fetching specialTreatments:', err);
        }
      }));
  }

  private loadPrepaymentNotes(): void {
    this.newOrderService.getPrepaymentNotes().subscribe({
      next: (data: PrepaymentNote[]) => {
        this.prepaymentNodeCodeText = data;
      },
      error: (error) => {
        console.error('Error loading PrepaimentNotes', error);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.editMode) this.formGroup.disable();
  }

  public updateRailOrder(ro: RailOrder) {
    this.railOrder = ro;
    this.updateCommercialSpecifications();
    this.prepareProductExtraChargeCodes();
    this.setFormValues();
    this.disableFields();
    this.cd.detectChanges();
  }

  private updateCommercialSpecifications(): void {
    // if (this.railOrder?.specialAnnotations?.commercialSpecifications?.length === 0 && this.commercialSpecifications?.length === 0) {
    //   this.addEmptyCommercialSpecification();
    // }
    this.addCommercialSpecification();
    /*
    this.commercialSpecifications.clear();

    for (const commercialSpecification of this.railOrder?.specialAnnotations?.commercialSpecifications) {
      this.addCommercialSpecification(commercialSpecification);
    }
      */
  }

  private disableFields() {
    this.formFieldService.disableFields(this.formGroup, 'commercial', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  }

  private subscribeToFormChanges(): void {
    // Subscribe to form changes only triggered by user input
    this.formGroup.valueChanges.subscribe((changes) => {
      // Check if the form is touched or dirty to ensure that only user input triggers the update
      if (this.formGroup.dirty || this.formGroup.touched) {
        this.updateRailOrderFromForm(changes);
      }
    });
  }

  updateTakeoverConditions(changes: Partial<{ loadingAuthorisation: string }>): void {
    if (!this.railOrder?.takeOverConditions) {
      this.railOrder = { ...this.railOrder, takeOverConditions: {} }; // Initialize if undefined
    }

    if ('loadingAuthorisation' in changes) {
      this.railOrder.takeOverConditions.loadingAuthorisation = changes.loadingAuthorisation;
    }
  }

  private updateRailOrderFromForm(changes: any): void {
    this.updateSpecialAnnotations(changes);
    this.updateCommercialTransportConditions(changes);
    this.updateExternalReferences(changes);
    this.updateConsignmentnoteConsigmentNumber(changes);
    this.updateContractNumber(changes);
    this.updateOrCreateSectionalInvoicing(changes);
    this.updateTakeoverConditions(changes);
    this.cd.detectChanges();
  }

  private updateSpecialAnnotations(changes: Partial<{
    consignorDeclarations: ConsignorDeclaration[];
    commercialSpecifications: CommercialSpecification[];
    carrierDeclarations: CarrierDeclaration[];
    annotationOfConsignorDescription: string;
  }>) {
    // Ensure specialAnnotations exists
    if (!this.railOrder?.specialAnnotations) {
      this.railOrder.specialAnnotations = {}; // Initialize if undefined
    }

    // Update consignorDeclarations (limit to max 5)
    if (changes.consignorDeclarations) {
      this.railOrder.specialAnnotations.consignorDeclarations = [
        ...(this.railOrder.specialAnnotations.consignorDeclarations || []),
        ...changes.consignorDeclarations
      ].slice(0, 5);
    }

    // Update carrierDeclarations (limit to max 30)
    if (changes.carrierDeclarations) {
      this.railOrder.specialAnnotations.carrierDeclarations = [
        ...(this.railOrder.specialAnnotations.carrierDeclarations || []),
        ...changes.carrierDeclarations
      ].slice(0, 30);
    }

    // Update annotationOfConsignorDescription
    if (this.railOrder.specialAnnotations?.annotationOfConsignorDescription && !changes.annotationOfConsignorDescription) {
      this.railOrder.specialAnnotations.annotationOfConsignorDescription = null;
    } else if (changes.annotationOfConsignorDescription) {
      this.railOrder.specialAnnotations.annotationOfConsignorDescription = changes.annotationOfConsignorDescription;
    }
  }



  private updateCommercialTransportConditions(changes: Partial<CommercialTransportConditions>): void {
    if (!this.railOrder.commercialTransportConditions) {
      this.railOrder.commercialTransportConditions = {};
    }

    if ('prepaymentNote' in changes) {
      this.railOrder.commercialTransportConditions.prepaymentNote = changes.prepaymentNote;
    }

    if ('discountCode' in changes) {
      this.railOrder.commercialTransportConditions.discountCode = changes.discountCode;
    }

    if ('valueOfDelivery' in changes) {
      this.railOrder.commercialTransportConditions.valueOfDelivery = {
        ...this.railOrder.commercialTransportConditions.valueOfDelivery,
        ...changes.valueOfDelivery,
      };
    }

    if ('commercialInformationNhmCode' in changes) {
      const chargingSections = this.railOrder.commercialTransportConditions.chargingSections;

      // Ensure chargingSections exists and has at least one element
      if (chargingSections.length < 1) {
        chargingSections.push(initialChargingSection());
      }

      // Set nhmCode based on the length of commercialInformationNhmCode
      chargingSections[0].nhmCode = (typeof changes.commercialInformationNhmCode === 'string' && changes.commercialInformationNhmCode.length > 1)
        ? changes.commercialInformationNhmCode
        : null;
    }

    if ('commercialInformationContractNumber' in changes) {
      // Ensure chargingSections exists and has at least one element
      const chargingSections = this.railOrder.commercialTransportConditions.chargingSections;
      if (chargingSections.length < 1) {
        chargingSections.push(initialChargingSection());
      }

      // Set tariffNumber based on the length of commercialInformationContractNumber
      chargingSections[0].tariffNumber = (typeof changes.commercialInformationContractNumber === 'string' && changes.commercialInformationContractNumber.length > 1)
        ? changes.commercialInformationContractNumber
        : null;

      this.railOrder.contractNumber = (typeof changes.commercialInformationContractNumber === 'string' && changes.commercialInformationContractNumber.length > 1)
        ? changes.commercialInformationContractNumber
        : null;
    }

    if ('valueOfCommodity' in changes) {
      this.railOrder.commercialTransportConditions.valueOfCommodity = {
        ...this.railOrder.commercialTransportConditions.valueOfCommodity,
        ...changes.valueOfCommodity,
      };
    }

    // if ('prepaymentUpToAuthority' in changes || 'prepaymentUpToBorderDescription' in changes) {
    //   if (this.prepaymentUpToBorderDescription.value || this.prepaymentUpToAuthority.value) {
    //     if (!this.railOrder.commercialTransportConditions.prepaymentUpTo) {
    //       this.railOrder.commercialTransportConditions.prepaymentUpTo = {};
    //     }
    //   }
    //   if (this.prepaymentUpToAuthority.value) {
    //     this.railOrder.commercialTransportConditions.prepaymentUpTo.authority = this.prepaymentUpToAuthority.value;
    //   }
    //   if (this.prepaymentUpToBorderDescription.value) {
    //     this.railOrder.commercialTransportConditions.prepaymentUpTo.borderDescription = this.prepaymentUpToBorderDescription.value;
    //   }
    // }
  }


  private updateOrCreateSectionalInvoicing(changes: Partial<{ sectionalInvoicingCarrierCode: string, executingCarrierRuCode: string }>): void {
    // Ensure that sectionalInvoicings exists
    if (!this.railOrder?.commercialTransportConditions?.sectionalInvoicings) {
      this.railOrder.commercialTransportConditions = {
        ...this.railOrder.commercialTransportConditions,
        sectionalInvoicings: [],
      }; // Initialize sectionalInvoicings if undefined
    }

    // Check if changes contain a sectionalInvoicingCarrierCode or executingCarrierRuCode to update or create
    if (changes.sectionalInvoicingCarrierCode || changes.executingCarrierRuCode) {

      const existingInvoicing = this.railOrder.commercialTransportConditions.sectionalInvoicings[0];


      if (existingInvoicing) {
        // If the sectional invoicing exists, update it
        existingInvoicing.executingCarrierRUCode = changes.executingCarrierRuCode ?? existingInvoicing.executingCarrierRUCode;
        existingInvoicing.sectionalInvoicingCarrierCode = changes.sectionalInvoicingCarrierCode ?? existingInvoicing.sectionalInvoicingCarrierCode;
      } else {
        // If no existing invoicing, create a new one
        const newSectionalInvoicing: SectionalInvoicing = {
        };
        if (changes.sectionalInvoicingCarrierCode) {
          newSectionalInvoicing.sectionalInvoicingCarrierCode = changes.sectionalInvoicingCarrierCode!
        }
        if (changes.executingCarrierRuCode) {
          newSectionalInvoicing.sectionalInvoicingCarrierCode = changes.executingCarrierRuCode!
        }
        this.railOrder.commercialTransportConditions.sectionalInvoicings.push(newSectionalInvoicing);
      }
    }
  }


  private updateExternalReferences(changes: Partial<{ commercialInformationExternalReferenceIdentifier: string; commercialInformationExternalReferenceConsigmentNumber: string; }>): void {

    if (!this.railOrder.externalReferences) {
      this.railOrder.externalReferences = [];
    }
    const referenceTypes = [
      { type: 'ALY', identifier: changes.commercialInformationExternalReferenceIdentifier },
      { type: 'IID', identifier: changes.commercialInformationExternalReferenceConsigmentNumber },
    ];
    const updatedReferences = this.railOrder.externalReferences.map((ref) => {
      const matchingChange = referenceTypes.find(change => change.type === ref.type);
      return matchingChange?.identifier
        ? { ...ref, identifier: matchingChange.identifier }
        : ref;
    });
    referenceTypes.forEach((newRef) => {
      if (newRef.identifier && !updatedReferences.some(ref => ref.type === newRef.type)) {
        updatedReferences.push(newRef);
      }
    });
    this.railOrder.externalReferences = updatedReferences;
  }

  private updateConsignmentnoteConsigmentNumber(changes: Partial<{ consignmentnoteConsigmentNumber: number }>): void {
    if (!changes.consignmentnoteConsigmentNumber) {
      if (this.railOrder.consignmentNote?.consignmentNumber) {
        this.railOrder.consignmentNote.consignmentNumber = undefined;
        return;
      }
    }
    if (!this.railOrder.consignmentNote) {
      this.railOrder.consignmentNote = { consignmentNumber: undefined };
    }
    this.railOrder.consignmentNote.consignmentNumber = changes.consignmentnoteConsigmentNumber;
  }

  private updateContractNumber(changes: Partial<{ commercialInformationContractNumber: string }>): void {
    if (changes.commercialInformationContractNumber) {
      this.railOrder.contractNumber = changes.commercialInformationContractNumber;
    }
  }

  private setFormValues(): void {
    this.prepaymentNote?.setValue(this.railOrder?.commercialTransportConditions?.prepaymentNote);
    this.setProductExtraChargeCodes();

    this.prepaymentUpToAuthority.setValue(this.railOrder?.commercialTransportConditions?.prepaymentUpTo?.authority)
    const prepaymentUpTo = this.railOrder?.commercialTransportConditions?.prepaymentUpTo;
    if (prepaymentUpTo) {
      const code = prepaymentUpTo.borderCode ?? prepaymentUpTo.locationCode;
      const name = prepaymentUpTo.borderCode
        ? prepaymentUpTo.borderName
        : prepaymentUpTo.locationName;

      this.prepaymentUpToBorderDescription.setValue(code ? `${name} (${code})` : name || null);
    }

    if (!this.railOrder?.specialAnnotations) {
      this.railOrder.specialAnnotations = initialSpecialAnnotations();
    }

    /*
    this.commercialSpecifications.clear();

    for (const commercialSpecification of this.railOrder?.specialAnnotations?.commercialSpecifications) {
      this.addCommercialSpecification(commercialSpecification);
    }
    */

    // Verladebewilligung
    this.loadingAuthorisation.setValue(this.railOrder?.takeOverConditions?.loadingAuthorisation);
    // Vereinbahrte NHM
    this.commercialInformationNhmCode.setValue(this.railOrder?.commercialTransportConditions?.chargingSections[0]?.nhmCode);
    // Vertragsnummer Nat
    this.commercialInformationContractNumber.setValue(this.railOrder?.contractNumber);
    // Kundenabkommen int
    this.commercialInformationDiscountCode.setValue(this.railOrder?.commercialTransportConditions?.discountCode);
    // Kundenabkommen International
    this.commercialInformationValueOfCommodityPrice.setValue(this.railOrder?.commercialTransportConditions?.valueOfCommodity?.price);
    this.commercialInformationValueOfCommodityCurrency.setValue(this.railOrder?.commercialTransportConditions?.valueOfCommodity?.currency);
    // Interesse an der Lieferung
    this.commercialInformationValueOfDeliveryPrice.setValue(this.railOrder?.commercialTransportConditions?.valueOfDelivery?.price);
    this.commercialInformationValueOfDeliveryCurrency.setValue(this.railOrder?.commercialTransportConditions?.valueOfDelivery?.currency);
    // Weitere Absendererklärung für den Empfänger
    this.annotationOfConsignorDescription.setValue(this.railOrder?.specialAnnotations?.annotationOfConsignorDescription)
    // Rahmenkostenstelle = External Reference of Type ALY
    const externalReferenceIdentifierALY = this.getRailOrderExternalReferenceByType('ALY');
    this.commercialInformationExternalReferenceIdentifier.setValue(externalReferenceIdentifierALY?.identifier);
    // Auftragskurznummer = External Reference of Type IID
    const externalReferenceIdentifierIID = this.getRailOrderExternalReferenceByType('IID');
    this.commercialInformationExternalReferenceConsigmentNumber.setValue(externalReferenceIdentifierIID?.identifier);
    this.consignmentnoteConsigmentNumber.setValue(this.railOrder?.consignmentNote?.consignmentNumber);
    // Transitfakturiertung
    // Strecke/Land
    this.executingCarrierRuCode.setValue(this.railOrder?.commercialTransportConditions?.sectionalInvoicings?.[0]?.executingCarrierRUCode);
    // durch Beförderer
    this.sectionalInvoicingCarrierCode.setValue(this.railOrder?.commercialTransportConditions?.sectionalInvoicings?.[0]?.sectionalInvoicingCarrierCode);
  }

  private prepareProductExtraChargeCodes() {
    this.shownSpecialTreatmentOrders = new Array();
    this.hiddenSpecialTreatmentOrders = new Array();
    let shownElementsCount = 0;
    this.railOrder.specialTreatmentOrders.forEach((sto) => {
      if (sto.includedInPrepaymentNote && shownElementsCount < 5) {
        this.shownSpecialTreatmentOrders.push(sto);
        shownElementsCount++;
      } else {
        this.hiddenSpecialTreatmentOrders.push(sto);
      }
    });
  }

  private setProductExtraChargeCodes() {
    this.productExtraChargeCodes.controls.forEach(c => c.get('productExtraChargeCode').setValue(null, { emitEvent: false }));
    this.shownSpecialTreatmentOrders.forEach((sto, i) => {
      if (i < 5) {
        this.getProductExtraChargeAtIndex(i)?.setValue(sto.productExtraChargeCode);
      }
    });
  }

  private getRailOrderExternalReferenceByType(type: string): ExternalReference | null {
    if (this.railOrder?.externalReferences && Array.isArray(this.railOrder.externalReferences)) {
      const foundReference = this.railOrder.externalReferences.find(
        (ref) => ref.type === type
      );
      // Return the found reference or null if not found
      return foundReference ?? null;
    }
    return null;
  }

  private createForm(): void {
    this.formGroup = new FormGroup({
      prepaymentNote: new FormControl(),
      productExtraChargeCodes: this.formBuilder.array([]),
      prepaymentUpToAuthority: new FormControl(),
      prepaymentUpToBorderDescription: new FormControl(),
      commercialSpecifications: this.formBuilder.array([]),
      loadingAuthorisation: new FormControl(),
      commercialInformationNhmCode: new FormControl(),
      commercialInformationContractNumber: new FormControl(),
      commercialInformationDiscountCode: new FormControl(),
      commercialInformationValueOfCommodityPrice: new FormControl(),
      commercialInformationValueOfCommodityCurrency: new FormControl(),
      commercialInformationValueOfDeliveryPrice: new FormControl(),
      commercialInformationValueOfDeliveryCurrency: new FormControl(),
      annotationOfConsignorDescription: new FormControl(),
      commercialInformationExternalReferenceIdentifier: new FormControl(),
      commercialInformationExternalReferenceConsigmentNumber: new FormControl(),
      consignmentnoteConsigmentNumber: new FormControl(),
      executingCarrierRuCode: new FormControl(),
      sectionalInvoicingCarrierCode: new FormControl()
    }, { updateOn: 'blur' });
    this.commercialSpecifications.valueChanges.subscribe({
      next: vc => this.onCommercialSpecificationsBlur()
    });

    for (let i = 0; i < 5; i++) {
      (this.formGroup.get('productExtraChargeCodes') as FormArray).push(new FormGroup({ 'productExtraChargeCode': new FormControl() }));
    }
  }

  protected deleteItem(idx: number): void {
    if (this.commercialSpecifications.length > 1) {
      this.commercialSpecifications.removeAt(idx, { emitEvent: true });
    }
  }

  // protected addProdcutExtraChargeCode(item?: number): void {
  //   const itemGroup: FormGroup = this.formBuilder.group({});
  //   if (item) {
  //     itemGroup.addControl('productExtraChargeCode', new FormControl(item));
  //   } else {
  //     itemGroup.addControl('productExtraChargeCode', new FormControl());
  //   }
  // }

  private addCommercialSpecification(): void {
    this.commercialSpecifications.clear({emitEvent: false});
    this.railOrder.specialAnnotations.commercialSpecifications.forEach(item => {
      const itemGroup: FormGroup = this.formBuilder.group({});
      itemGroup.addControl('additionalInformation', new FormControl(item?.additionalInformation), { emitEvent: false });
      itemGroup.addControl('code', new FormControl(item?.code), { emitEvent: false });
      this.commercialSpecifications.push(itemGroup, { emitEvent: false });
    });

    if (this.commercialSpecifications.length < 1) {
      this.addEmptyCommercialSpecification();
    }
  }

  protected addEmptyCommercialSpecification() {
    const itemGroup: FormGroup = this.formBuilder.group({});
    itemGroup.addControl('additionalInformation', new FormControl(), { emitEvent: false });
    itemGroup.addControl('code', new FormControl(), { emitEvent: false });
    this.commercialSpecifications.push(itemGroup, { emitEvent: false });
  }

  public validate(): string[] {
    return [];
  }

  protected toggleSectionalInvoicing(): void {
    this.isSectionalInvoicing = !this.isSectionalInvoicing;
  }

  protected toggleAdditionalPrepaymentInput(): void {
    this.isAdditionalPrepaymentInput = !this.isAdditionalPrepaymentInput;
  }

  protected toggleCommercialSpecification(): void {
    this.isCommercialSpecification = !this.isCommercialSpecification;
  }

  protected toggleAdditionalCommercialInformation(): void {
    this.isAdditionalCommercialInformation = !this.isAdditionalCommercialInformation;
  }

  protected toggleAnnotationOfConsignorDescription(): void {
    this.isAnnotationOfConsignorDescription = !this.isAnnotationOfConsignorDescription;
  }

  protected toggleDbInternal(): void {
    this.isDbInternal = !this.isDbInternal;
  }

  protected get prepaymentNote(): FormControl {
    return this.formGroup.get('prepaymentNote') as FormControl;
  }

  protected get productExtraChargeCodes(): FormArray {
    return this.formGroup.get('productExtraChargeCodes') as FormArray;
  }

  protected getProductExtraChargeAtIndex(index: number): FormControl {
    return this.productExtraChargeCodes?.controls?.at(index)?.get('productExtraChargeCode') as FormControl;
  }

  protected get prepaymentUpToAuthority(): FormControl {
    return this.formGroup.get('prepaymentUpToAuthority') as FormControl;
  }

  protected get prepaymentUpToBorderDescription(): FormControl {
    return this.formGroup.get('prepaymentUpToBorderDescription') as FormControl;
  }

  protected get commercialSpecifications(): FormArray {
    return this.formGroup.get('commercialSpecifications') as FormArray;
  }

  protected get loadingAuthorisation(): FormControl {
    return this.formGroup.get('loadingAuthorisation') as FormControl;
  }

  protected get commercialInformationNhmCode(): FormControl {
    return this.formGroup.get('commercialInformationNhmCode') as FormControl;
  }

  protected get commercialInformationContractNumber(): FormControl {
    return this.formGroup.get('commercialInformationContractNumber') as FormControl;
  }

  protected get commercialInformationDiscountCode(): FormControl {
    return this.formGroup.get('commercialInformationDiscountCode') as FormControl;
  }

  protected get commercialInformationValueOfCommodityPrice(): FormControl {
    return this.formGroup.get('commercialInformationValueOfCommodityPrice') as FormControl;
  }

  protected get commercialInformationValueOfCommodityCurrency(): FormControl {
    return this.formGroup.get('commercialInformationValueOfCommodityCurrency') as FormControl;
  }

  protected get commercialInformationValueOfDeliveryPrice(): FormControl {
    return this.formGroup.get('commercialInformationValueOfDeliveryPrice') as FormControl;
  }

  protected get commercialInformationValueOfDeliveryCurrency(): FormControl {
    return this.formGroup.get('commercialInformationValueOfDeliveryCurrency') as FormControl;
  }

  protected get commercialInformationExternalReferenceIdentifier(): FormControl {
    return this.formGroup.get('commercialInformationExternalReferenceIdentifier') as FormControl;
  }

  protected get annotationOfConsignorDescription(): FormControl {
    return this.formGroup.get('annotationOfConsignorDescription') as FormControl;
  }

  protected get commercialInformationExternalReferenceConsigmentNumber(): FormControl {
    return this.formGroup.get('commercialInformationExternalReferenceConsigmentNumber') as FormControl;
  }

  protected get consignmentnoteConsigmentNumber(): FormControl {
    return this.formGroup.get('consignmentnoteConsigmentNumber') as FormControl;
  }

  protected get executingCarrierRuCode(): FormControl {
    return this.formGroup.get('executingCarrierRuCode') as FormControl;
  }

  protected get sectionalInvoicingCarrierCode(): FormControl {
    return this.formGroup.get('sectionalInvoicingCarrierCode') as FormControl;
  }

  private updatePepaymentUpToBoarderStation(): void {
    if (!this.selectedPepaymentUpToBoarderStation) {
      this.railOrder.commercialTransportConditions.prepaymentUpTo = null;
      return;
    }

    this.railOrder.commercialTransportConditions.prepaymentUpTo = initialPrepaymentUpTo();

    if (this.selectedPepaymentUpToBoarderStation?.uicBorderCode) {
      this.railOrder.commercialTransportConditions.prepaymentUpTo.borderCode = this.selectedPepaymentUpToBoarderStation?.uicBorderCode;
      this.railOrder.commercialTransportConditions.prepaymentUpTo.borderName = this.selectedPepaymentUpToBoarderStation?.name;
      this.railOrder.commercialTransportConditions.prepaymentUpTo.authority = this.selectedPepaymentUpToBoarderStation?.uicRailAuthorityCode
    }
    if (this.selectedPepaymentUpToBoarderStation?.locationCode) {
      this.railOrder.commercialTransportConditions.prepaymentUpTo.locationCode = this.selectedPepaymentUpToBoarderStation?.locationCode
      this.railOrder.commercialTransportConditions.prepaymentUpTo.locationName = this.selectedPepaymentUpToBoarderStation?.name;
      this.railOrder.commercialTransportConditions.prepaymentUpTo.authority = this.selectedPepaymentUpToBoarderStation?.uicRailAuthorityCode
    }
  }

  protected onSelectionChangeStation($event: any): void {
    if (!$event?.target?.value || $event?.target?.value.trim().length < 1) {
      this.railOrder.commercialTransportConditions.prepaymentUpTo = initialPrepaymentUpTo();
      return;
    }

    const found: BorderAndCommercialLocationSummary = this.autocompleteService.findByDisplayName<BorderAndCommercialLocationSummary>($event.target.value, this.suggestionsPepaymentUpToBoarderStations);
    this.selectedPepaymentUpToBoarderStation = found;
    this.updatePepaymentUpToBoarderStation();
  }

  protected loadStations($event: any): void {
    if (!$event.key || !/^[a-z0-9\s_\-\.\,]+$/i.test($event.key)) {
      return;
    }
    if (!($event.target.value && $event.target.value.length > 2)) {
      return;
    }

    const uicCountryCode = this.prepaymentUpToAuthority.value;

    this.railOrderInternalService.getCommercialAndBorderLocations($event.target.value, uicCountryCode).pipe(debounceTime(500)).subscribe({
      next: (clList: BorderAndCommercialLocationSummary[]) => {
        this.suggestionsPepaymentUpToBoarderStations = this.autocompleteService.resultListToDataList<BorderAndCommercialLocationSummary>(
          clList,
          cl => {
            // const code = cl.uicBorderCode ?? cl.locationCode;
            // const comLoc: CommercialLocationSummary = {
            //   ...cl,
            //   locationCode: `${code}`
            // }
            // return code ? `${cl.name} (${code})` : cl.name;
            return this.commercialLocationPipe.transform(cl);
          }
        );
      }
    });
  }

  protected clearInputprepaymentUpToBorderDescription() {
    this.prepaymentUpToBorderDescription.setValue(null);
    this.selectedPepaymentUpToBoarderStation = null;
    this.updatePepaymentUpToBoarderStation();
  }

  protected clearInput(control: FormControl) {
    control.setValue(null);
  }

  protected onProductExtraChargeCodeBlur(index: number): void {
    const value = this.productExtraChargeCodes.at(index).get('productExtraChargeCode').value;

    const st = this.getSpecialTreatmentByCode(value);
    if (!st || !value) {
      this.productExtraChargeCodes.at(index).get('productExtraChargeCode').setValue(null);
      if (this.shownSpecialTreatmentOrders[index]) {
        this.shownSpecialTreatmentOrders.splice(index, 1);
      }
      this.railOrder.specialTreatmentOrders = this.shownSpecialTreatmentOrders.filter(sto => sto && sto.productExtraChargeCode).concat(this.hiddenSpecialTreatmentOrders);
      return;
    }

    this.shownSpecialTreatmentOrders[index] = { productExtraChargeCode: st.code, productName: st.name, includedInPrepaymentNote: true };

    // TODO
    // Clarify: what happens to duplicate values in railOrder.specialTreatmentOrders? => clarified: it must be possible to add doubles
    // Clarify: what happens to hidden codes on unlock template?
    this.railOrder.specialTreatmentOrders = this.shownSpecialTreatmentOrders.concat(this.hiddenSpecialTreatmentOrders);
  }

  protected onCommercialSpecificationsBlur(): void {
    // Retrieve current values from the form array
    const formValues = this.commercialSpecifications.value;

    const commSpecs: CommercialSpecification[] = [];

    // Map form values to the desired structure without filtering
    formValues.forEach((item: any) => {
      let count = 0;
      if (item.code && item.additionalInformation && count < 5) {
        commSpecs.push({
          code: item.code,
          additionalInformation: item.additionalInformation,
        });
        count++;
      }
    });

    if (!this.railOrder.specialAnnotations) {
      this.railOrder.specialAnnotations = {};
    }

    this.railOrder.specialAnnotations.commercialSpecifications = commSpecs;
  }

  private getSpecialTreatmentByCode(code: number): SpecialTreatment {
    return this.specialTreatments.find(treatment => treatment.code === Number(code));
  }
}
