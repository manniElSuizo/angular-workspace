import {TestBed} from '@angular/core/testing';
import {DemandDateTimesRequestMappingService} from './demand-date-times-request-mapping.service';
import {CommonMappingService} from '../../common/services/common-mapping.service';
import {DemandDateTimesRequestView} from '../models/demand-date-times-request-view';
import {LatestCustomerOrderDateTimeRequestView} from '../models/latest-customer-order-date-time-request-view';
import {
    MasterdataDateForCommercialLocationRequestView
} from '../models/masterdata-date-for-commercial-location-request-view';
import {DemandLocationView} from "../../common/models/demand-location-view";
import {CommercialLocationView} from "../../common/models/commercial-location-view";

describe('DemandDateTimesRequestMappingService', () => {
    let service: DemandDateTimesRequestMappingService;
    let commonMappingService: jasmine.SpyObj<CommonMappingService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('CommonMappingService', ['toApiDemandLocation', 'toApiCommercialLocation']);

        TestBed.configureTestingModule({
            providers: [
                DemandDateTimesRequestMappingService,
                {provide: CommonMappingService, useValue: spy}
            ]
        });

        service = TestBed.inject(DemandDateTimesRequestMappingService);
        commonMappingService = TestBed.inject(CommonMappingService) as jasmine.SpyObj<CommonMappingService>;
    });

    it('should map DemandDateTimesRequestView to DemandDateTimesRequest', () => {
        const demandDate = new Date();
        const commercialLocation = {number: "12345", countryCodeIso: "80", owner: "2180"} as CommercialLocationView;
        const demandLocation: DemandLocationView = {commercialLocation};
        const source: DemandDateTimesRequestView = {demandDate, demandLocation};

        commonMappingService.toApiDemandLocation.and.returnValue(demandLocation);

        const result = service.demandDateTimesRequestToApi(source);

        expect(result.deliveryDateTimeFrom)
            .toBe(new Date(demandDate.getFullYear(), demandDate.getMonth(), demandDate.getDate(), 0, 0, 0, 0).toISOString());
        expect(result.deliveryDateTimeTo)
            .toBe(new Date(demandDate.getFullYear(), demandDate.getMonth(), demandDate.getDate(), 23, 59, 59, 999).toISOString());
        expect(result.demandLocation).toBe(demandLocation);
    });

    it('should throw an error if demandDate is missing in DemandDateTimesRequestView', () => {
        const source: DemandDateTimesRequestView = {demandDate: null, demandLocation: {} as any};

        expect(() => service.demandDateTimesRequestToApi(source)).toThrowError("demandDate is missing");
    });

    it('should map LatestCustomerOrderDateTimeRequestView to LatestCustomerOrderDateTimeRequest', () => {
        const deliveryDateTime = new Date();
        const commercialLocation = {number: "12345", countryCodeIso: "80", owner: "2180"} as CommercialLocationView;
        const demandLocation: DemandLocationView = {commercialLocation};
        const source: LatestCustomerOrderDateTimeRequestView = {deliveryDateTime, demandLocation};

        commonMappingService.toApiDemandLocation.and.returnValue(demandLocation);

        const result = service.latestCustomerOrderDateTimeRequestToApi(source);

        expect(result.deliveryDateTime).toBe(deliveryDateTime.toISOString());
        expect(result.demandLocation).toBe(demandLocation);
    });

    it('should throw an error if deliveryDateTime is missing in LatestCustomerOrderDateTimeRequestView', () => {
        const source: LatestCustomerOrderDateTimeRequestView = {deliveryDateTime: null, demandLocation: {} as any};

        expect(() => service.latestCustomerOrderDateTimeRequestToApi(source))
            .toThrowError("deliveryDateTime is missing");
    });

    it('should map MasterdataDateForCommercialLocationRequestView to MasterdataDateForCommercialLocationRequest', () => {
        const date = new Date();
        const commercialLocation = {number: "12345", countryCodeIso: "80", owner: "2180"} as CommercialLocationView;
        const source: MasterdataDateForCommercialLocationRequestView = {date, commercialLocation};

        commonMappingService.toApiCommercialLocation.and.returnValue(commercialLocation);

        const result = service.masterdataDateForCommercialLocationRequestToApi(source);

        expect(result.date).toBe(date.toISOString().substring(0, 10));
        expect(result.commercialLocation).toBe(commercialLocation);
    });

    it('should throw an error if date is missing in MasterdataDateForCommercialLocationRequestView', () => {
        const source: MasterdataDateForCommercialLocationRequestView = {date: null, commercialLocation: {} as any};

        expect(() => service.masterdataDateForCommercialLocationRequestToApi(source)).toThrowError("date is missing");
    });
});