import {DemandDateTimesRequestView} from "../models/demand-date-times-request-view";

import {MasterdataService} from "./masterdata.service";
import {TestBed} from "@angular/core/testing";
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {DemandDateTimesRequestMappingService} from "./demand-date-times-request-mapping.service";
import {CommonMappingService} from "../../common/services/common-mapping.service";
import {of} from "rxjs";
import {LatestCustomerOrderDateTimeRequestView} from "../models/latest-customer-order-date-time-request-view";
import {
    MasterdataDateForCommercialLocationRequestView
} from "../models/masterdata-date-for-commercial-location-request-view";
import {DemandDateTimesResponse} from "../../api/generated/model/demand-date-times-response";
import {
    EmptyWagonOrderInternalMasterdataService
} from "../../api/generated/api/empty-wagon-order-internal-masterdata.service";
import createSpyObj = jasmine.createSpyObj;

describe('MasterdataService', () => {
    let service: MasterdataService;
    let apiServiceSpy = createSpyObj(
        ["searchMasterDataDemandDateTimes",
         'getLatestCustomerOrderTime',
         'getNextWorkingDay',
         'getPreviousWorkingDay',
         'isWorkingDay'
        ]);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot({}),
                HttpClientTestingModule
            ],
            providers: [
                MasterdataService,
                DemandDateTimesRequestMappingService,
                CommonMappingService,
                {provide: EmptyWagonOrderInternalMasterdataService, useValue: apiServiceSpy},
            ]
        });

        service = TestBed.inject(MasterdataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call mapper and apiService, and format response correctly', (done: DoneFn) => {
        const requestView: DemandDateTimesRequestView = {
            demandDate: new Date('2024-12-01'),
            demandLocation: {commercialLocation: {countryCodeUic: "80", number: "11111", owner: "2180"}}
        };
        const apiResponse: DemandDateTimesResponse = {demandDateTimes: ['2024-12-01T10:00:00Z', '2024-12-01T12:00:00Z']};

        apiServiceSpy.searchMasterDataDemandDateTimes.and.returnValue(of(apiResponse));

        service.searchMasterDataDemandDateTimes(requestView).subscribe(() => {
            expect(apiServiceSpy.searchMasterDataDemandDateTimes).toHaveBeenCalled();
            done();
        });
    });

    it('should handle empty response gracefully', (done: DoneFn) => {
        const requestView: DemandDateTimesRequestView = {
            demandDate: new Date(),
            demandLocation: {commercialLocation: {countryCodeUic: "80", number: "11111", owner: "2180"}}
        };
        const apiResponse: DemandDateTimesResponse = {demandDateTimes: []};

        apiServiceSpy.searchMasterDataDemandDateTimes.and.returnValue(of(apiResponse));

        service.searchMasterDataDemandDateTimes(requestView).subscribe(result => {
            expect(result).toEqual([]);
            done();
        });
    });

    it('should get latest customer order time', (done) => {
        const request: LatestCustomerOrderDateTimeRequestView = {
            deliveryDateTime: new Date(),
            demandLocation: {} as any
        };
        const apiResponse = '2023-10-10T00:00:00Z';
        apiServiceSpy.getLatestCustomerOrderTime.and.returnValue(of(apiResponse));

        service.getLatestCustomerOrderTime(request).subscribe(response => {
            expect(response).toEqual(new Date(apiResponse));
            done();
        });

        expect(apiServiceSpy.getLatestCustomerOrderTime).toHaveBeenCalled();
    });

    it('should get next working day', (done) => {
        const request: MasterdataDateForCommercialLocationRequestView = {
            date: new Date(),
            commercialLocation: {} as any
        };
        const apiResponse = '2023-10-11T00:00:00Z';
        apiServiceSpy.getNextWorkingDay.and.returnValue(of(apiResponse));

        service.getNextWorkingDay(request).subscribe(response => {
            expect(response).toEqual(apiResponse);
            done();
        });

        expect(apiServiceSpy.getNextWorkingDay).toHaveBeenCalled();
    });

    it('should get previous working day', (done) => {
        const request: MasterdataDateForCommercialLocationRequestView = {
            date: new Date(),
            commercialLocation: {} as any
        };
        const apiResponse = '2023-10-09T00:00:00Z';
        apiServiceSpy.getPreviousWorkingDay.and.returnValue(of(apiResponse));

        service.getPreviousWorkingDay(request).subscribe(response => {
            expect(response).toEqual(apiResponse);
            done();
        });

        expect(apiServiceSpy.getPreviousWorkingDay).toHaveBeenCalled();
    });

    it('should check if a date is a working day', (done) => {
        const request: MasterdataDateForCommercialLocationRequestView = {
            date: new Date(),
            commercialLocation: {} as any
        };
        const apiResponse = true;
        apiServiceSpy.isWorkingDay.and.returnValue(of(apiResponse));

        service.isWorkingDay(request).subscribe(response => {
            expect(response).toBe(apiResponse);
            done();
        });

        expect(apiServiceSpy.isWorkingDay).toHaveBeenCalled();
    });

});