import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HandOverTakeOverEnum } from '../models/new-order.model';

// Rule 66 TODO 
export const consignorDeclarationDescriptionValidator: ValidatorFn = (group: FormArray) => {

  let hasErrors = false;
  if (Array.isArray(group.controls)) {
    group.controls?.forEach((control) => {

      const descriptionError = { missingDescription: true }
      const consignorDeclarationDescriptionContol = control.get('consignorDeclarationDescription')
      consignorDeclarationDescriptionContol?.setErrors(null);
      const consignorDeclarationDescriptionValue = consignorDeclarationDescriptionContol?.value ? consignorDeclarationDescriptionContol?.value : null;
      const consignorDeclarationCodeContol = control.get('consignorDeclarationCode')
      const consignorDeclarationsValue = consignorDeclarationCodeContol?.value ? consignorDeclarationCodeContol?.value : null;

      if (consignorDeclarationsValue) {
        const value = consignorDeclarationsValue.slice(consignorDeclarationsValue.indexOf('#') + 1)
        if (value == 'J' && !consignorDeclarationDescriptionValue) {
          consignorDeclarationDescriptionContol?.setErrors(descriptionError)
          hasErrors = true
        }
      }
    });
  }

  return hasErrors ?{ missingDescription: true }: null
}

export const consignorDeclarationCodeValidator: ValidatorFn = (group: FormArray) => {

  let hasErrors = false;
  const missingConsignorDeclarationCodeError = { missingConsignorDeclarationCode: true }

  if (Array.isArray(group.controls)) {
    group.controls?.forEach((control) => {
      const consignorDeclarationCodeContol = control.get('consignorDeclarationCode')
      consignorDeclarationCodeContol?.setErrors(null);
      const consignorDeclarationCodeValue = consignorDeclarationCodeContol?.value ? consignorDeclarationCodeContol?.value : null;
      
      const consignorDeclarationDescriptionContol = control.get('consignorDeclarationDescription')
      const consignorDeclarationsDescriptionValue = consignorDeclarationDescriptionContol?.value ? consignorDeclarationDescriptionContol?.value : null;

      if (!consignorDeclarationCodeValue && consignorDeclarationsDescriptionValue) {
        consignorDeclarationCodeContol?.setErrors(missingConsignorDeclarationCodeError)
          hasErrors = true
      }
    });
  }

  return hasErrors ? missingConsignorDeclarationCodeError : null
}

// Rule 67a
export const originPortObligatoryByShipOwnerShipNameArrivalDate: ValidatorFn = (group: FormGroup) => {
  const typeOfTakeOverControl = group.get('takeOverConditionsTypeOfTakeOver');
  const typeOfTakeOver = typeOfTakeOverControl?.value ? String(typeOfTakeOverControl.value) : null;
  if (!typeOfTakeOver && typeOfTakeOver == HandOverTakeOverEnum.takeOver.toString()) {
    return null
  };
  const shipOwnerControl = group.get('takeOverConditionsShipOwner');
  const shipOwner = shipOwnerControl?.value ? shipOwnerControl.value : null;
  const shipNameControl = group.get('takeOverConditionsShipName');
  const shipName = shipNameControl?.value ? shipNameControl.value : null;
  const arrivalDateControl = group.get('takeOverConditionsArrivalDate');
  const arrivalDate = arrivalDateControl?.value ? arrivalDateControl.value : null;
  const originPortControl = group.get('takeOverConditionsOriginPort');
  originPortControl.setErrors(null);

  if (shipOwner || shipName || arrivalDate) { 
    const originPort = originPortControl?.value ? originPortControl.value : null;
    if (!originPort) {
      originPortControl.setErrors({ originMissingPort: true });
      return { originMissingPort: true };

    }
  }
  return null; // Validation passed
}

// Rule 67b
export const destinationPortObligatoryByShipOwnerShipNameDepartureDate: ValidatorFn = (group: FormGroup) => {
  const typeOfTakeOverControl = group.get('takeOverConditionsTypeOfTakeOver');
  //const typeOfTakeOverControl2 = group.get('parent').get('takeOverConditionsTypeOfTakeOver');

  const typeOfTakeOver = typeOfTakeOverControl?.value ? String(typeOfTakeOverControl.value) : null;
  if (!typeOfTakeOver && typeOfTakeOver == HandOverTakeOverEnum.handOver.toString()) {
    return null
  };
  const shipOwnerControl = group.get('handOverConditionsShipOwner');
  const shipOwner = shipOwnerControl?.value ? shipOwnerControl.value : null;
  const shipNameControl = group.get('handOverConditionsShipName');
  const shipName = shipNameControl?.value ? shipNameControl.value : null;
  const arrivalDateControl = group.get('handOverConditionsDepartureDate');
  const arrivalDate = arrivalDateControl?.value ? arrivalDateControl.value : null;
  const destinationPortControl = group.get('handOverConditionsDestinationPort');
  destinationPortControl.setErrors(null)

  if (shipOwner || shipName || arrivalDate) {
    const destinationPort = destinationPortControl?.value ? destinationPortControl.value : null;
    if (!destinationPort) {
      destinationPortControl.setErrors({ destinationMissingPort: true })
      return { destinationMissingPort: true };

    }
  }
  return null; // Validation passed
}


// Rule 68
export const attachedDocumentCodeObligatoryByDescriptionNumberOfOriginalsReferenceNumber: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  const descriptionControl = control.get('attachedDocumentDescription');
  const description = descriptionControl?.value ? descriptionControl.value : null;
  const numberOfOriginalsControl = control.get('attachedDocumentNumberOfOriginals');
  const numberOfOriginals = numberOfOriginalsControl?.value ? numberOfOriginalsControl.value : null;
  const referenceNumberControl = control.get('attachedDocumentReferenceNumber');
  const referenceNumber = referenceNumberControl?.value ? referenceNumberControl.value : null;

  if (description || numberOfOriginals || referenceNumber) {
    const codeControl = control.get('attachedDocumentCode');
    const code = codeControl?.value ? codeControl.value : null;
    if (!code) {
      codeControl.setErrors({ missingCode: true });
      return { missingCode: true };

    }
  }

  return null;
}
