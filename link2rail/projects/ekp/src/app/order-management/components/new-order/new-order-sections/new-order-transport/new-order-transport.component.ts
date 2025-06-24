import { AfterViewInit, Component, inject, Input } from '@angular/core';
import { SectionName } from '../../enums/order-enums';
import { CustomsDescriptor, initialCommercialConsignmentNote, initialCustomsData, RailOrder, TypeOfConsignment } from '../../../../models/rail-order-api';
import { SectionBase } from '../section.base';
import { FormControl, FormGroup } from '@angular/forms';
import { FormFieldService } from '../../service/form-field.service';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';
import { CodeNamePair, DangerousGoodLaw, Product } from '@src/app/order-management/models/general-order';
import { TypeOfConsignmentModel } from '../../models/type-of-consignment.class';
import { CustomsDescriptorModel } from '../../models/customs-Descriptor.class';

@Component({
  selector: 'app-new-order-transport',
  templateUrl: './new-order-transport.component.html',
  styleUrls: ['../../new-order-main/new-order-main.component.scss', './new-order-transport.component.scss']
})
export class NewOrderTransportComponent extends SectionBase implements AfterViewInit {

  @Input() currentSectionName: SectionName;
  @Input() editMode: boolean;

  public formGroup: FormGroup;

  protected SectionName = SectionName;
  protected transportationTypeList: CodeNamePair[] = [];
  protected typeOfTransportCodeList: CodeNamePair[] = [];
  protected dangerousgoodLawList: DangerousGoodLaw[] = [];
  protected products: Product[] = [];

  private railOrder: RailOrder;

  protected consignmentTypesList: TypeOfConsignmentModel[] = [
    new TypeOfConsignmentModel(TypeOfConsignment.CIM),
    new TypeOfConsignmentModel(TypeOfConsignment.CUV),
    new TypeOfConsignmentModel(TypeOfConsignment.NAT),
  ];

  protected CustomsDescriptorList: CustomsDescriptorModel[] = [
    new CustomsDescriptorModel(CustomsDescriptor.A),
    new CustomsDescriptorModel(CustomsDescriptor.D),
    new CustomsDescriptorModel(CustomsDescriptor.K),
    new CustomsDescriptorModel(CustomsDescriptor.N),
  ];


  private formFieldService: FormFieldService = inject(FormFieldService);
  private railOrderInternalService: RailOrderInternalService = inject(RailOrderInternalService);

  constructor() {
    super();
    this.createForm();
  }

  private createForm(): void {
    this.formGroup = new FormGroup({
      // transportationType: new FormControl(this.railOrder?.transportationType || ''),
      // typeOfTransportCode: new FormControl(this.railOrder?.modeOfTransport || ''),
      // dangerousgoodLaw: new FormControl(this.railOrder?.dangerousGoodLaw || ''),
      // coreConfiguration: new FormControl(this.railOrder?.coreConfiguration || ''),
      // orderedTrainReference: new FormControl(this.railOrder?.orderedTrainReference || ''),
      // customsDataCustomsDescriptor: new FormControl(this.railOrder?.customsData?.customsDescriptor || ''),
      // consignmentNoteTypeOfConsignment: new FormControl(this.railOrder?.consignmentNote?.typeOfConsignment || '')
      transportationType: new FormControl(),
      typeOfTransportCode: new FormControl(),
      dangerousgoodLaw: new FormControl(),
      coreConfiguration: new FormControl(),
      orderedTrainReference: new FormControl(),
      customsDataCustomsDescriptor: new FormControl(),
      consignmentNoteTypeOfConsignment: new FormControl()
    }, { updateOn: 'blur' });

    this.transportationType.valueChanges.subscribe((change) => {
      this.loadProducts();
    });
  }

  ngAfterViewInit() {
    if (!this.editMode) {
      this.formGroup.disable();
    }
  }

  public updateRailOrder(ro: RailOrder) {
    this.railOrder = ro;
    this.unsubscribeFromFormChanges();
    this.setFormValues();
    this.subscribeToFormChanges();
    this.disableFields();
  }

