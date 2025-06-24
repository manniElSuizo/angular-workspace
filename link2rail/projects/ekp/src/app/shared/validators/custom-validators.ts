import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function positiveNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return control.value > 0 ? null : {positiveNumber: false}
    }
}

export function naturalNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return !`${control.value}`.match(/^[0-9]*$/) ? {naturalNumberError: true} : null;
    }
}

export function maxDateValidator(maxDate: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.value) {
            return new Date(control.value).getTime() > new Date(maxDate).getTime() ? {maxDateError: true} : null;
        } else {
            return null;
        }
    }
}

export function minDateValidator(today: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.value) {
            return new Date(control.value).getTime() < new Date(today).getTime() ? {minDateError: true} : null;
        } else {
            return null;
        }
    }
}

export function earliestHandoverBeforeLatestHandover(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return dateIsBeforeValidation(control.get("earliestHandover"), control.get("latestHandover"));
    }
}

export function earliestDeliveryBeforeLatestDelivery(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return dateIsBeforeValidation(control.get("earliestDelivery"), control.get("latestDelivery"));
    }
}

export function latestHandoverBeforeEarliestDelivery(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return dateIsBeforeValidation(control.get("handoverGroup")?.get("latestHandover"), control.get("deliveryGroup")?.get("earliestDelivery"));
    }
}

export function validUntilBeforeValidFrom(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return dateIsBeforeValidation(control.get("miscGroup")?.get("validFrom"), control.get("miscGroup")?.get("validUntil"));
    }
}

function dateIsBeforeValidation(c1: AbstractControl | null | undefined, c2: AbstractControl | null | undefined) {
    if (!c1?.value || !c2?.value) {
        return null;
    }

    let early = new Date(c1.value);
    let late = new Date(c2.value);

    return early.getTime() < late.getTime() ? null : {earliestBeforeLatestError: true};
}

