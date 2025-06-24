import {CommonMappingService} from "../../common/services/common-mapping.service";
import {OrderInquiryMappingService} from "./order-inquiry-mapping.service";
import {TestBed} from "@angular/core/testing";
import {OrderInquiryView} from "../models/order-inquiry-view";
import {OrderDemandTypeView} from "../models/order-demand-type-view";

import {DemandView} from "../../template/models/template-demand-view";
import {OrderCreationRequest} from "../../api/generated/model/order-creation-request";
import {OrderModificationRequest} from "../../api/generated/model/order-modification-request";

describe('OrderInquiryMappingService', () => {
    let service: OrderInquiryMappingService;
    let commonMappingService: jasmine.SpyObj<CommonMappingService>;

    beforeEach(() => {
        const commonMappingSpy = jasmine.createSpyObj('CommonMappingService', [
            'toApiDemandLocation',
            'toApiDemandWagonType',
            'toApiNHM',
            'toApiCommercialLocation',
            'toApiTransitRailwayUndertaking'
        ]);

        TestBed.configureTestingModule({
            providers: [
                OrderInquiryMappingService,
                {provide: CommonMappingService, useValue: commonMappingSpy}
            ]
        });

        service = TestBed.inject(OrderInquiryMappingService);
        commonMappingService = TestBed.inject(CommonMappingService) as jasmine.SpyObj<CommonMappingService>;
    });

    it('should map OrderInquiryView to OrderCreationRequest', () => {
        const inquiryView: OrderInquiryView = {
            templateName: 'Test Template',
            orderer: {} as any,
            demand: [{
                demandLocation: {} as any,
                demandDateTimes: [{
                    deliveryDateTime: new Date(),
                    demands: [{
                                  numberOfWagonsOrdered: 5
                              } as OrderDemandTypeView]
                }]
            }]
        };

        const result: OrderCreationRequest = service.mapToApiOrderCreationRequest(inquiryView);

        expect(result.templateName).toBe('Test Template');
        expect(result.demands.length).toBe(1);
        expect(commonMappingService.toApiDemandLocation).toHaveBeenCalled();
    });

    it('should map OrderInquiryView to OrderModificationRequest', () => {
        const inquiryView: OrderInquiryView = {
            templateName: 'Test Template',
            orderer: {} as any,
            demand: [{
                demandLocation: {} as any,
                demandDateTimes: [{
                    deliveryDateTime: new Date(),
                    demands: [{

                                  numberOfWagonsOrdered: 5
                              } as OrderDemandTypeView]
                }]
            }]
        };

        const result: OrderModificationRequest | null = service.mapToApiOrderModificationRequest(inquiryView.demand[0]);

        expect(result).not.toBeNull();
        expect(result?.numberOfWagons).toBe(5);
    });

    it('should return null for OrderModificationRequest if no demands', () => {
        const dateNow = new Date();
        const demand: DemandView = {
            demandLocation: {
                commercialLocation: {
                    number: "1234", countryCodeUic: "80",
                    owner: "2180"
                }
            },
            demandDateTimes: [
                {
                    deliveryDateTime: dateNow,
                    demands: [
                        {
                            numberOfWagonsOrdered: 5,
                            demandWagonType: {
                                number: "12345",
                                code: "2180",
                                name: "test"
                            }
                        }
                    ]
                }
            ]

        };

        const result: OrderModificationRequest | null = service.mapToApiOrderModificationRequest(demand);
        const expected: OrderModificationRequest = {
            demandDateTime: dateNow.toISOString(),
            numberOfWagons: 5,
            customerReference: undefined,
            commentCustomer: undefined,
            nhm: undefined,
            loadRunLocation: undefined,
            transitRailwayUndertaking: undefined
        };
        expect(result).toEqual(expected);
    });
});