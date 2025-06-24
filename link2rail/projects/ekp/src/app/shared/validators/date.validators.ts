import { FormControl, ValidationErrors } from "@angular/forms";

export class DateValidators {
    static dateTimeInPast(formControl: FormControl): ValidationErrors | null {
        if (formControl.value) {
            return new Date(formControl.value).getTime() < new Date().getTime() ? { dateTimeInPast: true } : null;
        } else {
            return null;
        }
    }
}