import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import moment from 'moment';

/**
 * Validator function to check if a given date and time are not before a specified minimum date and time.
 * @param dateControl - The form control containing the date to be validated.
 * @param timeControl - The form control containing the time to be validated.
 * @param minDateTime - The minimum date and time allowed. Defaults to current date + 1 day at 10:00 local time.
 * @returns A ValidatorFn that returns a validation error if the date is before the minimum date, otherwise null.
 */
export function dateTimeNotBeforeValidator(
    dateControl: AbstractControl,
    timeControl: AbstractControl,
    minDateTime: Date = getDefaultMinDateTime()
): ValidatorFn {
    return (timeControl): ValidationErrors | null => {

        const date = dateControl?.value;
        const time = timeControl?.value?.replaceAll(/\D/g, '');
        if (!isValidDateAndTime(date, time)) return {required: true};

        const combinedDateTime = combineDateAndTime(date, time);
        return isBeforeMinDateTime(combinedDateTime, minDateTime) ? {invalid: true} : null;
    };
}

function isValidDateAndTime(date: any, time: string): boolean {
    return date && time && time.length === 4 && !isNaN(new Date(date).getTime());
}

function combineDateAndTime(date: string, time: string): moment.Moment {
    const validDate = new Date(date);
    const parsedTime = moment(time, 'HH:mm');
    return moment(validDate).set({
        hour: parsedTime.get('hour'),
        minute: parsedTime.get('minute'),
    });
}

function isBeforeMinDateTime(combinedDateTime: moment.Moment, minDateTime: Date): boolean {
    return combinedDateTime.isBefore(moment(minDateTime));
}

/**
 * Helper function to get the default minimum date and time.
 * @returns A Date object representing the current date + 1 day at 10:00 local time.
 */
function getDefaultMinDateTime(): Date {
    const date = moment().add(1, 'day').set({hour: 10, minute: 0, second: 0});
    return date.toDate();
}
