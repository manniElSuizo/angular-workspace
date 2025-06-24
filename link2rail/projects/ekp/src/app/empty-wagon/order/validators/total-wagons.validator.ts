import {FormArray, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

/**
 * Validator function to calculate the total number of wagons.
 * Ensures that the total number of wagons is valid.
 *
 * @returns ValidatorFn - A function that returns validation errors or null
 */
export function totalWagonsValidator(): ValidatorFn {
    return (formArray: FormArray): ValidationErrors | null => {
        const totalWagons = formArray.controls.reduce((total, formGroup: FormGroup) => {
            const wagonAmount = formGroup.get('wagonAmountControl')?.value;
            return total + (wagonAmount ? wagonAmount : 0);
        }, 0);
        return totalWagons < 1 ? {invalidWagonCount: true} : null;
    };
}