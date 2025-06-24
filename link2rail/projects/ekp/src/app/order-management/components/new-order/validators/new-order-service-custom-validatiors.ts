import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isInterNationalTransport, isNationalTransport } from './new-order-custom-validators';

// Rule 63
export const serviceAuthorityObligatoryValidator: ValidatorFn = (group: FormGroup) => {
    const authorityValueControl = group.get('authority')
    const authorityValue = group.get('authority')?.value ?? null;
    authorityValueControl.setErrors(null)
    const productExtraChargeCodeValue = group.get('productExtraChargeCode')?.value ?? null;
    const locationCodeValue = group.get('locationCode')?.value ?? null;
    const specialTreatmentChargingPrepaymentValue = group.get('specialTreatmentChargingPrepayment')?.value ?? null;
    const infoValue = group.get('info')?.value ?? null;

    // Check if at least one value is set
    const hasAnyValue = [
        authorityValue,
        productExtraChargeCodeValue,
        locationCodeValue,
        specialTreatmentChargingPrepaymentValue,
        infoValue,
    ].some(value => value !== null && value !== '');

    // If none of the values are set, skip validation
    if (!hasAnyValue) {
        return null;
    }

    if (!authorityValue) {
        authorityValueControl.setErrors({ missingServiceAuthority: true })
        return { missingServiceAuthority: true };
    }

    return null; // Validation passed
};
// Rule 64
export const servicelocationCodeObligatoryValidator: ValidatorFn = (group: FormGroup) => {
    const authorityValue = group.get('authority')?.value ?? null;
    const productExtraChargeCodeValue = group.get('productExtraChargeCode')?.value ?? null;
    const locationCodeValueControl = group.get('locationCode')
    locationCodeValueControl.setErrors(null)
    const locationCodeValue = group.get('locationCode')?.value ?? null;
    const specialTreatmentChargingPrepaymentValue = group.get('specialTreatmentChargingPrepayment')?.value ?? null;
    const infoValue = group.get('info')?.value ?? null;

    // Check if at least one value is set
    const hasAnyValue = [
        authorityValue,
        productExtraChargeCodeValue,
        locationCodeValue,
        specialTreatmentChargingPrepaymentValue,
        infoValue,
    ].some(value => value !== null && value !== '');

    // If none of the values are set, skip validation
    if (!hasAnyValue) {
        return null;
    }

    if (!locationCodeValue) {
        locationCodeValueControl.setErrors({ missingServiceLocationCode: true })
        return { missingServiceLocationCode: true };
    }

    return null; // Validation passed
};


export const productExtraChargeCodeObligatoryValidator: ValidatorFn = (group: FormGroup) => {
    const authorityValue = group.get('authority')?.value ?? null;
    const productExtraChargeCodeValue = group.get('productExtraChargeCode')?.value ?? null;
    const productExtraChargeCodeControl = group.get('productExtraChargeCode')
    productExtraChargeCodeControl.setErrors(null)
    const locationCodeValue = group.get('locationCode')?.value ?? null;
    const specialTreatmentChargingPrepaymentValue = group.get('specialTreatmentChargingPrepayment')?.value ?? null;
    const infoValue = group.get('info')?.value ?? null;

    // Check if at least one value is set
    const hasAnyValue = [
        authorityValue,
        locationCodeValue,
        specialTreatmentChargingPrepaymentValue,
        infoValue,
    ].some(value => value !== null && value !== '');

    // If none of the values are set, skip validation
    if (!hasAnyValue) {
        return null;
    }

    if (!productExtraChargeCodeValue) {
        productExtraChargeCodeControl.setErrors({ missingProductExtraChargeCode: true })
        return { missingProductExtraChargeCode: true };
    }

    return null; // Validation passed
};


export const validateServiceSpecificationArray: ValidatorFn = (array: AbstractControl): ValidationErrors | null => {
    const formArray = array as FormArray;

    let hasErrors = false;
    if (Array.isArray(formArray.controls)) {
        formArray.controls.forEach((control, index) => {
            const group = control as FormGroup;

            // Validate using ServiceAuthorityObligatoryValidator
            const authorityError = serviceAuthorityObligatoryValidator(group);
            // Validate using ServicelocationCodeObligatoryValidator
            const locationCodeError = servicelocationCodeObligatoryValidator(group);

            const productExtraChargeCodeError = productExtraChargeCodeObligatoryValidator(group)
            
            if (authorityError || locationCodeError || productExtraChargeCodeError) hasErrors = true

        });
    }
    return hasErrors ? { inValidService: true } : null;
};

// Rule 65 
export const paymentTyeObligatoryForNationalTransportValidator: ValidatorFn = (group: FormGroup) => {

    if (isInterNationalTransport(group)) return null;

    if (isNationalTransport(group)) {
        const serviceSpecification = group.get('service').get('serviceSpecification') as FormArray
        var isValid: boolean = true;
        serviceSpecification.controls.forEach(item => {
            const productExtraChargeCodeValue = item.get('productExtraChargeCode')?.value ?? null
            const specialTreatmentChargingPrepaymentControl = item.get('specialTreatmentChargingPrepayment')
            specialTreatmentChargingPrepaymentControl.setErrors(null);
            const specialTreatmentChargingPrepaymentValue = specialTreatmentChargingPrepaymentControl?.value ?? null;
            item.setErrors(null);
            if (!specialTreatmentChargingPrepaymentValue && productExtraChargeCodeValue) {
                specialTreatmentChargingPrepaymentControl.setErrors({ missingPaymentType: true });
                item.setErrors({ missingPaymentType: true });
                isValid = false;
            }

        });
        if (isValid) {
            return null;
        } else {
            return { missingPaymentType: true };
        }
    }

    return null;
}