import { FormArray, FormGroup, ValidationErrors, ValidatorFn, FormControl } from "@angular/forms";

export class SealingValidators {

    static validateSealsFormArray(): ValidatorFn {
    return (formArray: FormArray): ValidationErrors | null => {
      let isValid = true;
      const errors: ValidationErrors = {};

      formArray.controls.forEach((itemGroup: FormGroup, index: number) => {
        // Extract controls
        const typeControl = itemGroup.get('type');
        const referenceNumberControl = itemGroup.get('referenceNumber');
        typeControl?.setErrors(null); 
        referenceNumberControl?.setErrors(null); 
        
        // Extract values
        const typeValue = typeControl?.value;
        const referenceNumberValue = referenceNumberControl?.value;

        // Custom validation logic
        // 1. If type exists but referenceNumber is missing
        if (typeValue && !referenceNumberValue) {
          referenceNumberControl?.setErrors({ hasTypeWithoutReferenceNumber: true });
          isValid = false;
        }

        // 2. If referenceNumber exists but type is missing
        else if (!typeValue && referenceNumberValue) {
          typeControl?.setErrors({ hasReferenceNumberWithoutType: true });
          isValid = false;
        }

        // 3. Check if type field is required
        if (typeControl?.hasError('required')) {
          isValid = false;
        }

        // 4. Check if referenceNumber field is required
        if (referenceNumberControl?.hasError('required')) {
          isValid = false;
        }
      });

      // If the form is invalid, return errors object, otherwise return null
      return isValid ? null : errors;
    };
  }
}