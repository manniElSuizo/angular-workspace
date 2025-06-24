import {FormControl} from '@angular/forms';
import {dateTimeNotBeforeValidator} from './date-time-not-before.validator';
import moment from 'moment';

describe('dateTimeNotBeforeValidator', () => {
    let dateControl: FormControl;
    let timeControl: FormControl;
    const minDateTime = moment().add(1, 'day').set({hour: 10, minute: 0, second: 0}).toDate();

    beforeEach(() => {
        dateControl = new FormControl('');
        timeControl = new FormControl('');
    });

    it('should return null if date and time are valid and not before minDateTime', () => {
        dateControl.setValue(moment().add(2, 'days').format('YYYY-MM-DD'));
        timeControl.setValue('11:00');
        const validator = dateTimeNotBeforeValidator(dateControl, timeControl, minDateTime);
        expect(validator(timeControl)).toBeNull();
    });

    it('should return an error if date and time are before minDateTime', () => {
        dateControl.setValue(moment().format('YYYY-MM-DD'));
        timeControl.setValue('09:00');
        const validator = dateTimeNotBeforeValidator(dateControl, timeControl, minDateTime);
        expect(validator(timeControl)).toEqual({invalid: true});
    });

    it('should return null if date or time is invalid', () => {
        dateControl.setValue(null);
        timeControl.setValue('11:00');
        const validator = dateTimeNotBeforeValidator(dateControl, timeControl, minDateTime);
        expect(validator(timeControl)).toEqual({required: true});
    });

    it('should use default minDateTime if none is provided', () => {
        dateControl.setValue(moment().add(2, 'days').format('YYYY-MM-DD'));
        timeControl.setValue('11:00');
        const validator = dateTimeNotBeforeValidator(dateControl, timeControl);
        expect(validator(timeControl)).toBeNull();
    });

});
