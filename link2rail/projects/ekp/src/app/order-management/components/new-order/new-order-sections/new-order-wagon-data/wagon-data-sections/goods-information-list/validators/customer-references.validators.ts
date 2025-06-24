import { FormArray, FormGroup, ValidationErrors, ValidatorFn, FormControl } from "@angular/forms";

export class CustomerReferenceValidators {

    static validateCustomerReferenceFormArray(): ValidatorFn {
    return (formArray: FormArray): ValidationErrors | null => {
      let isValid = true;
      const errors: ValidationErrors = {};

      formArray.controls.forEach((itemGroup: FormGroup, index: number) => {
        // Extract controls
        const typeControl = itemGroup.get('type');
        const identifierControl = itemGroup.get('identifier');
        typeControl?.setErrors(null); 
        identifierControl?.setErrors(null); 
        
        // Extract values
        const identifierValue = identifierControl?.value;

        // Custom validation logic
       
        // 1. Check if type field has a minLength of 10
        if (identifierValue && identifierValue.length > 35) {
            identifierControl?.setErrors({ 
            maxlength: { 
              maxLength: 35, 
              actualLength: identifierControl?.value.length 
            } 
          });
          isValid = false;
        }

      });

      // If the form is invalid, return errors object, otherwise return null
      return isValid ? null : errors;
    };
  }
}