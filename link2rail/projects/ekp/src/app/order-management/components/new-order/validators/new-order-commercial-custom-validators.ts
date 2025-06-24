import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isInterNationalTransport, isMultiNationalTransport, isNationalTransport } from './new-order-custom-validators';


// Rule 57
export const SpecificationValidator: ValidatorFn = (group: FormGroup) => {
  const codeControl = group.get('code');
  const code = codeControl?.value;
  const additionalInfoControl = group.get('additionalInformation');
  const additionalInfo = additionalInfoControl?.value;

  if (code && !additionalInfo) {
    return { descriptionOfSpecificationMissing: true };
  }
  // Rule 56
  if (!code && additionalInfo) {
    return { typeOfSpecificationMissing: true };
  }
  return null;
};

export const SectionalInvoicingValidator: ValidatorFn = (group: FormGroup) => {
  const executingCarrierRuCode = group.get('executingCarrierRuCode');
  const sectionalInvoicingCarrierCode = group.get('sectionalInvoicingCarrierCode');
  if (executingCarrierRuCode.value) {
    if (!sectionalInvoicingCarrierCode.value) {
      return { sectionalInvoicing: true };
    }
  }
  return null;
}

// Rule 58
export const ContractNumberNumericValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  const value = formGroup.get('commercialInformationContractNumber').value ? formGroup.get('commercialInformationContractNumber').value : null;
  const contractNumberControl = formGroup.get('commercialInformationContractNumber');
  if(value && isNaN(Number(value))) {
    contractNumberControl.setErrors( { ContractNumberNotNumerical: true })
  }
  
  return value && isNaN(Number(value)) ? { ContractNumberNotNumerical: true } : null;
};


export const ContractNumberSequenceValidator = (formGroup: FormGroup): ValidationErrors | null => {

  let contractNumber = formGroup.get('commercialInformationContractNumber')?.value ? formGroup.get('commercialInformationContractNumber').value : null;
  const contractNumberControl = formGroup.get('commercialInformationContractNumber')

  if(contractNumber && isNaN(Number(contractNumber))) {

    contractNumberControl.setErrors( { ContractNumberNotNumerical: true })
    return  { ContractNumberNotNumerical: true }
  }

  const error = { contractNumberInvalidChecksum: true };
  if (!contractNumber) {
    return null;
  }

  if (contractNumber.length != contractNumber.replace(/\D/g, '').length) {
    contractNumberControl.setErrors(error)
    return error;
  }

  if (contractNumber.replace(/\D/g, '').length < 7) {
    contractNumberControl.setErrors(error)
    return error;
  }

  if (contractNumber.length >= 7) {
      const isValid = validateContractNumberLuhn(contractNumber)
      if(!isValid) contractNumberControl.setErrors(error);
      return !isValid ? error : null;
  }

  return null;
};

