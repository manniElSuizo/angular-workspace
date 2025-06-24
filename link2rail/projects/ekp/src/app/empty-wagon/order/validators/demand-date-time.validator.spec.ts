import {DemandDateTimeValidator} from './demand-date-time.validator';
import {FormControl} from '@angular/forms';
import {MasterdataService} from '../../masterdata/services/masterdata.service';
import {of, throwError} from 'rxjs';

describe('DemandDateTimeValidator', () => {
    let masterDataServiceSpy: jasmine.SpyObj<MasterdataService>;
    let validator: DemandDateTimeValidator;

    beforeEach(() => {
        masterDataServiceSpy = jasmine.createSpyObj('MasterdataService', ['getLatestCustomerOrderTime', 'isWorkingDay']);
        validator = new DemandDateTimeValidator(masterDataServiceSpy);
    });

    describe('lastCustomerOrderDateTime', () => {
        it('should return null if the latest order date time is in the past', async () => {
            const dateControl = new FormControl('2023-10-10');
            const timeControl = new FormControl('12:00');
            const demandLocation = null;

            const date = new Date(new Date().getTime() + 600000);
            masterDataServiceSpy.getLatestCustomerOrderTime.and.returnValue(of(date));

            const validatorFn = validator.lastCustomerOrderDateTime(dateControl, demandLocation);
            const result = await validatorFn(timeControl);

            expect(result).toBeNull();
        });

        it('should return an error if the latest order date time is in the future', async () => {
            const dateControl = new FormControl('2023-10-10');
            const timeControl = new FormControl('12:00');
            const demandLocation = null;

            const latestOrderDate = new Date('2023-10-11T12:00:00');
            masterDataServiceSpy.getLatestCustomerOrderTime.and.returnValue(of(latestOrderDate));

            const validatorFn = validator.lastCustomerOrderDateTime(dateControl, demandLocation);
            const result = await validatorFn(timeControl);

            expect(result).toEqual({expired: latestOrderDate});
        });

        it('should return a server error if the service call fails', async () => {
            const dateControl = new FormControl('2023-10-10');
            const timeControl = new FormControl('12:00');
            const demandLocation = null;

            masterDataServiceSpy.getLatestCustomerOrderTime.and.returnValue(throwError(() => new Error('Service error')));

            const validatorFn = validator.lastCustomerOrderDateTime(dateControl, demandLocation);
            const result = await validatorFn(timeControl);

            expect(result).toEqual({serverError: true});
        });
    });

    describe('isWorkingDayValidator', () => {
        it('should return null if the date is a working day', async () => {
            const dateControl = new FormControl('2023-10-10');
            const commercialLocation = {countryCodeUic: '123', number: '456', owner: 'Owner'};

            masterDataServiceSpy.isWorkingDay.and.returnValue(of(true));

            const validatorFn = validator.isWorkingDayValidator(commercialLocation);
            const result = await validatorFn(dateControl);

            expect(result).toBeNull();
        });

        it('should return an error if the date is not a working day', async () => {
            const dateControl = new FormControl('2023-10-10');
            const commercialLocation = {countryCodeUic: '123', number: '456', owner: 'Owner'};

            masterDataServiceSpy.isWorkingDay.and.returnValue(of(false));

            const validatorFn = validator.isWorkingDayValidator(commercialLocation);
            const result = await validatorFn(dateControl);

            expect(result).toEqual({nonWorkingDay: true});
        });

        it('should return a server error if the service call fails', async () => {
            const dateControl = new FormControl('2023-10-10');
            const commercialLocation = {countryCodeUic: '123', number: '456', owner: 'Owner'};

            masterDataServiceSpy.isWorkingDay.and.returnValue(throwError(() => new Error('Service error')));

            const validatorFn = validator.isWorkingDayValidator(commercialLocation);
            const result = await validatorFn(dateControl);

            expect(result).toEqual({serverError: true});
        });
    });

    describe('isValidDateAndTime', () => {
        it('should return true for valid date and time', () => {
            const date = '2023-10-10';
            const time = '1200';

            const result = validator['isValidDateAndTime'](date, time);

            expect(result).toBeTrue();
        });

        it('should return false for invalid date or time', () => {
            const date = 'invalid-date';
            const time = '1200';

            const result = validator['isValidDateAndTime'](date, time);

            expect(result).toBeFalse();
        });
    });

    describe('combineDateAndTime', () => {
        it('should combine date and time correctly', () => {
            const date = '2023-10-10';
            const time = '1200';

            const result = validator['combineDateAndTime'](date, time);

            expect(result.format('YYYY-MM-DD HH:mm')).toEqual('2023-10-10 12:00');
        });
    });
});