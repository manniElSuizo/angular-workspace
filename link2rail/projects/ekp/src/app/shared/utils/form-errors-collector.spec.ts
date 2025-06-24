import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {collectFormErrorsWithNames} from './form-errors-collector';

describe('collectFormErrorsWithNames', () => {
    it('should return null for a control with no errors', () => {
        const control = new FormControl();
        expect(collectFormErrorsWithNames(control)).toBeNull();
    });

    it('should collect errors from a FormControl', () => {
        const control = new FormControl('', {validators: () => ({required: true})});
        control.markAsTouched();
        expect(collectFormErrorsWithNames(control)).toEqual({required: true});
    });

    it('should collect errors from a FormGroup', () => {
        const formGroup = new FormGroup({
            name: new FormControl('', {validators: () => ({required: true})}),
            age: new FormControl('', {validators: () => ({min: 18})})
        });
        formGroup.get('name').markAsTouched();
        formGroup.get('age').markAsTouched();
        expect(collectFormErrorsWithNames(formGroup)).toEqual({
            name: {required: true},
            age: {min: 18}
        });
    });

    it('should collect errors from a FormArray', () => {
        const formArray = new FormArray([
            new FormControl('', {validators: () => ({required: true})}),
            new FormControl('', {validators: () => ({min: 18})})
        ]);
        formArray.at(0).markAsTouched();
        formArray.at(1).markAsTouched();
        expect(collectFormErrorsWithNames(formArray)).toEqual({
            '[0]': {required: true},
            '[1]': {min: 18}
        });
    });

    it('should return null for a FormGroup with no errors', () => {
        const formGroup = new FormGroup({
            name: new FormControl('John'),
            age: new FormControl(25)
        });
        expect(collectFormErrorsWithNames(formGroup)).toBeNull();
    });

    it('should return null for a null control', () => {
        expect(collectFormErrorsWithNames(null)).toBeNull();
    });

    it('should return null for an undefined control', () => {
        expect(collectFormErrorsWithNames(undefined)).toBeNull();
    });
});