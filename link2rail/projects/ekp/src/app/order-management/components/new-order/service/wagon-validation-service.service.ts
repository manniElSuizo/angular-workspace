import { Injectable } from '@angular/core';
import { FormArray, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { RailOrder, WagonInformation, Goods, ExceptionalConsignment, LoadingTackles, Seal } from '../../../models/rail-order-api';
import { ValidationMode } from '../validators/validator-field.config';
import { BaseValidators } from '../validators/base-validations';

@Injectable({
  providedIn: 'root'
})
export class WagonValidationService {

  constructor() { }

  private validationMode: ValidationMode;

  public setValidationMode(validationMode: ValidationMode) {
    this.validationMode = validationMode;
  }

  public resetDangerousGoodErrors(goodsInformationForm: AbstractControl | null = null): void {
    if (!goodsInformationForm) {
      console.warn('No form provided to reset dangerous good errors.');
      return;
    }

    // Retrieve relevant controls
    const dangerousGoodClassControl = goodsInformationForm.get('additionalInformationNag');
    const netExplosiveMassClassControl = goodsInformationForm.get('explosiveMass');
    const additionalDescriptionControl = goodsInformationForm.get('additionalDescription');

    // Store controls in an array
    const controls = [dangerousGoodClassControl, netExplosiveMassClassControl, additionalDescriptionControl];

    // Reset errors for each control if it exists
    controls.forEach((control) => {
      if (control) {
        control.setErrors(null);
      }
    });
  }


  public validateAllWagons(railOrder: RailOrder, validationMode: ValidationMode, formGroupMain: FormGroup) {

    const wagonFormGroup = formGroupMain.get('wagonData') as FormGroup;
    const wagonFormWagonList = wagonFormGroup.get('wagonInformationList') as FormArray;
    this.validateAllWagonsByFormArray(railOrder, validationMode, wagonFormWagonList);
  }

  public validateAllWagonsByFormArray(railOrder: RailOrder, validationMode: ValidationMode, wagonFormWagonList: FormArray) {
    const wagonInformation = railOrder.wagonInformation;

    BaseValidators.clearWagonNumbersSet();

    wagonInformation?.forEach((wagonInformation: WagonInformation, index: number) => {

      //console.log('validateWagon:', index, JSON.stringify(wagonInformation))
      if (this.validateSingleWagon(railOrder, wagonInformation, validationMode)) {
        wagonFormWagonList.at(index).setErrors([{ 'invalidWagon': true }])
      }
    });
  }

  public validateSingleWagon(railOrder: RailOrder, wagonInformation: WagonInformation, validationMode: ValidationMode, formGroup: FormGroup = null): boolean {
    const hasAC = railOrder?.templateNumber?.trim() ? true : false

    if (!validationMode) {
      this.validationMode = hasAC ? ValidationMode.VALIDATORS_BOOKING_AC : ValidationMode.VALIDATORS_BOOKING;
    } else {
      this.validationMode = validationMode;
    }


    let hasErorrs = false;
    const goodsInformationFormArray = formGroup?.get('goodsInformationList') as FormArray;
    const sealsFormArray = formGroup?.get('sealingList') as FormArray;
    const loadingTacklesFormArray = formGroup?.get('loadingTacklesList') as FormArray;
    const authorizationFormArray = formGroup?.get('authorizationList') as FormArray;

    //Validate Goods  
    for (let goodsIndex = 0; goodsIndex < wagonInformation?.goods?.length; goodsIndex++) {
      const goodsInformationForm = goodsInformationFormArray?.controls?.at(goodsIndex);
      const good = wagonInformation.goods[goodsIndex];
      const combinedGoodErrors = this.validateSingleGood(railOrder, wagonInformation, goodsIndex, good, goodsInformationForm);

      if (combinedGoodErrors && Object.keys(combinedGoodErrors).length > 0) {
        hasErorrs = true;
      }
    }

    // Validate Sealing-List
  /*  for (let i = 0; i < wagonInformation?.seals?.length; i++) {
      const sealsForm = sealsFormArray?.controls?.at(i);
      const seals = wagonInformation.seals[i];

      const combinedSealsErrors = this.validateSingleSeal(seals, sealsForm);
      if (combinedSealsErrors && Object.keys(combinedSealsErrors).length > 0) {
        hasErorrs = true;
      }
    }*/

    //Validate Loading-Tackles
    for (let i = 0; i < wagonInformation?.loadingTackles?.length; i++) {
      const loadingTacklesForm = loadingTacklesFormArray?.controls?.at(i);
      const loadingTackles = wagonInformation.loadingTackles[i];

       const combinedloadingTacklesErrors = this.validateSingleLoadladingTackles(wagonInformation, loadingTackles, loadingTacklesForm);
       if (combinedloadingTacklesErrors && Object.keys(combinedloadingTacklesErrors).length > 0) {
         hasErorrs = true;
       }
    }

    let authorizationNumberArry: string[] = [];
    let isFirstBZA = true;

    wagonInformation?.exceptionalConsignments?.forEach((authorization, i) => {
      let authorizationForm = authorizationFormArray?.controls?.at(i);

      if (!isFirstBZA) {
        authorizationForm = authorizationFormArray?.controls?.at(i - 1);
      }

      if (authorization.imCode === '2180' && isFirstBZA) {
        isFirstBZA = false;
        authorizationNumberArry.push(String(authorization.permissionNumber));
      } else {
        const combinedAuthorizationErrors = this.validateSingleAuthorization(
          authorization,
          authorizationNumberArry,
          authorizationForm
        );

        if (combinedAuthorizationErrors && Object.keys(combinedAuthorizationErrors).length > 0) {
          hasErorrs = true;
        }

        authorizationNumberArry.push(String(authorization.permissionNumber));
      }
    });
    return hasErorrs
  }


  // Section Good

  private validateSingleGood(railOrder: RailOrder, wagonInformation: WagonInformation, goodsIndex: number, good: Goods, goodsInformationForm: AbstractControl = null): ValidationErrors | null {
    // Validations
    const goodWeightErrors = this.validateGoodWeight(railOrder, wagonInformation, good);
    const goodNhmCodeErrors = this.validateGoodNhmCode(railOrder, good);
    const goodVolumeWithoutUnitErrors = this.validateGoodVolumeWithoutUnit(good);
    const goodUnitWithoutVolumeErrors = this.validateGoodUnitWithoutVolume(good);
    const packagingTypeWithoutNumberErrors = this.validatePackingUnitNumberRequired(good);
    const packagingNumberWithoutTypeErrors = this.validatePackingUnitTypeRequired(good);
    const wasteIdObligatoryErrors = this.validateWasteId(railOrder, good);
    const mrnSubTypeObligatoryErrors = this.validateMrnSubType(wagonInformation, good, goodsIndex);
    const nrnSubTypeHasInvalidIdentifierErrors = this.validateMrnIdentifier(wagonInformation, good, goodsIndex);

    const customsReferenceNumberErrors = this.validateCustomsReferenceNumber(good);
    const additionalDescriptionErrors = this.validateAdditionalDescription(good);

    const emptyPackingUnitErrors = this.validateEmptyPackingUnit(wagonInformation, good);
    const netExplosiveMassErrors = this.validateNetExplosiveMassClassRequired(good);
    const nagInfoErrors = this.validateNagInfoRequrired(good);

    // Controls
    const goodWeightControl = goodsInformationForm?.get('weight');
    const nhmCodeControl = goodsInformationForm?.get('nhmCode');
    const volumeControl = goodsInformationForm?.get('volume');
    const unitControl = goodsInformationForm?.get('unit');
    const packingUnitsTypeControl = goodsInformationForm?.get('packingUnitsType');
    const packingUnitsNumberControl = goodsInformationForm?.get('packingUnitsNumber');
    const wasteIdControl = goodsInformationForm?.get('wasteId');
    const externalReferenceSubTypeControl = goodsInformationForm?.get('externalReferenceSubType');
    const externalReferenceIdentifierControl = goodsInformationForm?.get('externalReferenceIdentifier');
    const customsReferenceNumberControl = goodsInformationForm?.get('customsReferenceNumber');
    const additionalDescriptionControl = goodsInformationForm?.get('additionalDescription');
    const emptyPackingUnitControl = goodsInformationForm?.get('emptyPackingUnit');
    const dangerousGoodClassControl = goodsInformationForm?.get('additionalInformationNag');
    const netExplosiveMassClassControl = goodsInformationForm?.get('explosiveMass');
    const nagInfoControl = goodsInformationForm?.get('additionalInformationNag');

    // Put Errors to Controls
    const validationResults = [
      { control: goodWeightControl, error: goodWeightErrors },
      { control: nhmCodeControl, error: goodNhmCodeErrors },
      { control: volumeControl, error: goodUnitWithoutVolumeErrors },
      { control: unitControl, error: goodVolumeWithoutUnitErrors },
      { control: packingUnitsTypeControl, error: packagingNumberWithoutTypeErrors },
      { control: packingUnitsNumberControl, error: packagingTypeWithoutNumberErrors },
      { control: wasteIdControl, error: wasteIdObligatoryErrors },
      { control: externalReferenceSubTypeControl, error: mrnSubTypeObligatoryErrors },
      { control: externalReferenceIdentifierControl, error: nrnSubTypeHasInvalidIdentifierErrors },
      { control: customsReferenceNumberControl, error: customsReferenceNumberErrors },
      { control: additionalDescriptionControl, error: additionalDescriptionErrors },
      { control: emptyPackingUnitControl, error: emptyPackingUnitErrors },
      { control: netExplosiveMassClassControl, error: netExplosiveMassErrors },
      { control: nagInfoControl, error: nagInfoErrors },
    ];

    validationResults.forEach(({ control, error }) => control?.setErrors(error));

    const combinedGoodErrors = {
      ...(goodWeightErrors || {}),
      ...(goodNhmCodeErrors || {}),
      ...(goodUnitWithoutVolumeErrors || {}),
      ...(goodVolumeWithoutUnitErrors || {}),
      ...(packagingTypeWithoutNumberErrors || {}),
      ...(packagingNumberWithoutTypeErrors || {}),
      ...(wasteIdObligatoryErrors || {}),
      ...(mrnSubTypeObligatoryErrors || {}),
      ...(nrnSubTypeHasInvalidIdentifierErrors || {}),
      ...(customsReferenceNumberErrors || {}),
      ...(emptyPackingUnitErrors || {}),
      ...(netExplosiveMassErrors || {}),
      ...(nagInfoErrors || {}),
      ...(additionalDescriptionErrors || {})
    };

    return Object.keys(combinedGoodErrors).length > 0 ? combinedGoodErrors : null
  }

  private extractNumberBeforeDecimal(input: string): string | null {
    if (!input) return null;
    return input.split('.').at(0);
  }
  private validateNetExplosiveMassClassRequired(good: Goods): ValidationErrors | null {
    // Extract the first dangerous good
    const dangerousGood = good?.dangerousGoods?.[0];

    // If there is no dangerous good or its type is invalid, return no errors
    if (!dangerousGood?.class?.trim()) {
      return null;
    }

    // Check if the type is '1' and if explosiveMass is missing or zero
    const classCode = this.extractNumberBeforeDecimal(dangerousGood.class.trim());
    if (classCode === '1') {
      const explosiveMass = dangerousGood.explosiveMass;
      if (!explosiveMass || explosiveMass <= 0) {
        return { netExplosiveMassClassRequired: true };
      }
    }

    // No errors
    return null;
  }
  private validateNagInfoRequrired(good: Goods): ValidationErrors | null {
    // Extract the first dangerous good
    const dangerousGood = good?.dangerousGoods?.[0];

    if (dangerousGood?.additionalInformation) return null;
    // If there is no dangerous good or its type is invalid, return no errors
    return !dangerousGood?.nagFlag ? null : { nagInfoRequired: true };
  }

  private validateGoodNhmCode(railOrder: RailOrder, good: Goods): ValidationErrors | null {
    // Rule 35
    const invalidNhmCodeError = { invalidNhmCode: true };
    const goodNhmCode = good?.nhmCode || null;
    const isInternationalTransport = BaseValidators.isInterNationalTransport(railOrder);

    if (!goodNhmCode) return invalidNhmCodeError;

    // If not international transport no further checks
    if (!isInternationalTransport) return null;

    // Check NHM code validity: must be 6 characters and not start with '00'
    if (goodNhmCode.trim().length !== 6) return invalidNhmCodeError;
    if (goodNhmCode.startsWith('00')) return invalidNhmCodeError;
    return null;

  }

  public validateGoodVolumeWithoutUnit(good: Goods): ValidationErrors | null {
    const volume = good.volume || null;
    const unit = good.unit || null;

    const hasVolumeWithoutUnitError = BaseValidators.hasVolumeWithoutUnit(volume, unit);
    const combinedVolumeUnitErrors = {
      ...(hasVolumeWithoutUnitError || {}),
    };

    return Object.keys(combinedVolumeUnitErrors).length > 0 ? combinedVolumeUnitErrors : null;
  }

  public validateGoodUnitWithoutVolume(good: Goods): ValidationErrors | null {
    const volume = good.volume || null;
    const unit = good.unit || null;

    const hasUnitWithoutVolumeError = BaseValidators.hasUnitWithoutVolume(volume, unit);
    const combinedVolumeUnitErrors = {
      ...(hasUnitWithoutVolumeError || {}),
    };

    return Object.keys(combinedVolumeUnitErrors).length > 0 ? combinedVolumeUnitErrors : null;
  }

  private validateAuthorizationEiuEvu(authorization: ExceptionalConsignment): ValidationErrors | null {
    const imCode = authorization.imCode || null;
    const permissionNumber = authorization.permissionNumber || null;

    const hasEiuEvuWithoutPermissionNumberError = BaseValidators.EiuEvuWithoutPermissionNumber(imCode, permissionNumber);
    const combinedEvuWithoutPermissionNumberErrors = {
      ...(hasEiuEvuWithoutPermissionNumberError || {}),
    };

    return Object.keys(combinedEvuWithoutPermissionNumberErrors).length > 0 ? combinedEvuWithoutPermissionNumberErrors : null;
  }

  private validateAuthorizationPermissionNumber(authorization: ExceptionalConsignment, authorizationNumberArry: String[]): ValidationErrors | null {
    const imCode = authorization.imCode || null;
    const permissionNumber = authorization.permissionNumber || null;

    let hasPermissionNumberDoubleError = {}
    if (authorizationNumberArry.includes(String(permissionNumber))) {
      hasPermissionNumberDoubleError = { hasPermissionNumberDouble: true }
    }


    const hasPermissionNumberWithoutEiuEvuError = BaseValidators.PermissionNumberWithoutEiuEvu(imCode, permissionNumber);
    const combinedPermissionNumberWithoutEiuEvuErrors = {
      ...(hasPermissionNumberWithoutEiuEvuError || {}),
      ...(hasPermissionNumberDoubleError || {})
    };

    return Object.keys(combinedPermissionNumberWithoutEiuEvuErrors).length > 0 ? combinedPermissionNumberWithoutEiuEvuErrors : null;
  }

  private validatePackingUnitNumberRequired(good: Goods): ValidationErrors | null {
    const packingUnits = good.packingUnits || null;
    let packingUnitsTypeWithoutNumberError = null;

    if (good.packingUnits.length > 0) {
      const packagingUnit = good.packingUnits[0];
      packingUnitsTypeWithoutNumberError = BaseValidators.packingUnitNumberRequiredValidator(packagingUnit);
    }

    /*packingUnits.forEach((packingUnit) => {
      packingUnitsTypeWithoutNumberError = BaseValidators.packingUnitNumberRequiredValidator(packingUnit);
    });*/

    const combinedPackingUnitsErrors = {
      ...(packingUnitsTypeWithoutNumberError || {}),
    };

    return Object.keys(combinedPackingUnitsErrors).length > 0 ? combinedPackingUnitsErrors : null;
  }

  private validatePackingUnitTypeRequired(good: Goods): ValidationErrors | null {
    //console.log(good);
    const packingUnits = good.packingUnits || null;
    let packingUnitsNumberWithoutTypeError = null;
    if (good.packingUnits.length > 0) {
      const packagingUnit = good.packingUnits[0]
      packingUnitsNumberWithoutTypeError = BaseValidators.packingUnitTypeRequiredValidator(packagingUnit);
    }

    /*packingUnits.forEach((packingUnit) => {
      packingUnitsNumberWithoutTypeError = BaseValidators.packingUnitTypeRequiredValidator(packingUnit);
    });*/

    const combinedPackingUnitsErrors = {
      ...(packingUnitsNumberWithoutTypeError || {}),
    };

    return Object.keys(combinedPackingUnitsErrors).length > 0 ? combinedPackingUnitsErrors : null;
  }

  public validateGoodWeight(railOrder: RailOrder, wagonInformation: WagonInformation, good: Goods): ValidationErrors | null {
    const serviceSpecification = railOrder.specialTreatmentOrders
    const serviceGoodWeightCodes = ["341", "342", "344", "345"];

    let requiresGoodWeight = true;

    serviceSpecification?.forEach((spec) => {
      const productExtraChargeCode = spec?.productExtraChargeCode || null;
      if (serviceGoodWeightCodes.includes(String(productExtraChargeCode))) {
        requiresGoodWeight = false;
      }
    });

    const goodWeight = good?.weight || null;
    const loadingStatus = wagonInformation?.loadingStatus || null;
    const goodWeightRequiredError = [ValidationMode.VALIDATORS_ORDER, ValidationMode.VALIDATORS_ORDER_AC].includes(this.validationMode) ? BaseValidators.goodWeightReqiredValidator(goodWeight, loadingStatus, requiresGoodWeight) : null;
    const valueHasNoDecimalError = BaseValidators.valueHasNoDecimal(goodWeight);
    const valueIsPositivError = BaseValidators.valueIsPositiv(goodWeight);
    const wagonWeightTooHighError = BaseValidators.isWagonWeightTooHigh(wagonInformation);

    // Combine errors from validators
    const combinedGoodWeightErrors = {
      ...(goodWeightRequiredError || {}),
      ...(wagonWeightTooHighError || {}),
      ...(valueHasNoDecimalError || {}),
      ...(valueIsPositivError || {}),
    };

    return Object.keys(combinedGoodWeightErrors).length > 0 ? combinedGoodWeightErrors : null;

  }

  public validateWasteId(railOrder: RailOrder, good: Goods): ValidationErrors | null {
    const modeOfTransport = railOrder?.modeOfTransport || null;
    const wasteId = good?.wasteId || null;
    const wasteIdObligatoryError = BaseValidators.wasteIdRequiredValidator(modeOfTransport, wasteId);

    const combinedWasteIdErrors = {
      ...(wasteIdObligatoryError || {}),
    };

    return Object.keys(combinedWasteIdErrors).length > 0 ? combinedWasteIdErrors : null;
  }

  /**
   * take care to set validationMode before using this method
   * 
   * @param wagonInformation
   * @param good 
   * @param goodsIndex 
   * @returns 
   */
  public validateMrnSubType(wagonInformation: WagonInformation, good: Goods, goodsIndex: number): ValidationErrors | null {
    if(!this.validationMode || !(this.validationMode == ValidationMode.VALIDATORS_ORDER || this.validationMode == ValidationMode.VALIDATORS_ORDER_AC)) {
      return null;
    }
    let firstMRNReference = null;
    if (goodsIndex < 1) {
      firstMRNReference = wagonInformation.externalReferences?.find(ref => ref.type === 'MRN') || null;
    } else {
      firstMRNReference = good.externalReferences?.find(ref => ref.type === 'MRN') || null;
    }

    let mrnSubType: string | null = null;
    let mrnIdentifier: string | null = null;

    if (firstMRNReference) {
      mrnSubType = firstMRNReference.subType || null;
      mrnIdentifier = firstMRNReference.identifier || null;
    }
    const nrnSubTypeObligatoryError = BaseValidators.MrnSubTypeRequiredValidator(mrnIdentifier, mrnSubType);
    const combinedMrnErrors = {
      ...(nrnSubTypeObligatoryError || {}),
    };

    return Object.keys(combinedMrnErrors).length > 0 ? combinedMrnErrors : null;
  }

  /**
   * take care to set validationMode before using this method
   * 
   * @param wagonInformation
   * @param good 
   * @param goodsIndex 
   * @returns 
   */
  public validateMrnIdentifier(wagonInformation: WagonInformation, good: Goods, goodsIndex: number): ValidationErrors | null {
    let firstMRNReference = null;
    if (goodsIndex < 1) {
      firstMRNReference = wagonInformation.externalReferences?.find(ref => ref.type === 'MRN') || null;
    } else {
      firstMRNReference = good.externalReferences?.find(ref => ref.type === 'MRN') || null;
    }

    let mrnSubType: string | null = null;
    let mrnIdentifier: string | null = null;

    if (firstMRNReference) {
      mrnSubType = firstMRNReference.subType || null;
      mrnIdentifier = firstMRNReference.identifier || null;
    }
    let nrnIdentifierRequiredError = null;
    if(this.validationMode && (this.validationMode == ValidationMode.VALIDATORS_ORDER || this.validationMode == ValidationMode.VALIDATORS_ORDER_AC)) {
       nrnIdentifierRequiredError = BaseValidators.validateMrnIdentifierRequired(mrnIdentifier,mrnSubType);
    }

    if(nrnIdentifierRequiredError) return nrnIdentifierRequiredError;

    const nrnIdentifierError = BaseValidators.validateMrnIdentifierByType(mrnIdentifier, mrnSubType);
    const combinedMrnIdentifierErrors = {
      ...(nrnIdentifierError || {}),
      ...(nrnIdentifierRequiredError || {})
    };

    return Object.keys(combinedMrnIdentifierErrors).length > 0 ? combinedMrnIdentifierErrors : null;
  }

  private validateEmptyPackingUnit(wagonInformation: WagonInformation, good: Goods): ValidationErrors | null {
    const dangerousGood = good?.dangerousGoods?.[0];

    // Return null if no dangerousGood or the wagon is not empty
    if (!dangerousGood) return null;
    if (String(wagonInformation.loadingStatus) == 'true') return null;
    if (this.isObjectEmpty(dangerousGood)) return null;

    // Check for an empty packing unit
    const emptyPackingUnit = dangerousGood.emptyPackingUnit;
    if (!emptyPackingUnit?.length) {
      return { emptyPackagingUnitRequired: true };
    }

    return null;
  }

  public validateCustomsReferenceNumber(good: Goods): ValidationErrors | null {
    const customsReferenceNumber = good?.customsReferenceNumber
    const errors: ValidationErrors = {};

    // Check if the customsReferenceNumber is required (not null or empty)
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
    return Object.keys(errors).length > 0 ? errors : null;
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

  public validateAdditionalDescription(good: Goods): ValidationErrors | null {
    const additionalDescription = good?.additionalDescription?.trim();
    const dangerousGood = good?.dangerousGoods[0];
    const dangerousGoodsNumber = dangerousGood?.dangerIdentificationNumber || null;

    // Early exit if additional declaration exists, no dangerous goods, or dangerous goods are empty
    if (additionalDescription?.length > 0) return null;
    if (!dangerousGood?.dangerIdentificationNumber) return null;
    if (this.isObjectEmpty(dangerousGood)) return null;


    // Return error if required conditions are not met
    return !dangerousGoodsNumber && !additionalDescription ? { additionalDeclarationRequired: true } : null;
  }

  private validateSealsNumber(seals: Seal): ValidationErrors | null {
    const referenceNumber = seals.referenceNumber;
    const type = seals.type;

    if (!referenceNumber && type) {
      return { hasTypeWithoutReferenceNumber: true };
    }

    return null;
  }

  private validateSealsType(seals: Seal): ValidationErrors | null {
    const referenceNumber = seals.referenceNumber;
    const type = seals.type;

    if (referenceNumber && !type) {
      return { hasReferenceNumberWithoutType: true };
    }

    return null;
  }

  // Seals

  private validateSingleSeal(seals: Seal, sealsForm: AbstractControl = null): ValidationErrors | null {

    const numberErrors = this.validateSealsNumber(seals);
    const sealsTypeError = this.validateSealsType(seals);

    const numberControl = sealsForm?.get('referenceNumber');
    numberControl?.setErrors(numberErrors);

    const sealsTypeControl = sealsForm?.get('type');
    sealsTypeControl?.setErrors(sealsTypeError);

    const combinedSealsErrors = {
      ...(numberErrors || {}),
      ...(sealsTypeError || {})
    };

    return Object.keys(combinedSealsErrors).length > 0 ? combinedSealsErrors : null
  }

  // LoadingTackles

  private validateSingleLoadladingTackles(wagonInformation: WagonInformation, loadingTackles: LoadingTackles, loadingTacklesForm: AbstractControl = null): ValidationErrors | null {

    const numberOfLoadingTacklesErrors = this.validateLoadingTacklesNumber(loadingTackles);
    const typeErrors = this.validateLoadingTacklesType(loadingTackles);
    const weightErrors = this.validateLoadingTackleWeight(wagonInformation, loadingTackles);

    // const numberOfLoadingTacklesControl = loadingTacklesForm?.get('numberOfLoadingTackles');
    // numberOfLoadingTacklesControl?.setErrors(numberOfLoadingTacklesErrors);

    // const typeControl = loadingTacklesForm?.get('type');
    // typeControl?.setErrors(typeErrors);

    // const weightControl = loadingTacklesForm?.get('weight');
    // weightControl?.setErrors(weightErrors);

    const combinedLadingTacklesErrors = {
      ...(numberOfLoadingTacklesErrors || {}),
      ...(typeErrors || {}),
      ...(weightErrors || {}),

    };

    return Object.keys(combinedLadingTacklesErrors).length > 0 ? combinedLadingTacklesErrors : null;
  }

  private validateLoadingTackleWeight(wagonInformation: WagonInformation, loadingTackles: LoadingTackles): ValidationErrors | null {
    const type = loadingTackles.type;
    const numberOfLoadingTackles = loadingTackles.number;
    const weight = loadingTackles.weight;

    if (!weight && (numberOfLoadingTackles || type)) {
      return { weightRequired: true };
    }

    const totalWeightError = BaseValidators.isWagonWeightTooHigh(wagonInformation);

    const combinedWeightErrors = {
      ...(totalWeightError || {}),
    };

    return Object.keys(combinedWeightErrors).length > 0 ? combinedWeightErrors : null
  }

  private validateLoadingTacklesType(loadingTackles: LoadingTackles): ValidationErrors | null {
    const type = loadingTackles.type;
    const numberOfLoadingTackles = loadingTackles.number;
    const weight = loadingTackles.weight;

    if (!type && (numberOfLoadingTackles || weight)) {
      return { typeRequired: true };
    }

    return null;
  }

  private validateLoadingTacklesNumber(loadingTackles: LoadingTackles): ValidationErrors | null {
    const numberOfLoadingTackles = loadingTackles.number;
    const type = loadingTackles.type;
    const weight = loadingTackles.weight;

    if (numberOfLoadingTackles && numberOfLoadingTackles > 99) {
      return { numberTooLarge: true };
    }

    if (!numberOfLoadingTackles && (type || weight)) {
      return { numberRequired: true };
    }
    return null;
  }

  // Authorisation
  private validateSingleAuthorization(authorization: ExceptionalConsignment, authorizationNumberArry: String[], authorizationForm: AbstractControl = null): ValidationErrors | null {

    const authorizationEiuEvuErrors = this.validateAuthorizationEiuEvu(authorization);
    const authorizationPermissionNumberErrors = this.validateAuthorizationPermissionNumber(authorization, authorizationNumberArry);


    const authorizationCodeControl = authorizationForm?.get('imCode');
    authorizationCodeControl?.setErrors(authorizationEiuEvuErrors);

    const authorizationpermissionNumberControl = authorizationForm?.get('permissionNumber');
    authorizationpermissionNumberControl?.setErrors(authorizationPermissionNumberErrors);

    const combinedAuthorizationErrors = {
      ...(authorizationEiuEvuErrors || {}),
      ...(authorizationPermissionNumberErrors || {}),

    };

    return Object.keys(combinedAuthorizationErrors).length > 0 ? combinedAuthorizationErrors : null
  }

  public validateWagonNumber(wagonInformation: WagonInformation, wagonFormWagonList: FormArray, index: number, validationMode: ValidationMode) {
    const wagonNumber = wagonInformation.wagonNumber;
    const errors = {
      ...BaseValidators.wagonNumberLuhnValidator(wagonNumber),
      ...BaseValidators.wagonNumberLengthValidator(wagonNumber),
      ...BaseValidators.wagonNumberDuplicateValidator(wagonNumber),
      ...BaseValidators.wagonNumberIsNumeric(wagonNumber),
    };

    if (validationMode !== ValidationMode.VALIDATORS_DRAFT && Object.keys(errors).length > 0) {
      wagonFormWagonList.controls[index].setErrors([{ 'invalidWagon': true }]);
    }
  }

  public isSealingListValid(wagonInformation: WagonInformation): boolean {
    let hasErorrs = false
    for (let i = 0; i < wagonInformation?.seals?.length; i++) {
      const seals = wagonInformation.seals[i];
      const combinedSealsErrors = this.validateSingleSeal(seals, null);
      if (combinedSealsErrors && Object.keys(combinedSealsErrors).length > 0) {
        hasErorrs = true;
      }
    }
    return hasErorrs
  }

  public isLoadingTacklesListValid(wagonInformation: WagonInformation): boolean {
    let hasErorrs = false
    for (let i = 0; i < wagonInformation?.loadingTackles?.length; i++) {
      const loadingTackles = wagonInformation.loadingTackles[i];
      const combinedloadingTacklesErrors = this.validateSingleLoadladingTackles(wagonInformation, loadingTackles, null);
      if (combinedloadingTacklesErrors && Object.keys(combinedloadingTacklesErrors).length > 0) {
        hasErorrs = true;
      }
    }
    return hasErorrs;
  }
   
  public isAuthorizationListValid(wagonInformation: WagonInformation): boolean {
    let hasErorrs = false

    let authorizationNumberArry: string[] = [];
    let isFirstBZA = true;

    wagonInformation?.exceptionalConsignments?.forEach((authorization, i) => {
      
      if (authorization.imCode === '2180' && isFirstBZA) {
        isFirstBZA = false;
        authorizationNumberArry.push(String(authorization.permissionNumber));
      } else {
        const combinedAuthorizationErrors = this.validateSingleAuthorization(
          authorization,
          authorizationNumberArry,
          null
        );

        if (combinedAuthorizationErrors && Object.keys(combinedAuthorizationErrors).length > 0) {
          hasErorrs = true;
        }

        authorizationNumberArry.push(String(authorization.permissionNumber));
      }
    });

    return hasErorrs;
  }
}