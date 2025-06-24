import { FormArray, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { WagonInformation } from "@src/app/order-management/models/rail-order-api";
import { BaseValidators } from "@src/app/order-management/components/new-order/validators/base-validations";

export class AuthorisationValidators {
    static validateAuthorisationFormArray(wagonInformation: WagonInformation): ValidatorFn {
        return (formArray: FormArray): ValidationErrors | null => {
            let isValid = true;
            const errors: ValidationErrors = {};

            // Loop through each FormGroup in the FormArray
            formArray.controls.forEach((itemGroup: FormGroup) => {
                const imCodeControl = itemGroup.get('imCode');
                const permissionNumberControl = itemGroup.get('permissionNumber');
                const imCode = imCodeControl?.value;
                const permissionNumber = permissionNumberControl?.value;

                // Clear previous errors
                imCodeControl?.setErrors(null);
                permissionNumberControl?.setErrors(null);

                // If both imCode and permissionNumber are empty, skip validation
                if (!(imCode || permissionNumber)) {
                    return;
                }

                // Validation: Error if imCode is empty but permissionNumber is filled
                const imCodeWithoutPermissionNumberError = BaseValidators.EiuEvuWithoutPermissionNumber(imCode, permissionNumber);
                if (imCodeWithoutPermissionNumberError) {
                    imCodeControl?.setErrors({ hasImCodeWithoutPermissionNumber: true });
                    isValid = false;
                    imCodeControl?.markAsTouched(); // Markiere das Feld als touched
                }

                // Validation: Errors if permissionNumber is empty but imCode is filled
                const permissionNumberWithoutEiuEvuError = BaseValidators.PermissionNumberWithoutEiuEvu(imCode, permissionNumber);
                if (permissionNumberWithoutEiuEvuError) {
                    permissionNumberControl?.setErrors({ hasPermissionNumberWithoutImCode: true });
                    isValid = false;
                    permissionNumberControl?.markAsTouched();
                }
            });

            return isValid ? null : errors;
        }
    }
}