export function validateContractNumberLuhn(number: string) {
  if (number && number.length > 7) number = number.slice(0,7);
  let sum = 0;
  let shouldDouble = false;
  if (!number || number == '') return true;
  // Process digits from right to left
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += Number(digit);
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Rule 59
export const PrepaymentNotesValidator: ValidatorFn = (group: FormGroup) => {
  const pickupCountry = group.get('pickupDelivery').get('pickupCountry')?.value;
  const deliveryCountry = group.get('pickupDelivery').get('deliveryCountry')?.value;
  const prepaymentNoteControl = group.get('commercial').get('prepaymentNote');
  const prepaymentNodeCode = prepaymentNoteControl?.value ? String(prepaymentNoteControl.value) : null;

  if(!prepaymentNodeCode) {
    prepaymentNoteControl.setErrors({ PrepaymentNoteRequired: true });
    return { PrepaymentNoteRequired: true };
  }

  if (prepaymentNodeCode && (pickupCountry && deliveryCountry)) {

    if (isNationalTransport(group)) {
      const invalidNationalPrepayment = ["10", "11", '12', '14', '15', '16', '17', '20', '99'];
      if (invalidNationalPrepayment.includes(prepaymentNodeCode)) {
        prepaymentNoteControl.setErrors({ PrepaymentNoteInvalid: true });
        return { PrepaymentNoteInvalid: true };
      }
    }

    if (isMultiNationalTransport(group) || isInterNationalTransport(group)) {
      const invalidInternationalPrepayment = ['01', '02', '03', '04', '05', '06', "07", '08', '09'];
      if (invalidInternationalPrepayment.includes(prepaymentNodeCode)) {
        prepaymentNoteControl.setErrors({ PrepaymentNoteInvalid: true });
        return { PrepaymentNoteInvalid: true };
      }
    }
  }
  return null; // Validation passed
};

// Rule 60
export const PrepaymentNoteNeedsProductExtraChargeCodeValidator: ValidatorFn = (group: FormGroup) => {
  const prepaymentNoteControl = group.get('prepaymentNote');
  const prepaymentNodeCode = prepaymentNoteControl?.value ? String(prepaymentNoteControl.value) : null;
  if (prepaymentNodeCode) {
    const extraChargeCodes = group.get('productExtraChargeCodes')?.value;

    const prepaymentNeedExtraCharge = ['02', '06', '11', '12', '13', '14'];
    // Check if the prepayment code requires extra charge codes
    if (prepaymentNeedExtraCharge.includes(prepaymentNodeCode)) {
      if (Array.isArray(extraChargeCodes)) {
        //const hasNonNullValue = extraChargeCodes.some(code => code !== null && code !== undefined);
        for(let i = 0; i<extraChargeCodes.length; i++){
          if (extraChargeCodes.at(i).productExtraChargeCode && extraChargeCodes.at(i).productExtraChargeCode  != undefined ){
              return null
          }

        } 
        return { MissingExtraChargeCode: true }; // Validation failed
      } else {
        // If productExtraChargeCodes is not an array, consider it invalid
        return { MissingExtraChargeCode: true };
      }
    }
  }
  return null; // Validation passed
};

// Rule 61
export const prepaymentUpToAuthorityObligatoryByPrepaymentNote: ValidatorFn = (group: FormGroup) => {
  const prepaymentNoteControl = group.get('prepaymentNote');
  const prepaymentNodeCode = prepaymentNoteControl?.value ? String(prepaymentNoteControl.value) : null;
  if (prepaymentNodeCode) {
    const prepaymentUpToAuthorityObligatory = ['14', '17', 'DAF4'];
    const prepaymentUpToAuthorityControl = group.get('prepaymentUpToAuthority');
    const prepaymentUpToAuthority = group.get('prepaymentUpToAuthority')?.value;

    // Check if prepaymentNodeCode is in the obligatory list and if prepaymentUpToAuthority is missing
    if (prepaymentUpToAuthorityObligatory.includes(prepaymentNodeCode) && !prepaymentUpToAuthority) {
      prepaymentUpToAuthorityControl.setErrors({ MissingPrepaymentUpToAuthority: true }) 
      return { MissingPrepaymentUpToAuthority: true }; // Validation failed
    }
  };

  return null; // Validation passed
}

// Rule 62
export const prepaymentUpToBorderDescriptionObligatoryByPrepaymentNote: ValidatorFn = (group: FormGroup) => {
  const prepaymentNoteControl = group.get('prepaymentNote');
  const prepaymentNodeCode = prepaymentNoteControl?.value ? String(prepaymentNoteControl.value) : null;
  if (prepaymentNodeCode) {
    const prepaymentUpToBorderDescriptionObligatory = ['14', '17', 'DAF4'];
    const prepaymentUpToBorderDescriptionContol = group.get('prepaymentUpToBorderDescription')
    const prepaymentUpToBorderDescription = group.get('prepaymentUpToBorderDescription')?.value;

    // Validate only if prepaymentNodeCode is not null
    if (prepaymentNodeCode && prepaymentUpToBorderDescriptionObligatory.includes(prepaymentNodeCode) && !prepaymentUpToBorderDescription) {
      prepaymentUpToBorderDescriptionContol.setErrors( {MissingPrepaymentUpToBorderDescription: true} )
      return { MissingPrepaymentUpToBorderDescription: true }; // Validation failed
    }
  }
  return null; // Validation passed
};