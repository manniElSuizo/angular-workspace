import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Input, inject, HostListener, AfterContentChecked } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { debounceTime, Subject } from "rxjs";
import { DangerousGood, ExternalReference, Goods, initialDangerousGood, initialGood, initialPackingUnit, PackingUnit, RailOrder, WagonInformation } from "@src/app/order-management/models/rail-order-api";
import { CodeNamePair } from "@src/app/order-management/models/general-order";
import { EmptyPackaging, VolumeUnit } from "@src/app/shared/enums/unit.enum";
import { ApiDangerousGoodResponse, DangerousGoodObject, ApiGoodResponse, DangerousGoodModel, GoodModel } from "@src/app/trainorder/models/Cargo.model";
import { ExternalReferenceMrnService } from "@src/app/order-management/components/new-order/service/external-reference-mrn.service";
import { FormFieldService } from "@src/app/order-management/components/new-order/service/form-field.service";
import { NewOrderService } from "@src/app/order-management/components/new-order/service/new-order.service"
import { NewOrderWagonDetailDialogService } from "@src/app/order-management/components/new-order/new-order-sections/new-order-wagon-data/service/new-order-wagon-detail-dialog.service";
import { RailOrderInternalService } from "@src/app/order-management/service/rail-order-internal.service";
import { TrainorderService } from "@src/app/trainorder/services/trainorder.service";
import { WagonValidationService } from "@src/app/order-management/components/new-order/service/wagon-validation-service.service";
import { DangerousGoodsSelectionDialogComponent } from "./dangerous-goods-selection-dialog/dgs.component";
import { ValidationMode } from "@src/app/order-management/components/new-order/validators/validator-field.config";
import { BaseValidators } from "../../../../validators/base-validations";
import { WagonInformationUtils } from "../wagon-information-utils";
import { OrderTemplateCachingService } from "../../../../service/order-template-caching.service";
@HostListener('blur', ['$event'])
@Component({
  selector: 'app-goods-information-list',
  templateUrl: './goods-information-list.component.html',
  styleUrls: ['./goods-information-list.component.scss']
})
export class GoodsInformationListComponent implements OnInit, AfterViewInit, AfterContentChecked {
  @Input() railOrder: RailOrder;
  @Input() idx: number; // wagon
  @Input() editMode: boolean;
  @Input() formGroup: FormGroup;
  @Input() validationMode: ValidationMode;
  @Input() isFastEntry: boolean;

