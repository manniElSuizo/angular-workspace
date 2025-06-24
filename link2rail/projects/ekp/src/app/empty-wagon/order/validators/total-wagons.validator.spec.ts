import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {totalWagonsValidator} from './total-wagons.validator';

describe('totalWagonsValidator', () => {
    it('should return null if total wagons are greater than 0', () => {
        const formArray = new FormArray([
            new FormGroup({
                wagonAmountControl: new FormControl(5)
            }),
            new FormGroup({
                wagonAmountControl: new FormControl(3)
            })
        ]);

        const validator = totalWagonsValidator();
        expect(validator(formArray)).toBeNull();
    });

    it('should return an error if total wagons are 0', () => {
        const formArray = new FormArray([
            new FormGroup({
                wagonAmountControl: new FormControl(0)
            }),
            new FormGroup({
                wagonAmountControl: new FormControl(0)
            })
        ]);

        const validator = totalWagonsValidator();
        expect(validator(formArray)).toEqual({invalidWagonCount: true});
    });

    it('should return an error if total wagons are less than 0', () => {
        const formArray = new FormArray([
            new FormGroup({
                wagonAmountControl: new FormControl(-1)
            }),
            new FormGroup({
                wagonAmountControl: new FormControl(-2)
            })
        ]);

        const validator = totalWagonsValidator();
        expect(validator(formArray)).toEqual({invalidWagonCount: true});
    });
});