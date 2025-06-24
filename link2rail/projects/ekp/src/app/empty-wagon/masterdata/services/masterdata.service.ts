import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {DemandDateTimesRequestView} from '../models/demand-date-times-request-view';

import {DemandDateTimesRequestMappingService} from './demand-date-times-request-mapping.service';
import {LatestCustomerOrderDateTimeRequestView} from "../models/latest-customer-order-date-time-request-view";
import {
    MasterdataDateForCommercialLocationRequestView
} from "../models/masterdata-date-for-commercial-location-request-view";
import {
    EmptyWagonOrderInternalMasterdataService
} from "../../api/generated/api/empty-wagon-order-internal-masterdata.service";
import {DemandDateTimesResponse} from "../../api/generated/model/demand-date-times-response";

@Injectable({
    providedIn: 'root'
})
export class MasterdataService {

    constructor(
        private apiService: EmptyWagonOrderInternalMasterdataService,
        private mapper: DemandDateTimesRequestMappingService
    ) {}

    searchMasterDataDemandDateTimes(request: DemandDateTimesRequestView): Observable<string[]> {
        const apiRequest = this.mapper.demandDateTimesRequestToApi(request);

        return this.apiService.searchMasterDataDemandDateTimes(apiRequest).pipe(
            map((response: DemandDateTimesResponse) => this.formatToLocalTime(response.demandDateTimes || []))
        );
    }

    getLatestCustomerOrderTime(request: LatestCustomerOrderDateTimeRequestView): Observable<Date> {
        const apiRequest = this.mapper.latestCustomerOrderDateTimeRequestToApi(request);

        return this.apiService.getLatestCustomerOrderTime(apiRequest).pipe(
            map((response: string) => new Date(response))
        );
    }

    getNextWorkingDay(request: MasterdataDateForCommercialLocationRequestView): Observable<string> {
        const apiRequest = this.mapper.masterdataDateForCommercialLocationRequestToApi(request);

        return this.apiService.getNextWorkingDay(apiRequest).pipe(
            map((response: string) => response)
        );
    }

    getPreviousWorkingDay(request: MasterdataDateForCommercialLocationRequestView): Observable<string> {
        const apiRequest = this.mapper.masterdataDateForCommercialLocationRequestToApi(request);
        return this.apiService.getPreviousWorkingDay(apiRequest).pipe(
            map((response: string) => response)
        );
    }

    isWorkingDay(request: MasterdataDateForCommercialLocationRequestView): Observable<boolean> {
        const apiRequest = this.mapper.masterdataDateForCommercialLocationRequestToApi(request);

        return this.apiService.isWorkingDay(apiRequest).pipe(
            map((response: boolean) => response)
        );
    }

    /**
     * Converts an array of ISO date strings to local time strings in HH:MM format,
     * removes duplicates, and sorts them in ascending order.
     * @param isoDates - Array of ISO date strings.
     * @returns Array of unique, sorted local time strings in HH:MM format.
     */
    private formatToLocalTime(isoDates: string[]): string[] {
        const localTimes = isoDates.map(isoDate => {
            const date = new Date(isoDate);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        });

        // Remove duplicates and sort
        return Array.from(new Set(localTimes)).sort((a, b) => a.localeCompare(b));
    }
}