  private dangerousGoodIndex: number = 0;
  private nhmCodeInputChange: Subject<string> = new Subject<string>();
  private dangerousCargoInputChange: Subject<string> = new Subject<string>();
  private dangerousGoodsDialogRef: MatDialogRef<DangerousGoodsSelectionDialogComponent> = null;
  private dangerousLawValidTostring = null; 
  protected hasAC: boolean;
  protected isDangerousGoods: boolean[] = [false, false, false, false];
  protected emptyPackingUnitList: CodeNamePair[] = [];
  protected specialInstructionsList: CodeNamePair[] = [];
  protected scrap: CodeNamePair[] = [];
  protected packagingUnits: CodeNamePair[] = [];
  protected volumeUnits: CodeNamePair[] = [];
  protected mrnTypes: { [goodIdx: number]: CodeNamePair[] } = {};
  protected nhmCodeAutocomplete: GoodModel[] = [];
  protected dangerousGoodsAutocomplete: DangerousGoodModel[] = [];
  private formFieldService: FormFieldService = inject(FormFieldService);
  private wagonValidationService: WagonValidationService = inject(WagonValidationService);
  private orderTemplateCachingService: OrderTemplateCachingService = inject(OrderTemplateCachingService);
  private ac : RailOrder;
  
  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private newOrderWagonDetailService: NewOrderWagonDetailDialogService,
    private trainorderService: TrainorderService,
    private railOrderInternalService: RailOrderInternalService,
    private externalReferenceMrnService: ExternalReferenceMrnService
  ) {
    this.registerForInputChanges();
  }

  ngOnInit(): void {
    this.initForm();
    this.wagonValidationService.setValidationMode(this.validationMode);
  }
  
  ngAfterViewInit() {
    this.ac = this.orderTemplateCachingService.getOrderTemplate();
    this.prepareOrderForm();

    this.cd.detectChanges();
  }

  ngAfterContentChecked(): void {
      this.wagonValidationService.validateSingleWagon(this.railOrder, this.railOrder.wagonInformation[this.idx], this.validationMode, this.formGroup);
  }
  
  private prepareOrderForm(): void {
    // This method holds the code that should be executed after the template is loaded
    this.createDropdownContents();
  
    this.hasAC = this.railOrder?.templateNumber?.trim().length > 0;
  
    // Ensure that goods is initialized if it's empty
    if (!this.railOrder.wagonInformation[this.idx].goods || this.railOrder.wagonInformation[this.idx].goods.length === 0) {
      this.railOrder.wagonInformation[this.idx].goods.push(initialGood());
    }
  
    this.createForm();
    this.setBzaNumber();
  
    // Disable/enable fields depending on the context
    this.formFieldService.disableFields(this.formGroup, 'wagonDetails', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  
    // Perform wagon validation
    this.wagonValidationService.validateSingleWagon(this.railOrder, this.railOrder.wagonInformation[this.idx], this.validationMode, this.formGroup);
  }

  private registerForInputChanges(): void {
    this.nhmCodeInputChange.pipe(debounceTime(500)).subscribe((input: string) => {
      this.getNhmCodeAutocomplete(input);
    });
    this.dangerousCargoInputChange.pipe(debounceTime(500)).subscribe((input: string) => {
      this.getDangerousCargoAutocomplete(input);
    });
  }


  private createDropdownContents(): void {
    this.createAdditionalDeclarations();
    this.createpackingUnitTypes();
    this.createVolumeUnits();
    this.createEmptyPackaging();
    this.createSpecialInstructions();
  }

  private createEmptyPackaging(): void {
    this.emptyPackingUnitList = [];
    Object.keys(EmptyPackaging).filter(key => {
      const codeNamePair: CodeNamePair = {
        name: key,
        code: EmptyPackaging[key]
      };
      this.emptyPackingUnitList.push(codeNamePair);
    });
  }

  private createSpecialInstructions(): void {
    this.railOrderInternalService.getSpecialInstructions().subscribe((result: CodeNamePair[]) => {
      this.specialInstructionsList = result;
    });
  }

  private createMrnTypes(goodIdx: number, addionalMrnType: string | null): void {
    const allowedMrnTypes = ['03', '04', '05', '06', '07', '08', '09'];
    if (addionalMrnType) allowedMrnTypes.push(addionalMrnType);

    this.externalReferenceMrnService.getAllMrnTypes().subscribe({
      next: (result: CodeNamePair[]) => {
        // Step 1: Filter allowed MRN codes
        const filteredCodes: CodeNamePair[] = result.filter(item => allowedMrnTypes.includes(item.code));
        const wagon = this.railOrder.wagonInformation[this.idx];
        
        // Step 2: Check mrnReference has a non default MRN Type. (First MRN from wagon, other from good external References)
        if (goodIdx == 0 && wagon?.externalReferences) {
          const mrnReferences = wagon.externalReferences.filter(ref => ref.type === "MRN");
          const firstReference = mrnReferences[0];
          if(firstReference?.subType && !filteredCodes.some(codeName => codeName.code === firstReference?.subType)) {
            filteredCodes.push({ code: firstReference?.subType, name: firstReference?.subType, shortName: firstReference?.subType });
          }
        }

        if (goodIdx > 0) {
          const good = wagon?.goods[goodIdx];
          if (good.externalReferences) {
            const mrnReferences = good?.externalReferences?.filter(ref => ref.type === "MRN");
            const goodReference = mrnReferences[goodIdx];
            if(goodReference?.subType &&!filteredCodes.some(codeName => codeName.code === goodReference?.subType)) {
              filteredCodes.push({ code: goodReference?.subType, name: goodReference?.subType, shortName: goodReference?.subType });
            }
          }
        }

        // Step 4: Assign filtered codes to mrnTypes
        this.mrnTypes[goodIdx] = filteredCodes;
      },
      error: (err) => {
        console.error('Failed to fetch MRN types:', err);
      },
    });
  }
  
  private createpackingUnitTypes(): void {
    this.railOrderInternalService.getPackagingTypes().subscribe((result: CodeNamePair[]) => {
      this.packagingUnits = result;
    });

  }

  private createVolumeUnits(): void {
    this.volumeUnits = [];
    Object.entries(VolumeUnit).forEach(([code, name]) => {
      const codeNamePair: CodeNamePair = {
        code: code,
        name: name
      };

      this.volumeUnits.push(codeNamePair);
    });
    this.volumeUnits.unshift({ code: '', name: '' });
}


  private createAdditionalDeclarations(): void {
    this.railOrderInternalService.getScrap().subscribe((result: CodeNamePair[]) => {
      this.scrap = result;
    });
  }

  private initForm(): void {
    this.formGroup.addControl('bzaNumber', new FormControl());
    this.formGroup.addControl('goodsInformationList', this.fb.array([]));
  }

  protected PermissionNumberInput(): void {
    let exceptionalConsignments = this.railOrder.wagonInformation[this.idx].exceptionalConsignments;
    const permissionNumber = this.getControlBzaNumber().value?.trim(); // Ensure trimmed input

    // Find the first occurrence of "2180"
    const index = exceptionalConsignments.findIndex(item => item.imCode === "2180");

    if (index !== -1) {
      if (!permissionNumber || permissionNumber?.length == 0) {
        // Remove only the first occurrence of "2180"
        exceptionalConsignments.splice(index, 1);

        // Find another occurrence of "2180" and move it to the first position
        const anotherIndex = exceptionalConsignments.findIndex(item => item.imCode === "2180");
        if (anotherIndex !== -1) {
          const [movedItem] = exceptionalConsignments.splice(anotherIndex, 1);
          exceptionalConsignments.unshift(movedItem);
        }
      } else {
        // Update existing permissionNumber
        exceptionalConsignments[index].permissionNumber = permissionNumber;
      }
    } else if (permissionNumber && permissionNumber !== "0") {
      // Add new item only if permissionNumber is not empty or "0"
      exceptionalConsignments.push({ imCode: "2180", permissionNumber });
    }
    WagonInformationUtils.checkForDuplicatePermissionNumbers(this.formGroup);
  }

  protected nhmCodeSelected(idx: number): void {
    const selectedNhmCode = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('nhmCode').value;

    if (selectedNhmCode) {
      const selectedOption = this.nhmCodeAutocomplete.find(option => option.nhmCode === selectedNhmCode);
    
      if (selectedOption) {
        if (!this.railOrder.wagonInformation[this.idx].goods || !this.railOrder.wagonInformation[this.idx].goods[idx]) {
          this.railOrder.wagonInformation[this.idx].goods[idx] = initialGood();
        }
        this.railOrder.wagonInformation[this.idx].goods[idx].nhmCode = selectedNhmCode; 
        this.railOrder.wagonInformation[this.idx].goods[idx].nhmDescription = selectedOption.description.substring(0, 350);
        (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('nhmDescription').setValue(selectedOption.description.substring(0, 350))
        this.cd.detectChanges();
      }
    }
  }

  protected weightInput(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].weight = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('weight').value;
    this.validateGoodWeight(idx)
  }

  protected volumeInput(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].volume = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('volume').value;
    this.validateGoodVolumeUnit(idx);
  }

  protected selectUnit(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].unit = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('unit').value;
    this.validateGoodVolumeUnit(idx)
  }

  protected selectAdditionalDeclarationCode(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].additionalDeclarationCode = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('additionalDeclarationCode').value;
  }

  protected selectPackingUnitsType(idx: number): void {
    if (!this.railOrder.wagonInformation[this.idx].goods[idx].packingUnits[0]) {
      const packingType: PackingUnit = {
        type: undefined,
        description: undefined
      };
      this.railOrder.wagonInformation[this.idx].goods[idx].packingUnits[0] = packingType;
    }
    this.railOrder.wagonInformation[this.idx].goods[idx].packingUnits[0].type = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('packingUnitsType').value;
    this.validatePackingUnit(idx);
  }

  protected packingUnitsNumberInput(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].packingUnits[0].description = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('packingUnitsNumber').value;
    this.railOrder.wagonInformation[this.idx].goods[idx].packingUnits[0].number = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('packingUnitsNumber').value;
    this.validatePackingUnit(idx);
  }

  protected wasteIdInput(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].wasteId = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('wasteId').value;
    this.validateWasteId(idx);
  }

  protected selectExternalReferenceSubType(idx: number): void {
    const subTypeValue = (this.formGroup.get('goodsInformationList') as FormArray)
      .controls[idx].get('externalReferenceSubType')?.value;

    // Step 1: Get the correct externalReferences array based on idx
    const externalReferences = idx === 0
      ? this.railOrder?.wagonInformation?.[this.idx]?.externalReferences
      : this.railOrder?.wagonInformation?.[this.idx]?.goods?.[idx]?.externalReferences;

    if (!externalReferences) return;

    // Step 2: Find the MRN reference
    let mrnReference = externalReferences.find((el) => el.type === "MRN");

    // Step 3: If no MRN reference is found, create a new one
    if (!mrnReference) {
      mrnReference = { type: "MRN", subType: subTypeValue };
      externalReferences.push(mrnReference);
    } else {
      // Step 4: Update subType if MRN reference exists
      mrnReference.subType = subTypeValue;
    }
    this.validateMrn(idx);
  }

  protected selectEmptyPackingUnitsType(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].dangerousGoods[0].emptyPackingUnit = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('emptyPackingUnit').value;
  }

  protected selectEmptyPackingUnitsCode(idx: number): void {
    const name = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('emptyPackingUnit').value;
    this.railOrder.wagonInformation[this.idx].goods[idx].dangerousGoods[0].emptyPackingUnit = name;
    this.validateEmptyPackingUnit(idx);
  }

  protected selectSpecialInstruction(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].dangerousGoods[0].specialInstruction = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('specialInstruction').value;
  }

  protected selectWasteIndicator(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].dangerousGoods[0].wasteIndicator = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('wasteIndicator').value;
  }

  protected selectAccidentInformationSheetAvailable(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].dangerousGoods[0].approvalFlag = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('accidentInformationSheetAvailable').value;
  }

  protected additionalInformationNagInput(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].dangerousGoods[0].additionalInformation = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('additionalInformationNag').value;
  }

  protected explosiveMassInput(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].dangerousGoods[0].explosiveMass = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('explosiveMass').value;
  }

  protected externalReferenceSubIdentifierInput(idx: number): void {
    const identifierValue = (this.formGroup.get('goodsInformationList') as FormArray)
      .controls[idx].get('externalReferenceIdentifier')?.value;

    // Step 1: Get the correct externalReferences array based on idx
    let externalReferences = idx === 0
      ? this.railOrder?.wagonInformation?.[this.idx]?.externalReferences
      : this.railOrder?.wagonInformation?.[this.idx]?.goods?.[idx]?.externalReferences;

    if (!externalReferences) return;

    // Step 2: Find the MRN reference
    let mrnReference = externalReferences.find((el) => el.type === "MRN");

    // Step 3: If no MRN reference is found, create a new one
    if (!mrnReference) {
      mrnReference = { type: "MRN", identifier: identifierValue };
      externalReferences.push(mrnReference);
    } else {
      // Step 4: Update identifier if MRN reference exists
      mrnReference.identifier = identifierValue;
    }
    this.validateMrn(idx);
  }

  protected customerReferenceNumberInput(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].customsReferenceNumber = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('customsReferenceNumber').value;
    this.validateCustomsReferenceNumber(idx);
  }

  protected selectTransportProhibited(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].dangerousGoods[0].restrictionFlag = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('transportProhibited').value;
  }

  protected additionalDescriptionInput(idx: number): void {
    this.railOrder.wagonInformation[this.idx].goods[idx].additionalDescription = (this.formGroup.get('goodsInformationList') as FormArray).controls[idx].get('additionalDescription').value;
  }

  protected addLine(): void {
    this.railOrder.wagonInformation[this.idx].goods.push(initialGood());
    this.createForm();
  }

  private getWagonMrnReference(): ExternalReference | null {
    const wagon: WagonInformation | undefined = this.railOrder?.wagonInformation.at(this.idx);

    if (!wagon) return null; // Return null if good is undefined

    return wagon.externalReferences?.find((el) => el.type === "MRN") || null;
  }


  private getGoodMrnReference(goodIndex: number): ExternalReference | null {

    if (goodIndex == 0) {
      return this.getWagonMrnReference();
    }

    const good: Goods | undefined = this.railOrder?.wagonInformation.at(this.idx)?.goods?.at(goodIndex);

    if (!good) return null; // Return null if good is undefined

    return good.externalReferences?.find((el) => el.type === "MRN") || null;
  }

  private isDefaultMrn(code : string | null) : boolean {
    if (code == null) return true;
    if(code.length == 0) return true;
    
    const defaultMrnTypes: string[] = ['03', '04', '05', '06', '07', '08', '09'];
    if(defaultMrnTypes.includes(code)) return true;
    return false;
  }

  private isEmptyValue(code: string | null | undefined): boolean {
    if (code == null || code === '') return true;
    return false;
  }

  private setBzaNumber() {
    let isBZA = true
    for (const item of this.railOrder.wagonInformation[this.idx].exceptionalConsignments) {
      if (item.imCode == "2180" && isBZA) {
        this.formGroup.get('bzaNumber').setValue(item.permissionNumber);
        isBZA = false;
      }
    }
  }

  protected createForm(): void {
    let idx = 0;
  

    this.goodsInformationList.clear();
    let goodIdx = 0;

    for (const good of this.railOrder.wagonInformation[this.idx].goods) {

      const itemGroup: FormGroup = this.fb.group({});
      itemGroup.addControl('nhmCode', new FormControl(good?.nhmCode));
      itemGroup.addControl('nhmDescription', new FormControl(good?.nhmDescription));
      itemGroup.addControl('weight', new FormControl(good.weight));
      itemGroup.addControl('volume', new FormControl(good.volume));
      itemGroup.addControl('unit', new FormControl(good.unit));
      itemGroup.addControl('additionalDescription', new FormControl(good.additionalDescription));
      itemGroup.addControl('additionalDeclarationCode', new FormControl(good.additionalDeclarationCode));


      itemGroup.addControl('wasteId', new FormControl(good.wasteId));
      itemGroup.addControl('customsReferenceNumber', new FormControl(good.customsReferenceNumber));

      const mrnReference = this.getGoodMrnReference(goodIdx);
      // Delete MRN Reference when unlock AC
      if (!this.hasAC) {
        if (!this.isDefaultMrn(mrnReference?.subType)) {
          mrnReference.subType = null;
          mrnReference.identifier = null;
        }
      }

      if (this.isDefaultMrn(mrnReference?.subType)) {
        this.createMrnTypes(goodIdx, null);
        itemGroup.addControl('externalReferenceSubType', new FormControl(mrnReference?.subType || null));
        itemGroup.addControl('externalReferenceIdentifier', new FormControl(mrnReference?.identifier || null));
        if (!this.isEmptyValue(mrnReference?.subType)) {
          if(this.hasAC) {

            itemGroup.get('externalReferenceSubType')?.disable();
            if (!this.isEmptyValue(mrnReference?.identifier)) {
              itemGroup.get('externalReferenceIdentifier')?.enable();
            } else {
              itemGroup.get('externalReferenceIdentifier')?.enable();
            }

          } else {
            itemGroup.get('externalReferenceSubType')?.enable();
            itemGroup.get('externalReferenceIdentifier')?.enable();
          }
          
          
        }
      }

      if (mrnReference?.subType && !this.isDefaultMrn(mrnReference.subType)) {
        this.createMrnTypes(goodIdx, mrnReference?.subType || null);
        itemGroup.addControl('externalReferenceSubType', new FormControl(mrnReference?.subType || null));
        itemGroup.addControl('externalReferenceIdentifier', new FormControl(mrnReference?.identifier || null));
        if (!this.isEmptyValue(mrnReference?.subType)) {
          itemGroup.get('externalReferenceSubType')?.disable();
          itemGroup.get('externalReferenceIdentifier')?.disable();
        }
      }

      if (good.externalReferences?.length == 0) {
        good.packingUnits.push(initialPackingUnit());
      }

      itemGroup.addControl('packingUnitsType', new FormControl(good.packingUnits[0]?.type));
      itemGroup.addControl('packingUnitsNumber', new FormControl(good.packingUnits[0]?.description));

      if (!good.dangerousGoods || good.dangerousGoods.length === 0) {
        good.dangerousGoods.push(initialDangerousGood());
      }

      const dangerousGood: DangerousGood = good.dangerousGoods[0];
      itemGroup.addControl('unNr', new FormControl(dangerousGood?.unNr));
      itemGroup.addControl('specialInstruction', new FormControl());
      itemGroup.addControl('specialInstructionDisplay', new FormControl(dangerousGood?.specialInstruction || ''));
      itemGroup.addControl('emptyPackingUnit', new FormControl(dangerousGood?.emptyPackingUnit));
      itemGroup.addControl('explosiveMass', new FormControl(dangerousGood?.explosiveMass));
      itemGroup.addControl('transportProhibited', new FormControl(dangerousGood?.restrictionFlag));
      itemGroup.addControl('wasteIndicator', new FormControl(dangerousGood?.wasteIndicator));
      itemGroup.addControl('accidentInformationSheetAvailable', new FormControl(dangerousGood?.approvalFlag));
      itemGroup.addControl('additionalInformationNag', new FormControl(dangerousGood?.additionalInformation));
      itemGroup.addControl('dangerIdentificationNumber', new FormControl(dangerousGood?.dangerIdentificationNumber));
      itemGroup.addControl('description', new FormControl(dangerousGood?.description));
      itemGroup.addControl('class', new FormControl(dangerousGood?.class));
      itemGroup.addControl('classificationCode', new FormControl(dangerousGood?.classificationCode));
      itemGroup.addControl('packingGroup', new FormControl(dangerousGood?.packingGroup));
      itemGroup.addControl('dangerLabels', new FormControl(this.createDangerLabelsFromWagonInformation(idx)));
      itemGroup.addControl('accidentInformationSheetNr', new FormControl(dangerousGood?.accidentInformationSheetNr));
      itemGroup.addControl('nagFlag', new FormControl(dangerousGood?.nagFlag));

      this.goodsInformationList.push(itemGroup);

      itemGroup.get('transportProhibited').disable();
      itemGroup.get('accidentInformationSheetAvailable').disable();

      if (this.acHasGoodAtIndex(goodIdx)) {
        
        if (good?.nhmCode) {
          itemGroup.get('nhmCode').disable();
        }
        
        if (good?.additionalDeclarationCode) {
          itemGroup.get('additionalDeclarationCode').disable();
        }

        itemGroup.get('unNr').disable();
        itemGroup.get('emptyPackingUnit').disable();
        itemGroup.get('wasteIndicator').disable();
        itemGroup.get('specialInstruction').disable();
        itemGroup.get('specialInstructionDisplay').disable();
        itemGroup.get('additionalInformationNag').disable();
      } else {
        itemGroup.get('unNr').disable();
        const loadingStatus = this.railOrder.wagonInformation[this.idx].loadingStatus;
        if (!loadingStatus === true) {
          itemGroup.get('emptyPackingUnit').enable();
        } else {
          itemGroup.get('emptyPackingUnit').setValue(null)
          itemGroup.get('emptyPackingUnit').disable();
        
        }
        itemGroup.get('wasteIndicator').enable();
        itemGroup.get('specialInstruction').enable();
        itemGroup.get('specialInstructionDisplay').enable();
        itemGroup.get('additionalInformationNag').enable();
        
      }

      if (itemGroup.get('class').value !== "1") {
        itemGroup.get('explosiveMass')?.disable();
      } else {
        itemGroup.get('explosiveMass')?.enable();
      }

      idx++;
      goodIdx++; // Increment good index
    }

  }

  protected getErrorKeys(errors: { [key: string]: any }): string[] {
    return Object.keys(errors);
  }

  protected removeLine(idx: number): void {
    if (this.goodsInformationList.length > 1) {
      this.goodsInformationList.removeAt(idx);

      if (idx === 0) {
        this.updateMrnReferences();
      }

      const tempList: Goods[] = [];
      let counter = 0;
      for (let item of this.railOrder.wagonInformation[this.idx].goods) {
        if (counter !== idx) {
          tempList.push(item);
        }
        counter++;
      }
      this.railOrder.wagonInformation[this.idx].goods = tempList;
      this.createForm()
    }
  }

  private updateMrnReferences(): void {
    const externalReferencesWagon = this.railOrder?.wagonInformation?.[this.idx]?.externalReferences;
    const externalReferencesGoods = this.railOrder?.wagonInformation?.[this.idx]?.goods?.[1]?.externalReferences;
  
    if (externalReferencesWagon) {
      const mrnReferenceWagon = externalReferencesWagon.find((el) => el.type === "MRN");
      if (mrnReferenceWagon) {
        externalReferencesWagon.splice(externalReferencesWagon.indexOf(mrnReferenceWagon), 1);
      }
    }
  
    if (externalReferencesGoods) {
      const mrnReferenceGoods = externalReferencesGoods.find((el) => el.type === "MRN");
      if (mrnReferenceGoods) {
        externalReferencesGoods.splice(externalReferencesGoods.indexOf(mrnReferenceGoods), 1);
        externalReferencesWagon?.push(mrnReferenceGoods);
      }
    }
  }

  protected get goodsInformationList(): FormArray {
    return this.formGroup?.get('goodsInformationList') as FormArray;
  }

  protected autocompleteInputChanged(event: any, field: string): void {
    switch (field) {
      case 'nhmCode':
        this.nhmCodeInputChange.next(event.target.value);
        break;
      case 'dangerous-cargo':
        this.dangerousCargoInputChange.next(event.target.value);
        break;
      default:
        break;
    }
  }

  protected trackByFn(index: any, item: any): any {
    return index;
  }

  private getNhmCodeAutocomplete(input: any): void {
    if (input.length >= 3 && !this.nhmCodeAutocomplete.find((elem) => elem.nhmCode === input)) {
      this.trainorderService.getCargoInfo(input, 6).then((result: ApiGoodResponse) => {
        // Take only 30 answers that fit (array may be 1000+ in length), otherwise it takes a lot of resources to build these elements
        this.nhmCodeAutocomplete = result.slice(0, 30).sort((a, b) => (a.nhmCode > b.nhmCode ? 1 : -1));
      });
    }
  }
