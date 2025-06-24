import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DangerousGood, ExceptionalConsignment, ExternalReference, Goods, LoadingTackles, PackingUnit, RailOrder, Seal, WagonInformation } from '../../../../../models/rail-order-api';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { WagonDataCommunicationService } from '../service/wagon-data-communication.service';
import { FormFieldService } from '../../../service/form-field.service';
import { ValidationMode } from '../../../validators/validator-field.config';
import { WagonValidationService } from '../../../service/wagon-validation-service.service';
import { EmptyPackaging } from '@src/app/shared/enums/unit.enum';
import { CodeNamePair } from '@src/app/order-management/models/general-order';

@Component({
  selector: 'app-new-order-wagon-detail-dialog',
  templateUrl: './new-order-wagon-detail-dialog.component.html',
  styleUrl: './new-order-wagon-detail-dialog.component.scss'
})
export class NewOrderWagonDetailDialogComponent implements OnInit, AfterViewInit, AfterContentChecked {

  protected idx: number;
  protected formGroup: FormGroup;
  protected isAdditionalInput: boolean;
  protected isDangerousGoods: boolean;
  protected isCustomerReference: boolean;
  protected isSealingList: boolean;
  protected isLoadingTacklesList: boolean;
  protected isAuthorizationList: boolean;
  protected wagonInformation: WagonInformation;
  protected railOrder: RailOrder;
  protected emptyPackingUnitList: CodeNamePair[] = [];
  protected index: Number;
  protected editMode: boolean;
  protected validationMode: ValidationMode;
  protected isFastEntry: boolean;
  