  private valueChangesSubscription = null;
  private subscribeToFormChanges(): void {
    // Subscribe to form changes only triggered by user input
    this.valueChangesSubscription = this.formGroup.valueChanges.subscribe((changes) => {
      // Check if the form is touched or dirty to ensure that only user input triggers the update
      if (this.formGroup.dirty || this.formGroup.touched) {
        this.updateRailOrderFromForm(changes);
      }
    });
  }

  private unsubscribeFromFormChanges(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }

  private setFormValues(): void {
    this.createSelectFields();
    this.coreConfiguration.setValue(this.railOrder?.coreConfiguration);
    this.orderedTrainReference.setValue(this.railOrder?.orderedTrainReference);
    this.customsDataCustomsDescriptor.setValue(this.railOrder?.customsData?.customsDescriptor);
    if (this.railOrder?.consignmentNote?.typeOfConsignment) {
      this.consignmentNoteTypeOfConsignment.setValue(this.railOrder?.consignmentNote?.typeOfConsignment);
    }
    else {
      if (!this.railOrder.consignmentNote) {
        this.railOrder.consignmentNote = {typeOfConsignment:TypeOfConsignment.NAT};
      }

      this.consignmentNoteTypeOfConsignment.setValue(TypeOfConsignment.NAT);
    }

  }

  private createSelectFields(): void {
    this.railOrderInternalService.getTransportationTypes().subscribe({
      next: list => {
        this.transportationTypeList = list;
        if (this.railOrder?.transportationType && !list.find(el => el.code == this.railOrder?.transportationType)) {
          // if transportation type is not in list from backend: add option to list
          this.transportationTypeList.push({ code: this.railOrder?.transportationType, name: this.railOrder?.transportationType });
        }
        this.transportationType.setValue(this.railOrder?.transportationType);
      },
      error: err => console.error(`Failed to load transportion types: ${err}`)
    });

    this.railOrderInternalService.getModesOfTransport().subscribe({
      next: list => {
        this.typeOfTransportCodeList = list;
        if (this.railOrder?.modeOfTransport && !list.find(el => el.code == this.railOrder?.modeOfTransport)) {
          // if mode of transport is not in list from backend: add option to list
          this.typeOfTransportCodeList.push({ code: this.railOrder?.modeOfTransport, name: this.railOrder?.modeOfTransport });
        }
        if (this.railOrder?.modeOfTransport) {
          this.typeOfTransportCode.setValue(this.railOrder?.modeOfTransport, { emitEvent: false });
        } else if(!this.railOrder.orderId) {
          this.railOrder.modeOfTransport = 'NT';
          this.typeOfTransportCode.setValue('NT', { emitEvent: false });
        }

      },
      error: err => console.error(`Failed to load modes of transport: ${err}`)
    });

    this.railOrderInternalService.getDangerousGoodLaws(
      this.railOrder?.shippingTimestamp ? new Date(this.railOrder.shippingTimestamp) : new Date()  // Use current date if shippingTimestamp is null
    ).subscribe({
      next: data => {
        // Filter only valid entries based on 'validFrom' and 'validTo' dates
        this.dangerousgoodLawList = data.filter(dgl => {
          const validFrom = new Date(dgl.validFrom);
          const validTo = dgl.validTo ? new Date(dgl.validTo) : null;  // If validTo is null, handle separately

          // Check if validFrom is >= current date or shippingTimestamp
          const isValidFrom = validFrom <= new Date(this.railOrder.shippingTimestamp || new Date());
          // Check if validTo is <= current date or shippingTimestamp, or if validTo is null
          const isValidTo = validTo === null || validTo >= new Date(this.railOrder.shippingTimestamp || new Date());

          return isValidFrom && isValidTo;
        });

        // If there are no valid entries and dangerousGoodLaw exists in the railOrder, add that as a valid entry
        if (
          this.railOrder?.dangerousGoodLaw &&
          this.railOrder?.dangerousGoodLaw.length > 0 &&
          !this.dangerousgoodLawList.find(dgl =>
            new Date(dgl.validFrom) <= new Date(this.railOrder.shippingTimestamp || new Date()) &&
            (!(dgl.validTo) || new Date(dgl.validTo) >= new Date(this.railOrder.shippingTimestamp || new Date()))
          )
        ) {
          this.dangerousgoodLawList.push({
            year: Number(this.railOrder?.dangerousGoodLaw),
            validFrom: '',
            validTo: '',
            text: this.railOrder?.dangerousGoodLaw
          });
        }

        // Set the form control value based on the dangerousGoodLaw or fallback to the first valid law year in the list
        const roDgl = this.railOrder?.dangerousGoodLaw ?
                      Number(this.railOrder?.dangerousGoodLaw) :
                      this.dangerousgoodLawList[0]?.year;

        this.dangerousgoodLaw.setValue(roDgl, { emitEvent: false });
      },
      error: err => {
        console.error(`Failed to load dangerous good law list: ${err}`);
        // Consider adding user-friendly error handling or alerts
      }
    });
  }

