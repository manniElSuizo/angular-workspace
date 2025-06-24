import {TestBed} from '@angular/core/testing';
import {TemplateMappingService} from './template-mapping.service';
import {CommonMappingService} from '../../common/services/common-mapping.service';
import {Template} from '../../api/generated/model/template';
import {OrderInquiryView} from '../../order/models/order-inquiry-view';
import {CustomerInformationView} from '../../common/models/customer-information-view';
import {DemandLocationView} from '../../common/models/demand-location-view';
import {DemandWagonTypeView} from '../../common/models/demand-wagon-type-view';
import {NHMView} from '../../common/models/nhm-view';
import {CommercialLocationView} from '../../common/models/commercial-location-view';
import {TransitRailwayUndertakingView} from '../../common/models/transit-railway-undertaking-view';

describe('TemplateMappingService', () => {
    let service: TemplateMappingService;
    let commonMappingServiceSpy: jasmine.SpyObj<CommonMappingService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('CommonMappingService', [
            'fromApiCustomerInformation',
            'fromApiDemandLocation',
            'fromApiDemandWagonType',
            'fromApiNHM',
            'fromApiCommercialLocation',
            'fromApiTransitRailwayUndertaking'
        ]);

        TestBed.configureTestingModule({
            providers: [
                TemplateMappingService,
                {provide: CommonMappingService, useValue: spy}
            ]
        });

        service = TestBed.inject(TemplateMappingService);
        commonMappingServiceSpy = TestBed.inject(CommonMappingService) as jasmine.SpyObj<CommonMappingService>;
    });

    it('should map Template to OrderInquiryView', () => {
        const template: Template = {
            templateName: 'Test Template',
            orderer: {sgvId: 'SGV1', partnerId: 'Partner1'},
            shipper: {sgvId: 'SGV2', partnerId: 'Partner2'},
            demand: [{
                demandLocation: {
                    commercialLocation: {countryCodeUic: '123', number: '456', owner: 'Owner'},
                    freightWagonLocation: {number: '789'}
                },
                demandTypes: [{
                    demandWagonType: {code: '001', number: '123', name: 'Type A'},
                    nhm: {code: 'NHM1'},
                    loadRunLocation: {countryCodeUic: '321', number: '654', owner: 'Owner2'},
                    transitRailwayUndertaking: {companyCode: 'TRU1', companyName: 'TRU Name'}
                }]
            }]
        };

        const mockCustomerInformationView: CustomerInformationView = {sgvId: 'SGV1', partnerId: 'Partner1'};
        const mockDemandLocationView: DemandLocationView = {
            commercialLocation: {
                countryCodeUic: '123',
                number: '456',
                owner: 'Owner'
            }, freightWagonLocation: {number: '789'}
        };
        const mockDemandWagonTypeView: DemandWagonTypeView = {code: '001', number: '123', name: 'Type A'};
        const mockNHMView: NHMView = {code: 'NHM1'};
        const mockCommercialLocationView: CommercialLocationView = {
            countryCodeUic: '321',
            number: '654',
            owner: 'Owner2'
        };
        const mockTransitRailwayUndertakingView: TransitRailwayUndertakingView = {
            companyCode: 'TRU1',
            companyName: 'TRU Name'
        };

        commonMappingServiceSpy.fromApiCustomerInformation.and.returnValue(mockCustomerInformationView);
        commonMappingServiceSpy.fromApiDemandLocation.and.returnValue(mockDemandLocationView);
        commonMappingServiceSpy.fromApiDemandWagonType.and.returnValue(mockDemandWagonTypeView);
        commonMappingServiceSpy.fromApiNHM.and.returnValue(mockNHMView);
        commonMappingServiceSpy.fromApiCommercialLocation.and.returnValue(mockCommercialLocationView);
        commonMappingServiceSpy.fromApiTransitRailwayUndertaking.and.returnValue(mockTransitRailwayUndertakingView);

        const result: OrderInquiryView = service.fromApiTemplate(template);

        expect(result.templateName).toEqual(template.templateName);
        expect(commonMappingServiceSpy.fromApiCustomerInformation).toHaveBeenCalledWith(template.orderer);
        expect(commonMappingServiceSpy.fromApiCustomerInformation).toHaveBeenCalledWith(template.shipper);
        expect(commonMappingServiceSpy.fromApiDemandLocation).toHaveBeenCalledWith(template.demand[0].demandLocation);
        expect(commonMappingServiceSpy.fromApiDemandWagonType)
            .toHaveBeenCalledWith(template.demand[0].demandTypes[0].demandWagonType);
    });
});