  private originalWagonInformation: WagonInformation;
  private wagonDataCommunicationService: WagonDataCommunicationService = inject(WagonDataCommunicationService);
  private formFieldService: FormFieldService = inject(FormFieldService);
  private wagonValidationService: WagonValidationService = inject(WagonValidationService);

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { railOrder: RailOrder, idx: number, editMode: boolean, validationMode: ValidationMode, isFastEntry: boolean },
    private dialogRef: MatDialogRef<NewOrderWagonDetailDialogComponent>,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.wagonInformation = data.railOrder.wagonInformation[data.idx];
    this.originalWagonInformation = structuredClone(this.wagonInformation);
    this.index = data.idx
    this.idx = data.idx; 
    this.railOrder = data.railOrder;
    this.editMode = data.editMode;
    this.validationMode = data.validationMode;
    this.isFastEntry = data.isFastEntry;
    this.createEmptyPackaging();
  }

  ngOnInit(): void {
    this.createForm();
    this.updateCounters();
  }

  ngAfterViewInit(): void {
    this.formFieldService.disableFields(this.formGroup, 'wagonDetails', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
    this.wagonValidationService.validateSingleWagon(this.railOrder, this.wagonInformation, this.validationMode, this.formGroup);
    this.cd.detectChanges();
  }

  ngAfterContentChecked(): void {
    if(this.isFastEntry) {
      this.wagonValidationService.validateSingleWagon(this.railOrder, this.wagonInformation, this.validationMode, this.formGroup);
    }
  }

  private createForm(): void {
    this.formGroup = this.fb.group({});
  }
  protected getMrnReference(): ExternalReference[] {
    const aryExternalReference: ExternalReference[] = [];
    let goodIdx = 0;
    for (const item of this.goodsInformationListFormArray.controls) {
      if (goodIdx==0) {
      const externalReference: ExternalReference = {
        type: 'MRN',
        subType: item.get('externalReferenceSubType')?.value,
        identifier: item.get('externalReferenceIdentifier')?.value
      };
      if (externalReference.subType || externalReference.identifier) {
        aryExternalReference.push(externalReference);
        return aryExternalReference;
      }
      goodIdx++;
    }
      
    }
    return aryExternalReference;
  }

  private createDangerLabels(input: string): string[] {
    let result: string[] = [];
    if (input) {
      result = input.split(' / ');
    }
    return result;
  }
  private isObjectEmpty(obj: Record<string, any> | null | undefined): boolean {
    if (!obj || typeof obj !== 'object') {
      // Return true for null, undefined, or non-object values
      return true;
    }

    return Object.values(obj).every(value =>
      value == null || // Includes null and undefined
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      Number.isNaN(value)
    );
  }

  protected createGoodsModel(): Goods[] {
    const result: Goods[] = [];
    let goodsIdx=0;
    for (const item of this.goodsInformationListFormArray.controls) {
      let packingUnit: PackingUnit = undefined;
      let packingUnitNumber = this.railOrder.wagonInformation[this.idx]?.goods[goodsIdx]?.packingUnits[0]?.number;
      if(this.railOrder?.wagonInformation[this.idx]?.goods[goodsIdx]?.packingUnits[0]?.description) {
        packingUnitNumber = Number(this.railOrder.wagonInformation[this.idx].goods[goodsIdx].packingUnits[0].description);
      }
      
      if (this.railOrder.wagonInformation[this.idx]?.goods[goodsIdx]?.packingUnits[0]?.type 
          || this.railOrder.wagonInformation[this.idx]?.goods[goodsIdx]?.packingUnits[0]?.number
          || this.railOrder.wagonInformation[this.idx]?.goods[goodsIdx]?.packingUnits[0]?.description) {
        packingUnit = {
          type: this.railOrder.wagonInformation[this.idx]?.goods[goodsIdx]?.packingUnits[0]?.type,
          number: packingUnitNumber,
          description: this.railOrder.wagonInformation[this.idx]?.goods[goodsIdx]?.packingUnits[0]?.description
        }
      }
     
      const externalReference: ExternalReference = {
        type: 'MRN',
        subType: item.get('externalReferenceSubType')?.value,
        identifier: item.get('externalReferenceIdentifier')?.value

      };

        const dangerLabels = this.createDangerLabels(item.get('dangerLabels').value);
        const emptyPackagingCode = item.get('emptyPackingUnit').value;
        const dangerousGood: DangerousGood = {
        class: item.get('class')?.value ?? item.get('classificationCode')?.value?.at(0),
        classificationCode: item.get('classificationCode').value,
        description: item.get('description').value,
        unNr: item.get('unNr').value,
        dangerIdentificationNumber: item.get('dangerIdentificationNumber').value,
        explosiveMass: item.get('explosiveMass').value,
        emptyPackingUnit: emptyPackagingCode, 
        packingGroup: item.get('packingGroup').value,
        specialInstruction: item.get('specialInstructionDisplay').value,
        restrictionFlag: item.get('transportProhibited').value,
        additionalInformation: item.get('additionalInformationNag').value,
        dangerLabels: dangerLabels,
        approvalFlag: item.get('accidentInformationSheetAvailable').value,
        accidentInformationSheetNr: item.get('accidentInformationSheetNr').value,
        nagFlag: item.get('nagFlag').value,
        wasteIndicator: item.get('wasteIndicator').value
      };
      const goods: Goods = {
        nhmCode: item.get('nhmCode').value,
        nhmDescription: item.get('nhmDescription').value,
        additionalDescription: item.get('additionalDescription').value,
        additionalDeclarationCode: item.get('additionalDeclarationCode').value,
        weight: item.get('weight').value,
        volume: item.get('volume').value,
        unit: item.get('unit').value,
        wasteId: item.get('wasteId').value,
        customsReferenceNumber: item.get('customsReferenceNumber').value,
        dangerousGoods: [],
        packingUnits: [],
        externalReferences : []
      }
      if(!this.isObjectEmpty(dangerousGood)) {
        goods.dangerousGoods.push(dangerousGood);
      }

      if (packingUnit) {
        goods.packingUnits.push(packingUnit);
      }

      if(goodsIdx !=0 && (externalReference.subType || externalReference.identifier) ) {
        goods.externalReferences.push(externalReference)
      }
      result.push(goods);
      goodsIdx++;
    }
    return result;
  }

  private createSeals(): Seal[] {
    const seals: Seal[] = [];
    if (this.sealingListFormArray?.controls) {
      for (let item of this.sealingListFormArray.controls) {
        if(item.get('type').value != null || item.get('referenceNumber').value != null) {
          const seal: Seal = {
            type: item.value['type'],
            referenceNumber: item.value['referenceNumber']
          };
          seals.push(seal);
        }
      }
      return seals;
    } else {
      return this.railOrder.wagonInformation[this.idx].seals;
    }    
  }

  private createLoadingTackles(): LoadingTackles[] {
    const loadingTackles: LoadingTackles[] = [];
    if (this.loadingTacklesList?.controls) {
      for (const formGroup of this.loadingTacklesList.controls) {
        if(formGroup.get('type').value != null 
          || formGroup.get('numberOfLoadingTackles').value != null
          || formGroup.get('weight').value != null
          || formGroup.get('identifier').value != null){
            const loadingTackle: LoadingTackles = {
              type: formGroup.get('type').value,
              number: formGroup.get('numberOfLoadingTackles').value,
              weight: formGroup.get('weight').value,
              identifier: formGroup.get('identifier').value,
            };
            loadingTackles.push(loadingTackle);
          }
      }
      return loadingTackles;
    } else {
      return this.railOrder.wagonInformation[this.idx].loadingTackles;
    }    
  }

  private createAuthorizations(): ExceptionalConsignment[] {
   
      const authorizationList: ExceptionalConsignment[] = [];
   
      // Add BZA authorization if available
      if (this.bzaNumber?.value?.trim()) {
          authorizationList.push({
              imCode: "2180",
              permissionNumber: this.bzaNumber.value.trim()
          });
      }
   
      // Process additional authorizations if available
      if (this.authorizationList?.controls) {
          for (const item of this.authorizationList.controls) {
              const imCode = item.get('imCode')?.value?.trim();
              const permissionNumber = item.get('permissionNumber')?.value?.trim();
   
              // Ensure valid entries (skip null or empty)
              if (imCode || permissionNumber) {
                  authorizationList.push({ imCode, permissionNumber });
              }
          }
      } else {
          return [...this.railOrder.wagonInformation[this.idx].exceptionalConsignments];
      }
   
      // **Replace exceptionalConsignments in the order with a new reference**
      this.railOrder.wagonInformation[this.idx] = {
          ...this.railOrder.wagonInformation[this.idx],
          exceptionalConsignments: [...authorizationList] // Ensuring immutability
      };
   
      return authorizationList;
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

  private updateRailOrderWagonInformation(): WagonInformation {
    const loadingTackles = this.createLoadingTackles();
    const wagonInformation: WagonInformation = {
      completedByWagonItem: this.railOrder.wagonInformation[this.idx].completedByWagonItem,
      dangerousGoodIndicator: this.railOrder.wagonInformation[this.idx].dangerousGoodIndicator,
      exceptionalConsignments: this.createAuthorizations(),
      externalReferences: this.createExternalReferences(),
      fulfilmentIndicator: this.railOrder.wagonInformation[this.idx].fulfilmentIndicator,
      goodWeight: this.railOrder.wagonInformation[this.idx].goodWeight,
      goods: this.createGoodsModel(),      
      limitedQuantity: this.railOrder.wagonInformation[this.idx].limitedQuantity,
      loadingStatus: this.wagonInformation?.loadingStatus,
      loadingTackles: loadingTackles,
      printEraseIndicator: this.wagonInformation?.printEraseIndicator,
      priority: this.wagonInformation?.priority,
      seals: this.createSeals(),
      status: this.wagonInformation?.status,
      specialWagonHandlings: this.railOrder.wagonInformation[this.idx].specialWagonHandlings,
      summarizedIndicator: this.railOrder.wagonInformation[this.idx].summarizedIndicator,
      wagonPosition: this.railOrder.wagonInformation[this.idx].wagonPosition,
      weighingIndicator: this.railOrder.wagonInformation[this.idx].weighingIndicator,
      wagonNumber: this.railOrder.wagonInformation[this.idx].wagonNumber,
      typeOfWagon: this.railOrder.wagonInformation[this.idx].typeOfWagon
    }
    this.railOrder.wagonInformation[this.idx] = wagonInformation;
    return wagonInformation;
  }

  private createExternalReferences(): ExternalReference[] {
    const externalReferences: ExternalReference[] = [];
    if(this.customerReferenceListFormArray?.controls){
      for (let item of this.customerReferenceListFormArray?.controls) {
        if(item.get('identifier').value != null){
          const externalReference: ExternalReference = {
            type: 'CRR',
            identifier: item.get('identifier').value
          };
          externalReferences.push(externalReference);  
        }    
      }
      for (let item of this.getMrnReference()) {
        externalReferences.push(item); 
      }
      return externalReferences;
    } else {
      return this.railOrder.wagonInformation[this.idx].externalReferences;
    }    
  }

  protected confirm() {
    this.dialogRef.close(this.updateRailOrderWagonInformation());
  }

  get goodsInformationListFormArray(): FormArray {
    return this.formGroup.get('goodsInformationList') as FormArray;
  }

  get customerReferenceListFormArray(): FormArray {
    return this.formGroup.get('customerReferenceFormArray') as FormArray;
  }

  get sealingListFormArray(): FormArray {
    return this.formGroup.get('sealingList') as FormArray;
  }

  get loadingTacklesList(): FormArray {
    return this.formGroup.get('loadingTacklesList') as FormArray;
  }

  get authorizationList(): FormArray {
    return this.formGroup.get('authorizationList') as FormArray;
  }

  get bzaNumber(): FormControl {
    return this.formGroup.get('bzaNumber') as FormControl;
  }

  protected cancel() {
    this.dialogRef.close(this.originalWagonInformation);
  }

  protected toggleAuthorization(): void {
    this.isAuthorizationList = !this.isAuthorizationList;
    this.updateCounters();
    this.cd.detectChanges();
  }

  protected toggleAdditionalInput(): void {
    this.isAdditionalInput = !this.isAdditionalInput;
    this.cd.detectChanges();
  }

  protected toggleDangerousGoods(): void {
    this.isDangerousGoods = !this.isDangerousGoods;
    this.cd.detectChanges();
  }

  protected toggleCustomerReference(): void {
    this.isCustomerReference = !this.isCustomerReference;
    this.updateCounters();
    this.cd.detectChanges();
  }

  protected toggleSealingList(): void {
    this.isSealingList = !this.isSealingList;
    this.updateCounters();
    this.cd.detectChanges();
  }

  protected toggleLoadingTackles(): void {
    this.isLoadingTacklesList = !this.isLoadingTacklesList;
    this.updateCounters();
    this.cd.detectChanges();
  }

  protected getCustomerReferenceCount(): number {
    // Safely access the externalReferences array, defaulting to an empty array if not found
    const externalReferences = this.railOrder?.wagonInformation[this.idx]?.externalReferences || [];
  
    // Filter references where type is 'CRR' and either identifier or description is non-empty
    const validCRRReferences = externalReferences.filter(reference =>
      reference.type === 'CRR' &&
      (reference.identifier?.trim().length > 0 || reference.description?.trim().length > 0)
    );
  
    // Return the count of filtered valid references
    return validCRRReferences.length;
  }
  

  protected getSealingListCount(): number {
    return (
      this.railOrder?.wagonInformation[this.idx]?.seals?.filter(seal =>
        seal.type || seal.referenceNumber
      ).length || 0
    );
  }

  protected getLoadingTacklesCount(): number {
    return (
      this.railOrder?.wagonInformation[this.idx]?.loadingTackles
        ?.filter(tackle => tackle.type && tackle.weight > 0)
        .length || 0
    );
  }

  protected getAuthorizationListCount(): number {
    const consignments = this.railOrder?.wagonInformation[this.idx]?.exceptionalConsignments || [];
  
    // Filter out consignments that are missing imCode or permissionNumber
    const validConsignments = consignments.filter(consignment => consignment.imCode && consignment.permissionNumber);
  
    // Check if there is an exceptional consignment with imCode 2180
    const hasIMCode2180 = validConsignments.some(consignment => consignment.imCode === "2180");
  
    // Return the count of valid consignments, subtracting 1 if there is a consignment with imCode 2180
    return validConsignments.length - (hasIMCode2180 ? 1 : 0);
  }

  //Show error marking in popup

  protected isSealingValid(): boolean {  
    return this.wagonValidationService.isSealingListValid(this.wagonInformation);
  }

  protected isLoadingTacklesValid():boolean {
    return this.wagonValidationService.isLoadingTacklesListValid(this.wagonInformation)
  }

  protected isAuthorizationListValid():boolean {  
    return this.wagonValidationService.isAuthorizationListValid(this.wagonInformation);
  }

  protected updateCounters(): void {
    this.getCustomerReferenceCount();
    this.getSealingListCount();
    this.getLoadingTacklesCount();
    this.getAuthorizationListCount();
    this.cd.detectChanges();  
  }
}