import {AbstractControl, FormArray, FormGroup} from "@angular/forms";

export function collectFormErrorsWithNames(control: AbstractControl, path: string = ''): { [key: string]: any } | null {
    if (!control) {
        return null;
    }

    let errors: { [key: string]: any } = {};

    if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(key => {
            const controlPath = path ? `${path}.${key}` : key;
            const controlErrors = collectFormErrorsWithNames(control.get(key), controlPath);
            if (controlErrors) {
                errors[controlPath] = controlErrors;
            }
        });
    } else if (control instanceof FormArray) {
        control.controls.forEach((ctrl, index) => {
            const controlPath = `${path}[${index}]`;
            const controlErrors = collectFormErrorsWithNames(ctrl, controlPath);
            if (controlErrors) {
                errors[controlPath] = controlErrors;
            }
        });
    } else {
        errors = control.errors || null;
    }

    return !!errors && Object.keys(errors)?.length ? errors : null;
}