private toDangerousGood(obj: DangerousGoodObject): DangerousGood {
  return {
    unNr: obj.unCode ?? '',
    dangerIdentificationNumber: obj.dangerousGoodsNumber?.toString() ?? '',
    description: obj.description ?? '',
    class: obj.dangerousGoodsClass?.charAt(0) ?? '',
    classificationCode: obj.dangerousGoodsClass ?? '',
    packingGroup: obj.packingGroup ?? '',
    additionalInformation: obj.dangerLabelInformation ?? '',
    accidentInformationSheetNr: obj.tremcardNumber ?? '',
    nagFlag: obj.nagFlag ?? false,
    restrictionFlag: obj.restrictionFlag ?? false,
    approvalFlag: obj.approvalFlag ?? false,
    dangerLabels: [
      obj.dangerLabel1,
      obj.dangerLabel2,
      obj.dangerLabel3,
      obj.dangerLabel4
    ].filter(label => !!label) // remove empty strings or nulls
  };
}

 private getOrCreateDangerousGood(goodIdx: number): DangerousGood {

  if (!this.railOrder.wagonInformation) {
    this.railOrder.wagonInformation = [];
  }

  if (!this.railOrder.wagonInformation[this.idx]) {
    this.railOrder.wagonInformation[this.idx] = {
      goods: []
    } as WagonInformation; 
  }

  const wagon = this.railOrder.wagonInformation[this.idx];

  if (!wagon.goods) {
    wagon.goods = [];
  }

  if (!wagon.goods[goodIdx]) {
    wagon.goods[goodIdx] = {
      dangerousGoods: []
    } as Goods; // Use actual Good interface if available
  }

  const good = wagon.goods[goodIdx];

  if (!good.dangerousGoods || good.dangerousGoods.length === 0) {
    const newDangerousGood= initialDangerousGood();

    good.dangerousGoods = [newDangerousGood];
    return newDangerousGood;
  }

  return good.dangerousGoods[0];
}

  protected openDangerousGoodSelectionPopup(goodIdx: number): void {
    // Fetch the dangerous good laws based on shippingTimestamp or use current date
    this.railOrderInternalService.getDangerousGoodLaws(
      this.railOrder?.shippingTimestamp ? new Date(this.railOrder.shippingTimestamp) : new Date() // Use current date if shippingTimestamp is null
    ).subscribe({
      next: data => {
        const date = new Date();
        const shippingTimestamp = this.railOrder?.shippingTimestamp ? new Date(this.railOrder.shippingTimestamp) : null;
        if (this.railOrder?.dangerousGoodLaw) {
          const dangerousGoodLawYear = Number(this.railOrder.dangerousGoodLaw);  // Parse the year as a number
          const dangerousgoodLawList = data.filter(dgl => dgl.year === dangerousGoodLawYear);
          this.dangerousLawValidTostring = dangerousgoodLawList.length > 0 && dangerousgoodLawList[0].validTo
            ? dangerousgoodLawList[0].validTo
            : (shippingTimestamp && shippingTimestamp > date
              ? shippingTimestamp.toISOString().split('T')[0]  // Only the date part (YYYY-MM-DD)
              : date.toISOString().split('T')[0]);  // Only the date part (YYYY-MM-DD)
        } else { 
          this.dangerousLawValidTostring = shippingTimestamp && shippingTimestamp > date
            ? shippingTimestamp.toISOString().split('T')[0]  // Only the date part (YYYY-MM-DD)
            : date.toISOString().split('T')[0];  // Only the date part (YYYY-MM-DD)
        }

        // Open the dialog once the dangerous good law is determined
        this.dangerousGoodsDialogRef = this.newOrderWagonDetailService.openDangerousGoodsDetailDialog(this.dangerousLawValidTostring);
        this.dangerousGoodsDialogRef.afterClosed().subscribe({
          next: (result: DangerousGoodObject) => {
            if (result) {
              const dangerousGood = this.getOrCreateDangerousGood(goodIdx);
              // Populate the form controls with the result from the dialog

              this.getControl(goodIdx, 'unNr')?.setValue(result?.unCode);
              this.getControl(goodIdx, 'dangerIdentificationNumber')?.setValue(result?.dangerousGoodsNumber);
              this.getControl(goodIdx, 'description')?.setValue(result?.description);
              this.getControl(goodIdx, 'class')?.setValue(result?.dangerousGoodsClass?.charAt(0));
              this.getControl(goodIdx, 'classificationCode')?.setValue(result?.dangerousGoodsClass);
              this.getControl(goodIdx, 'packingGroup')?.setValue(result?.packingGroup);
              let dangerLabels = this.createDangerLabelsFromDangerousGoodObject(result);
              this.getControl(goodIdx, 'dangerLabels')?.setValue(dangerLabels);
              this.getControl(goodIdx, 'additionalInformation')?.setValue(result?.dangerLabelInformation);
              this.getControl(goodIdx, 'accidentInformationSheetNr')?.setValue(result?.tremcardNumber);
              this.getControl(goodIdx, 'nagFlag')?.setValue(result?.nagFlag);
              this.getControl(goodIdx, 'transportProhibited')?.setValue(result?.restrictionFlag);
              this.getControl(goodIdx, 'accidentInformationSheetAvailable')?.setValue(result?.approvalFlag);
              this.wagonValidationService.resetDangerousGoodErrors(this.goodsInformationList?.at(goodIdx));
              this.railOrder.wagonInformation[this.idx].goods[goodIdx].dangerousGoods[0] = this.toDangerousGood(result);
            }
            
            // Adjust the explosiveMass control based on the dangerous goods class
            const itemGroup= this.getGoodFormGroup(goodIdx);
            const classValue = itemGroup.get('class')?.value;
            // Enable 'explosiveMass' control if 'class' is 1 (explosive), otherwise disable it
            if (classValue === "1") {
              itemGroup.get('explosiveMass')?.enable();
            } else {
              itemGroup.get('explosiveMass')?.disable();
            }
            
            const emptyPackingUnitControl = itemGroup.get('emptyPackingUnit');
            if(String(this.railOrder.wagonInformation[this.idx].loadingStatus).toLocaleLowerCase() !== String('true')) {
              emptyPackingUnitControl?.enable();
            } else {
              emptyPackingUnitControl?.setValue(null);
              emptyPackingUnitControl?.disable();
              
            }

            this.validateAdditionalDescription(goodIdx);
            this.validateEmptyPackingUnit(goodIdx);
            this.validateNetExplosiveMassClass(goodIdx);
            this.validateNagInfoRequrired(goodIdx);
            //itemGroup.get('explosiveMass')?.updateValueAndValidity();
          },
          error: err => {
            console.error(`Failed to close dangerous goods dialog: ${err}`);
            // Optionally add a user-friendly message here (e.g., a toast or dialog)
          }
        });
      },
      error: err => {
        console.error(`Failed to load dangerous good law list: ${err}`);
      }
    });
    console.log
  }

  removeDangerousGood(index: number): void {
    this.railOrder.wagonInformation[this.idx].goods[index].dangerousGoods = [];
    const goodsItem = this.goodsInformationList.at(index);
    if (goodsItem) {
        goodsItem.patchValue({
            unNr: null,
            specialInstructionsList: null,
            specialInstruction: null,
            approavalFlag: null,
            emptyPackingUnit: null,
            explosiveMass: null,
            additionalInformationNag: null,
            specialInstructionDisplay: null,
            transportProhibited: null,
            wasteIndicator: null,
            accidentInformationSheetAvailable: null,
            dangerIdentificationNumber: null,
            description: null,
            class: null,
            packingGroup: null,
            dangerLabels: null,
            additionalInformation: null,
            accidentInformationSheetNr: null,
            classificationCode: null,
            nagFlag: null
        });
    }
}
  

  private createDangerLabelsFromDangerousGoodObject(dangerousGoodObject: DangerousGoodObject) {
    let dangerLabels = '';
    if (dangerousGoodObject?.dangerLabel1) {
      if (dangerLabels?.length > 0) {
        dangerLabels += ' / ';
      }
      dangerLabels += dangerousGoodObject.dangerLabel1;
    }
    if (dangerousGoodObject?.dangerLabel2) {
      if (dangerLabels?.length > 0) {
        dangerLabels += ' / ';
      }
      dangerLabels += dangerousGoodObject.dangerLabel2;
    }
    if (dangerousGoodObject?.dangerLabel3) {
      if (dangerLabels?.length > 0) {
        dangerLabels += ' / ';
      }
      dangerLabels += dangerousGoodObject.dangerLabel3;
    }
    if (dangerousGoodObject?.dangerLabel4) {
      if (dangerLabels?.length > 0) {
        dangerLabels += ' / ';
      }
      dangerLabels += dangerousGoodObject.dangerLabel4;
    }
    return dangerLabels;
  }

  private getDangerousCargoAutocomplete(input: any): void {
    if (input.length >= 3 && !this.dangerousGoodsAutocomplete.find((elem) => elem.unCode === input)) {
      this.trainorderService.getDangerousCargoInfo(input).then((result: ApiDangerousGoodResponse) => {
        // Take only 30 answers that fit (array may be 1000+ in length), otherwise it takes a lot of resources to build these elements
        if (result) {
          this.dangerousGoodsAutocomplete = result.slice(0, 30).sort((a, b) => (a.unCode > b.unCode ? 1 : -1));
        }
      });
    }
  }

 createDangerLabelsFromWagonInformation(idx: number): string {
  const dangerousGood = this.railOrder?.wagonInformation?.[this.idx]?.goods?.[idx]?.dangerousGoods?.[this.dangerousGoodIndex];

  if (!dangerousGood || !Array.isArray(dangerousGood.dangerLabels) || dangerousGood.dangerLabels.length === 0) {
    return '';
  }

  return dangerousGood.dangerLabels.join(' / ');
}


  getWagonInformationGoodsWeight(index: number): FormControl {
    return this.goodsInformationList.at(index).get('wagonInformationGoodsWeight') as FormControl;
  }

  getWagonInformationGoodsVolume(index: number): FormControl {
    return this.goodsInformationList.at(index).get('wagonInformationGoodsVolume') as FormControl;
  }

  getWagonInformationGoodsUnit(index: number): FormControl {
    return this.goodsInformationList.at(index).get('wagonInformationGoodsUnit') as FormControl;
  }

  protected getControl(index: number, controlName: string): FormControl {
    const control = this.goodsInformationList?.at(index)?.get(controlName) as FormControl
    return control;
  }

  protected getControlBzaNumber(): FormControl {
    const control = this.formGroup.get('bzaNumber') as FormControl
    return control;
  }

  protected isControlInvalid(Index: number, controlName: string): boolean {
    const control = this.getControl(Index, controlName);
    return false;
  }

  protected toggleDangerousGoods(idx: number): void {
    this.isDangerousGoods[idx] = !this.isDangerousGoods[idx];
    this.wagonValidationService.validateSingleWagon(this.railOrder, this.railOrder.wagonInformation[this.idx], this.validationMode, this.formGroup);
    this.validateAdditionalDescription(idx);
    this.validateEmptyPackingUnit(idx);
    this.validateNetExplosiveMassClass(idx);
    this.validateNagInfoRequrired(idx);
    
  }

  protected onSpecialInstructionChange(goodsIdx: number, event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedCode = target.value;

    // Find the selected instruction object
    const selectedInstruction = this.specialInstructionsList.find(inst => inst.code === selectedCode);

    // Update the disabled input field with the corresponding name
    const additionalDescription = selectedInstruction?.name || null
    this.goodsInformationList?.at(goodsIdx).get('specialInstructionDisplay')?.setValue(additionalDescription);
    if (!additionalDescription) {
      return;
    }
    const wagon: WagonInformation | undefined = this.railOrder?.wagonInformation.at(this.idx);
    const good = wagon.goods?.[goodsIdx];
    const dangerousGood: DangerousGood = good.dangerousGoods[0];
    if (dangerousGood) {
      dangerousGood.specialInstruction = additionalDescription;
    }
  }

  protected acHasGoodAtIndex(index: number) : boolean {
    if (!this.hasAC) return false;
    const good = (this.ac?.wagonInformation?.at(0)?.goods?.at(index));
    if(good) {
      return true;
    } else {
      return false;
    }
  }

  protected onNumberOnlyKeydown(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete']; // Allow Backspace, Delete, Arrow keys
    const key = event.key;
    if (!/[\d]/.test(key) && !allowedKeys.includes(key)) {
      event.preventDefault();  // Prevent typing
    }
  }
  private getGoodFormGroup(goodIdx: number): FormGroup | null {
    const formArray = this.formGroup.get('goodsInformationList') as FormArray;
    return formArray?.controls[goodIdx] as FormGroup || null;
  }

  private validateGoodWeight( goodIdx: number): void {
    
    const goodWeightErrors = this.wagonValidationService.validateGoodWeight(this.railOrder, 
            this.railOrder.wagonInformation?.at(this.idx), 
            this.railOrder.wagonInformation?.at(this.idx)?.goods.at(goodIdx));
            
    (this.formGroup.get('goodsInformationList') as FormArray)?.controls[goodIdx]?.get('weight').setErrors(goodWeightErrors);
  }
  
  private validateGoodVolumeUnit(goodIdx: number): void {
    const formArray = this.formGroup.get('goodsInformationList') as FormArray;
    const goodFormGroup = formArray?.controls[goodIdx] as FormGroup;
    if (!goodFormGroup) {
      return;
    }
  
    const volumeControl = goodFormGroup.get('volume');
    const volume = volumeControl ? volumeControl.value || null : null;
    const unitControl = goodFormGroup.get('unit');
    const unit = unitControl ? unitControl.value || null : null;
    const hasVolumeWithoutUnitError = BaseValidators.hasVolumeWithoutUnit(volume, unit);
    if (hasVolumeWithoutUnitError) {
      unitControl?.setErrors({ hasVolumeWithoutUnit: true });
    } else {
      unitControl?.setErrors(null);
    }
  
    const hasUnitWithoutVolumeError = BaseValidators.hasUnitWithoutVolume(volume, unit);
    if(hasUnitWithoutVolumeError) {
      volumeControl?.setErrors({ hasUnitWithoutVolume: true });
    } else {    
      volumeControl?.setErrors(null);
    }
  }

  private validatePackingUnit(goodIdx: number): void {  
    
    const goodFormGroup = this.getGoodFormGroup(goodIdx); 
    if (!goodFormGroup) {
      return;
    }
    const packingUnitNumberControl = goodFormGroup.get('packingUnitsNumber');
    const packingUnitNumber = packingUnitNumberControl ? packingUnitNumberControl.value || null : null;

    const packingUnitsTypeControl = goodFormGroup.get('packingUnitsType');
    const packingUnitsType = packingUnitsTypeControl ? packingUnitsTypeControl.value || null : null;

    const packagingUnit  = { type: packingUnitsType, description:  packingUnitNumber };
    
    const packingUnitNumberRequiredError = BaseValidators.packingUnitNumberRequiredValidator(packagingUnit);
    const packingUnitTypeRequired = BaseValidators.packingUnitTypeRequiredValidator(packagingUnit);
    
    if(packingUnitNumberRequiredError) {
      packingUnitNumberControl?.setErrors({ packingUnitNumberRequired: true });
    } else {
      packingUnitNumberControl?.setErrors(null);
    }

    if(packingUnitTypeRequired) {
      packingUnitsTypeControl?.setErrors({ packingUnitTypeRequired: true });
    } else {
      packingUnitsTypeControl?.setErrors(null);
    }
  }

  private validateWasteId(goodIdx: number): void {
    const wasteIdRequired = this.wagonValidationService.validateWasteId(this.railOrder,
      this.railOrder.wagonInformation?.at(this.idx)?.goods.at(goodIdx));

    const goodFormGroup = this.getGoodFormGroup(goodIdx);
    if (!goodFormGroup) {
      return;
    }

    goodFormGroup?.get('wasteId').setErrors(wasteIdRequired);
  }

  private validateMrn(goodIdx: number): void {
    const mrnSubTypeRequired = this.wagonValidationService.validateMrnSubType(this.railOrder?.wagonInformation.at(this.idx),
      this.railOrder?.wagonInformation?.at(this.idx)?.goods.at(goodIdx),
      goodIdx);

    const invalidFormatMrn = this.wagonValidationService.validateMrnIdentifier(this.railOrder?.wagonInformation.at(this.idx),
      this.railOrder?.wagonInformation?.at(this.idx)?.goods.at(goodIdx),
      goodIdx);

    const goodFormGroup = this.getGoodFormGroup(goodIdx);
    if (!goodFormGroup) {
      return;
    }

    const externalReferenceSubTypeControl = goodFormGroup.get('externalReferenceSubType');
    if (mrnSubTypeRequired) {
      externalReferenceSubTypeControl?.setErrors({ mrnSubTypeRequired: true });
    } else {
      externalReferenceSubTypeControl?.setErrors(null);
    }

    const externalReferenceIdentifierControl = goodFormGroup.get('externalReferenceIdentifier');
    if (invalidFormatMrn) {
      externalReferenceIdentifierControl?.setErrors({ invalidFormatMrn: true });
    } else {
      externalReferenceIdentifierControl?.setErrors(null);
    }
  }

  private validateCustomsReferenceNumber(goodIdx: number): void {

    const goodFormGroup = this.getGoodFormGroup(goodIdx);
    if (!goodFormGroup) {
      return;
    }

    const customsReferenceNumberControl = goodFormGroup.get('customsReferenceNumber');
    const customsReferenceNumber = customsReferenceNumberControl ? customsReferenceNumberControl.value || null : null;
    const errors: { [key: string]: boolean } = {};

    if (!customsReferenceNumber) {
      return null;
    }

    // Validate that the length is not greater than 8
    if (customsReferenceNumber && customsReferenceNumber.length > 8) {
      errors.maxLengthExceeded = true;
    }

    // Validate that the customsReferenceNumber is numeric
    if (customsReferenceNumber && !/^\d+$/.test(customsReferenceNumber)) {
      errors.invalidNumber = true;
    }

    // If there are any errors, return the combined errors object; otherwise, return null
    if (Object.keys(errors).length > 0) {
      customsReferenceNumberControl?.setErrors(errors);
    } else {
      customsReferenceNumberControl?.setErrors(null);
    }
  }

  private validateAdditionalDescription(goodIdx: number): void {
    const goodFormGroup = this.getGoodFormGroup(goodIdx);
    if (!goodFormGroup) {
      return;
    }
  
    const additionalDescriptionControl = goodFormGroup.get('additionalDescription');
    const dangerIdentificationNumberControl = goodFormGroup.get('dangerIdentificationNumber');
    const unCodeControl = goodFormGroup.get('unNr');
    const unCode = unCodeControl ? unCodeControl.value || null : null;

    if (!unCode) {
      additionalDescriptionControl?.setErrors(null);
      return;
    }
    
    // If there is no dangerIdentificationNumber, skip setting the additional description error
    const dangerIdentificationNumber = dangerIdentificationNumberControl ? dangerIdentificationNumberControl.value || null : null;
    if (dangerIdentificationNumber) {
      return;
    }
  
    // Check if the additional description is required
    const additionalDescription = additionalDescriptionControl ? additionalDescriptionControl.value || null : null;
    if (additionalDescription && additionalDescription.length > 0) {
      additionalDescriptionControl?.setErrors(null);
    } else {
      additionalDescriptionControl?.setErrors({ additionalDeclarationRequired: true });
    }
  } 

  private validateEmptyPackingUnit(goodIdx: number): void { 
    const goodFormGroup = this.getGoodFormGroup(goodIdx); 
    const wagon = this.railOrder?.wagonInformation?.at(this.idx);
    const loadingStatus = wagon?.loadingStatus;
    if (!goodFormGroup) {
      return;
    }
    const emptyPackingUnitControl = goodFormGroup.get('emptyPackingUnit');
    const emptyPackingUnit = emptyPackingUnitControl ? emptyPackingUnitControl.value || null : null;
    const unCodeControl = goodFormGroup.get('unNr');
    const unCode = unCodeControl ? unCodeControl.value || null : null;
    if (!unCode) {
      emptyPackingUnitControl?.setErrors(null);
      return;
    }

    if(String(this.railOrder.wagonInformation[this.idx].loadingStatus).toLocaleLowerCase() !== String('true')) {
      if (emptyPackingUnit && emptyPackingUnit.length > 0) {
        emptyPackingUnitControl?.setErrors(null);
      } else {
        emptyPackingUnitControl.enable();
        emptyPackingUnitControl?.setErrors({ emptyPackagingUnitRequired: true });
        
      } 

      }else {
        emptyPackingUnitControl?.setErrors(null);
    }
  }

  private extractNumberBeforeDecimal(input: string): string | null {
    if (!input) return null;
    return input.split('.').at(0);
  }

  private validateNetExplosiveMassClass(goodIdx: number): void {
    const goodFormGroup = this.getGoodFormGroup(goodIdx);
    if (!goodFormGroup) {
      return;
    }

    const dangerousGoodClassControl = goodFormGroup.get('class');
    const dangerousGoodExplosiveMassControl = goodFormGroup.get('explosiveMass');
    const unCodeControl = goodFormGroup.get('unNr');
    const unCode = unCodeControl ? unCodeControl.value || null : null;

    if (!unCode) {
      dangerousGoodExplosiveMassControl?.setErrors(null);
      return;
    }

    // Extract the dangerous good class
    const dangerousGoodClass = dangerousGoodClassControl ? this.extractNumberBeforeDecimal(dangerousGoodClassControl?.value?.trim()) || null : null;
    const dangerousGoodExplosiveMass = dangerousGoodExplosiveMassControl ? dangerousGoodExplosiveMassControl.value || null : null;
    dangerousGoodExplosiveMassControl?.setErrors({ netExplosiveMassClassRequired: true });
    // If the class is not '1', clear the explosive mass errors
    if (dangerousGoodClass !== '1') {
      dangerousGoodExplosiveMassControl?.setErrors(null);
      return;
    } else {
      // If the class is '1', check the explosive mass
      if (!dangerousGoodExplosiveMass) {
        // If no explosive mass, set the required error
        dangerousGoodExplosiveMassControl?.setErrors({ netExplosiveMassClassRequired: true });
      } else {
        // If explosive mass is provided, clear any previous errors
        dangerousGoodExplosiveMassControl?.setErrors(null);
      }
    }
  }

  private validateNagInfoRequrired(goodIdx: number): void { 
    const goodFormGroup = this.getGoodFormGroup(goodIdx);
    if (!goodFormGroup) {
      return;
    }
    const nagFlagControl = goodFormGroup.get('nagFlag');
    const nagFlag = nagFlagControl ? nagFlagControl.value || null : null;
    const additionalInformationControl = goodFormGroup.get('additionalInformationNag');
    const additionalInformation = additionalInformationControl ? additionalInformationControl.value || null : null;
    if(nagFlag) {
      if (additionalInformation && additionalInformation.length > 0) {
        additionalInformationControl?.setErrors(null);
      } else {
        additionalInformationControl?.setErrors({ nagInfoRequired: true });
      } 
    } else {
      additionalInformationControl?.setErrors(null);
      return;   
    };
    
  }
}