import {Injectable} from '@angular/core';

import {DemandDateTimesRequestView} from "../models/demand-date-times-request-view";
import {CommonMappingService} from "../../common/services/common-mapping.service";
import {LatestCustomerOrderDateTimeRequestView} from "../models/latest-customer-order-date-time-request-view";
import {
    MasterdataDateForCommercialLocationRequestView
} from "../models/masterdata-date-for-commercial-location-request-view";
import {formatDate} from "@angular/common";
import {DemandDateTimesRequest} from "../../api/generated/model/demand-date-times-request";
import {LatestCustomerOrderDateTimeRequest} from "../../api/generated/model/latest-customer-order-date-time-request";
import {
    MasterdataDateForCommercialLocationRequest
} from "../../api/generated/model/masterdata-date-for-commercial-location-request";

@Injectable({
    providedIn: 'root'
})
export class DemandDateTimesRequestMappingService {
    constructor(private commonMappingService: CommonMappingService) {}

    public demandDateTimesRequestToApi(source: DemandDateTimesRequestView): DemandDateTimesRequest {
        const {demandLocation, demandDate} = source;
        if (!demandDate) throw new Error("demandDate is missing");

        const dateFrom = new Date(`${formatDate(demandDate, 'yyyy-MM-dd', 'en')}T00:00`);

        const oneDayInMilliseconds = 24 * 60000 * 60 - 1;
        const deliveryDateTimeTo = new Date(dateFrom.getTime() + oneDayInMilliseconds);

        return {
            deliveryDateTimeFrom: dateFrom.toISOString(),
            deliveryDateTimeTo: deliveryDateTimeTo.toISOString(),
            demandLocation: this.commonMappingService.toApiDemandLocation(demandLocation)
        };
    }

    public latestCustomerOrderDateTimeRequestToApi(source: LatestCustomerOrderDateTimeRequestView): LatestCustomerOrderDateTimeRequest {
        const {demandLocation, deliveryDateTime} = source;
        if (!deliveryDateTime) throw new Error("deliveryDateTime is missing");

        return {
            deliveryDateTime: deliveryDateTime.toISOString(),
            demandLocation: this.commonMappingService.toApiDemandLocation(demandLocation)
        };
    }

    public masterdataDateForCommercialLocationRequestToApi(source: MasterdataDateForCommercialLocationRequestView):
        MasterdataDateForCommercialLocationRequest {
        const {commercialLocation, date} = source;
        if (!date) throw new Error("date is missing");

        return {
            date: date.toISOString().substring(0, 10),
            commercialLocation: this.commonMappingService.toApiCommercialLocation(commercialLocation)
        };
    }
}