  private loadProducts() {
    if(this.transportationType.value || this.railOrder?.transportationType) {
      this.railOrderInternalService.getProducts(this.transportationType.value ? this.transportationType.value : this.railOrder.transportationType).subscribe({
        next: data => {
          this.products = data;
          this.coreConfiguration.setValue(this.railOrder?.coreConfiguration, { emitEvent: false });
        },
        error: err => console.error(`Failed to load products list: ${err}`)
      });
    }
  }

  private disableFields() {
    this.formFieldService.disableFields(this.formGroup, 'transport', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  }

  private updateRailOrderFromForm(changes: any): void {
    if (changes.consignmentNoteTypeOfConsignment) {
      if (!this.railOrder.consignmentNote) {
        this.railOrder.consignmentNote = {typeOfConsignment:undefined};
      }
      this.railOrder.consignmentNote.typeOfConsignment = this.formGroup.get('consignmentNoteTypeOfConsignment').value;
    }
    if (changes.customsDataCustomsDescriptor) {
      if (!this.railOrder.customsData) {
        this.railOrder.customsData = initialCustomsData();
      }
      this.railOrder.customsData.customsDescriptor = this.formGroup.get('customsDataCustomsDescriptor').value;
    }

    this.railOrder.transportationType = this.formGroup.get('transportationType').value;
    this.railOrder.modeOfTransport = this.formGroup.get('typeOfTransportCode').value;
    this.railOrder.dangerousGoodLaw = this.formGroup.get('dangerousgoodLaw').value ? `${this.formGroup.get('dangerousgoodLaw').value}` : null;
    this.railOrder.coreConfiguration = this.formGroup.get('coreConfiguration').value;
    this.railOrder.orderedTrainReference = this.formGroup.get('orderedTrainReference').value;
  }

  public validate(): string[] {
    console.log('validate consignor-consignee section');
    return [];
  }

  protected onChangeCustomsDataCustomsDescriptor($event: Event): void {
    // Implement this method based on your requirements
  }

  protected onChangeOrderedTrainReference($event: Event): void {
    // Implement this method based on your requirements
  }

  protected get transportationType(): FormControl {
    return this.formGroup.get('transportationType') as FormControl;
  }

  protected get typeOfTransportCode(): FormControl {
    return this.formGroup.get('typeOfTransportCode') as FormControl;
  }

  protected get dangerousgoodLaw(): FormControl {
    return this.formGroup.get('dangerousgoodLaw') as FormControl;
  }

  protected get coreConfiguration(): FormControl {
    return this.formGroup.get('coreConfiguration') as FormControl;
  }

  protected get orderedTrainReference(): FormControl {
    return this.formGroup.get('orderedTrainReference') as FormControl;
  }

  protected get customsDataCustomsDescriptor(): FormControl {
    return this.formGroup.get('customsDataCustomsDescriptor') as FormControl;
  }

  protected get consignmentNoteTypeOfConsignment(): FormControl {
    return this.formGroup.get('consignmentNoteTypeOfConsignment') as FormControl;
  }
}
