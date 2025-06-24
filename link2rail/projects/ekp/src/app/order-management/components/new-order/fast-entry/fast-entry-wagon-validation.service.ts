import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { RailOrder, SpecialTreatmentOrder } from '@src/app/order-management/models/rail-order-api';
import { BaseValidators } from '../validators/base-validations';
import { ValidationMode } from '../validators/validator-field.config';

export interface WagonValidState {
  wagonListInvalid: boolean;
  requiresGoodWeight: boolean;
  isValid: boolean;
  validationMode: ValidationMode | null;
}

export interface RailOrderValidState {
  wagonValidState?: WagonValidState;
  missingAuthority?: boolean;
  isValid: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class FastEntryValidationService {
  private serviceGoodWeightObligatoryCodes = ['341', '342', '344', '345'];

  constructor() { }

  public validateRailOrder(railOrder: RailOrder): RailOrderValidState {
    const railOrderValidState: RailOrderValidState = { isValid: true };
    const hasAuthorities = railOrder.acceptancePoint?.authority && railOrder.deliveryPoint?.authority;
    if (!hasAuthorities) {
      railOrderValidState.missingAuthority = true;
      railOrderValidState.isValid = false;
    }
    return railOrderValidState;
  }

  private getRequiresGoodWeight(railOrder: RailOrder, validState: WagonValidState) {
    // Determine if the service requires good weight
    railOrder.specialTreatmentOrders.forEach((sto: SpecialTreatmentOrder) => {
      if (this.serviceGoodWeightObligatoryCodes.includes(String(sto.productExtraChargeCode))) {
        validState.requiresGoodWeight = false;
        validState.isValid = false;
      }
    });
  }

  public validateWagons(railOrder: RailOrder, validationMode: ValidationMode, wagonInformationFormArray: FormArray) {
    const validState: WagonValidState = {
      isValid: true,
      requiresGoodWeight: true,
      wagonListInvalid: false,
      validationMode: null
    };

    validState.validationMode = validationMode;
    // Check if the validation mode is VALIDATORS_BOOKING or VALIDATORS_BOOKING_AC
    if(validationMode == ValidationMode.VALIDATORS_BOOKING || validationMode == ValidationMode.VALIDATORS_BOOKING_AC) {
      validState.requiresGoodWeight = false
    };

    this.getRequiresGoodWeight(railOrder, validState);
    // Clear wagon numbers set before validation
    BaseValidators.clearWagonNumbersSet();

    wagonInformationFormArray.controls?.forEach((formGroup: FormGroup) => {
      const firstGoodWeightControl = formGroup.get('weight');
      firstGoodWeightControl.setErrors(null);
      const goodWeight = firstGoodWeightControl?.value || null;

      const loadingStatusControl = formGroup.get('loadingStatus');
      loadingStatusControl.setErrors(null);
      const loadingState = String(loadingStatusControl?.value) == 'true';

      this.wagonNumber(formGroup, validState);
      this.validateNhmCode(railOrder, validState, formGroup);

      this.validateGoodWeight(goodWeight, loadingState, validState, firstGoodWeightControl);

      // Loading State
      this.validateLoadingState(goodWeight, loadingState, loadingStatusControl, validState);
    });

    return validState.isValid ? null : { wagonListInvalid: true };
  }

  private validateLoadingState(goodWeight: any, loadingState: boolean, loadingStatusControl: AbstractControl<any, any>, validState: WagonValidState) {
    const loadingStateErrors = BaseValidators.loadingStateRequiredValidator(goodWeight, loadingState);
    const combinedloadingStateErrors = {
      ...(loadingStateErrors || {}),
    };

    // Apply combined errors to the control
    loadingStatusControl?.setErrors(
      Object.keys(combinedloadingStateErrors).length > 0 ? combinedloadingStateErrors : null
    );

    if (combinedloadingStateErrors.errors?.length > 0) {
      validState.isValid = false;
    }
  }

  private validateGoodWeight(goodWeight: any, loadingState: boolean, validState: WagonValidState, firstGoodWeightControl: AbstractControl<any, any>) {
    const goodWeightReqiredError = BaseValidators.goodWeightReqiredValidator(goodWeight, loadingState, validState.requiresGoodWeight);
    const valueHasNoDecimalError = BaseValidators.valueHasNoDecimal(goodWeight);
    const valueIsPositivError = BaseValidators.valueIsPositiv(goodWeight);

    const combinedGoodWeightErrors = {
      ...(goodWeightReqiredError || {}),
      ...(valueHasNoDecimalError || {}),
      ...(valueIsPositivError || {}),
    };

    // Apply combined errors to the control
    firstGoodWeightControl?.setErrors(
      Object.keys(combinedGoodWeightErrors).length > 0 ? combinedGoodWeightErrors : null
    );

    if (firstGoodWeightControl.errors?.length > 0) {
      validState.isValid = false;
    }
  }

  private validateNhmCode(railOrder: RailOrder, validState: WagonValidState, formGroup: FormGroup) {
    const firstGoodNhmCodeControl = formGroup.get('nhmCode');
    firstGoodNhmCodeControl.setErrors(null);
    const nhmCode = firstGoodNhmCodeControl?.value || null;
    const firstGoodNhmError = this.firstGoodNhmValidator(nhmCode, railOrder);
    const firstGoodNhmErrors = {
      ...(firstGoodNhmError || {}),
    };

    firstGoodNhmCodeControl?.setErrors(
      Object.keys(firstGoodNhmErrors).length > 0 ? firstGoodNhmErrors : null
    );

    if (firstGoodNhmCodeControl.errors) {
      validState.isValid = false;
    }
  }

  private firstGoodNhmValidator(goodNhmCode: string | null, railOrder: RailOrder) {
    const isInternationalTransport = railOrder.acceptancePoint?.authority != 80 || railOrder.deliveryPoint?.authority != 80;
    const invalidNhmCodeError = { invalidNhmCode: true };

    if (!goodNhmCode) return invalidNhmCodeError;

    // If not international transport no further checks
    if (!isInternationalTransport) return null;

    // Check NHM code validity: must be 6 characters and not start with '00'
    if (goodNhmCode.trim().length !== 6) return invalidNhmCodeError;
    if (goodNhmCode.startsWith('00')) return invalidNhmCodeError;
    return null;
  }

  private wagonNumber(formGroup: FormGroup, validState: WagonValidState) {
    formGroup.get('wagonNumber').setErrors(null);
    let wagonNumber = formGroup.get('wagonNumber')?.value || null;
    if(wagonNumber) {
      wagonNumber = wagonNumber.replace(/\D/g, '');
    }

    let combinedWagonNumberErrors = null;
    if(validState.validationMode == ValidationMode.VALIDATORS_BOOKING || validState.validationMode == ValidationMode.VALIDATORS_BOOKING_AC) {
      combinedWagonNumberErrors =this.validateWagonNumberBooking(wagonNumber);
    }else{
     combinedWagonNumberErrors = this.validateWagonNumber(wagonNumber);
    }
    // Apply combined errors to the control
    formGroup.get('wagonNumber')?.setErrors(
      Object.keys(combinedWagonNumberErrors).length > 0 ? combinedWagonNumberErrors : null
    );

    // Update validity status
    if (Object.keys(combinedWagonNumberErrors).length > 0) {
      validState.isValid = false;
    }


    const typeOfWagonControl = formGroup.get('typeOfWagon') as FormControl;
    const typeOfWagon = typeOfWagonControl.value;
    const missingWagonTypeError = BaseValidators.typeOfWagonValidator(wagonNumber, typeOfWagon);
    typeOfWagonControl.setErrors(missingWagonTypeError);
    if (typeOfWagonControl.errors) {
      validState.isValid = false;
    }
  }

  private validateWagonNumber(wagonNumber: string) {
    const lengthErrors = BaseValidators.wagonNumberLengthValidator(wagonNumber);
    const luhnErrors = BaseValidators.wagonNumberLuhnValidator(wagonNumber);
    const wagonNumberDuplicateErrors = BaseValidators.wagonNumberDuplicateValidator(wagonNumber);
    const wagonNumberIsNumericErrors = BaseValidators.wagonNumberIsNumeric(wagonNumber);


    // Combine errors from validators
    const combinedWagonNumberErrors = {
      ...(lengthErrors || {}),
      ...(luhnErrors || {}),
      ...(wagonNumberDuplicateErrors || {}),
      ...(wagonNumberIsNumericErrors || {}),
    };
    return combinedWagonNumberErrors;
  }

  private validateWagonNumberBooking(wagonNumber: string) {
    const luhnErrors = BaseValidators.wagonNumberLuhnValidator(wagonNumber);
    const wagonNumberDuplicateErrors = BaseValidators.wagonNumberDuplicateValidator(wagonNumber);

    // Combine errors from validators
    const combinedWagonNumberErrors = {
      ...(luhnErrors || {}),
      ...(wagonNumberDuplicateErrors || {}),
    };
    return combinedWagonNumberErrors;
  }

}
