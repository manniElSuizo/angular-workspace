import { AbstractControl, FormArray, FormGroup, ValidationErrors } from "@angular/forms";

export class GoodsValidators {

    static nhmCodeValidator(group: AbstractControl): ValidationErrors {

        const formArray = group as FormArray
        
        let isValid: boolean = true;
        formArray.controls.forEach((control) => {
            const group = control as FormGroup;
            const mhmCodeControl = group.get('nhmCode')
            const mhmCodeValue = group.get('nhmCode').value
            if (!mhmCodeValue|| mhmCodeValue == '') {
                mhmCodeControl.setErrors([{ invalidMRN: true }])
                isValid = false;
            }
        });
       

        return isValid ? null : { wagonListInvalid: true };
    }
}