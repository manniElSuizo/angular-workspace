import {AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn} from '@angular/forms';
import moment from 'moment';
import {DemandLocationView} from "../../common/models/demand-location-view";
import {MasterdataService} from "../../masterdata/services/masterdata.service";
import {
    LatestCustomerOrderDateTimeRequestView
} from "../../masterdata/models/latest-customer-order-date-time-request-view";
import {Injectable} from "@angular/core";
import {CommercialLocationView} from "../../common/models/commercial-location-view";
import {
    MasterdataDateForCommercialLocationRequestView
} from "../../masterdata/models/masterdata-date-for-commercial-location-request-view";

@Injectable({
    providedIn: 'root'
})
export class DemandDateTimeValidator {
    constructor(private masterDataService: MasterdataService) {}

    checkMaxDate(maxDate: Date): ValidatorFn {
        return (control: AbstractControl) => {
            if (!maxDate || !control.value) return null;
            if (new Date(control.value).getTime() > maxDate.getTime()) return {isMaxDateExceeded: true};
            return null;
        }
    }

    checkMinDate(minDate: Date): ValidatorFn {
        return (control: AbstractControl) => {
            if (!minDate || !control.value) return null;
            if (new Date(control.value).getTime() < minDate.getTime()) return {isMinDateNotMet: true};
            return null;
        }
    }

    lastCustomerOrderDateTime(
        dateControl: AbstractControl,
        demandLocation: DemandLocationView | null
    ): AsyncValidatorFn {
        return async (timeControl: AbstractControl): Promise<ValidationErrors | null> => {
            const date = dateControl?.value;
            const time = timeControl?.value?.replaceAll(/\D/g, '');
            if (!this.isValidDateAndTime(date, time)) return Promise.resolve({invalide: {date, time}});

            const demandDate = this.combineDateAndTime(dateControl.value, timeControl.value).toDate();
            if (!demandDate) return Promise.resolve({demandDate});

            const request = {
                deliveryDateTime: demandDate,
                demandLocation: demandLocation,
            } as LatestCustomerOrderDateTimeRequestView;

            try {
                const latestOrderDateTime = await this.getLatestCustomerOrderTimeAsPromise(request);
                const currentDate = new Date();
                return latestOrderDateTime.getTime() < currentDate.getTime() ? {expired: latestOrderDateTime} : null;
            } catch (error) {
                console.error('Error fetching latest order date time:', error);
                return {serverError: true};
            }
        };
    }

    isWorkingDayValidator(commercialLocation: CommercialLocationView): AsyncValidatorFn {
        return async (control: AbstractControl): Promise<ValidationErrors | null> => {
            const date = control?.value;
            if (!date || isNaN(new Date(date).getTime())) {
                return Promise.resolve({invalide: true});
            }
            const request = {
                date: new Date(date),
                commercialLocation
            } as MasterdataDateForCommercialLocationRequestView;

            try {
                const isWorkingDay = await this.isWorkingDayAsPromise(request);
                return isWorkingDay ? null : {nonWorkingDay: true};
            } catch (error) {
                console.error('Error checking if date is a working day:', error);
                return {serverError: true};
            }
        };
    }

    private getLatestCustomerOrderTimeAsPromise(request: LatestCustomerOrderDateTimeRequestView): Promise<Date> {
        return new Promise((resolve, reject) => {
            this.masterDataService.getLatestCustomerOrderTime(request).subscribe({
                next: (result) => {
                    resolve(result);
                },
                error: (err) => {
                    reject(err);
                }
            });
        });
    }

    public isWorkingDayAsPromise(request: MasterdataDateForCommercialLocationRequestView): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.masterDataService.isWorkingDay(request).subscribe({
                next: (result) => {
                    resolve(result);
                },
                error: (err) => {
                    reject(err);
                }
            });
        });
    }

    private isValidDateAndTime(date: any, time: string): boolean {
        return date && time && time.length === 4 && !isNaN(new Date(date).getTime());
    }

    private combineDateAndTime(date: string, time: string): moment.Moment {
        const validDate = new Date(date);
        const parsedTime = moment(time, 'HH:mm');
        return moment(validDate).set({
            hour: parsedTime.get('hour'),
            minute: parsedTime.get('minute'),
        });
    }
}
