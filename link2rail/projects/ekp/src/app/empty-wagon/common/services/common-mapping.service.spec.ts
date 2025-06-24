import {TestBed} from '@angular/core/testing';
import {CommonMappingService} from './common-mapping.service';
import {
    CommercialLocation,
    DemandLocation,
    DemandWagonType,
    FreightWagonLocation,
    IdNameType
} from "../../api/generated";
import {CommercialLocationView} from "../models/commercial-location-view";
import {DemandWagonTypeView} from "../models/demand-wagon-type-view";
import {IdNameTypeView} from "../models/id-name-type-view";
import {CustomerInformationView} from "../models/customer-information-view";
import {DemandLocationView} from "../models/demand-location-view";
import {FreightWagonLocationView} from "../models/freight-wagon-location-view";
import {NHMView} from "../models/nhm-view";
import {TransitRailwayUndertakingView} from "../models/transit-railway-undertaking-view";
import {CustomerInformation} from "../../api/generated/model/customer-information";
import {NHM} from "../../api/generated/model/nhm";
import {TransitRailwayUndertaking} from "../../api/generated/model/transit-railway-undertaking";
import {TranslateModule, TranslateService} from "@ngx-translate/core";

describe('CommonMappingService', () => {
    let service: CommonMappingService;
    let translateService: TranslateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot({})],

        });
        service = TestBed.inject(CommonMappingService);
        translateService = TestBed.inject(TranslateService);

        // Setze die Standardsprache und die zu verwendende Sprache
        translateService.setDefaultLang('en');
        translateService.use('en');
    });

    it('should map CommercialLocation from API to View', () => {
        const apiData: CommercialLocation = {countryCodeUic: '123', number: '456', owner: 'Owner'};
        const viewData: CommercialLocationView = service.fromApiCommercialLocation(apiData);
        expect(viewData).toEqual(apiData);
    });

    it('should map DemandWagonType from API to View', () => {
        const apiData: DemandWagonType = {code: '001', number: '123', name: 'Type A'};
        const viewData: DemandWagonTypeView = service.fromApiDemandWagonType(apiData);
        expect(viewData).toEqual(apiData);
    });

    it('should map IdNameType from API to View', () => {
        const apiData: IdNameType = {id: '1', name: 'Name'};
        const viewData: IdNameTypeView = service.fromApiIdNameType(apiData);
        expect(viewData).toEqual(apiData);
    });

    it('should map CustomerInformation from API to View', () => {
        const apiData: CustomerInformation = {sgvId: 'SGV1', partnerId: 'Partner1'};
        const viewData: CustomerInformationView = service.fromApiCustomerInformation(apiData);
        expect(viewData).toEqual(apiData);
    });

    it('should map DemandLocation from API to View', () => {
        const apiData: DemandLocation = {
            commercialLocation: {countryCodeUic: '123', number: '456', owner: 'Owner'},
            freightWagonLocation: {number: '789'}
        };
        const viewData: DemandLocationView = service.fromApiDemandLocation(apiData);
        expect(viewData.commercialLocation).toEqual(apiData.commercialLocation);
        expect(viewData.freightWagonLocation).toEqual(apiData.freightWagonLocation);
    });

    it('should map FreightWagonLocation from API to View', () => {
        const apiData: FreightWagonLocation = {number: '789'};
        const viewData: FreightWagonLocationView = service.fromApiFreightWagonLocation(apiData);
        expect(viewData).toEqual(apiData);
    });

    it('should map NHM from API to View', () => {
        const apiData: NHM = {code: 'NHM1'};
        const viewData: NHMView = service.fromApiNHM(apiData);
        expect(viewData).toEqual(apiData);
    });

    it('should map TransitRailwayUndertaking from API to View', () => {
        const apiData: TransitRailwayUndertaking = {companyCode: 'TRU1'};
        const viewData: TransitRailwayUndertakingView = service.fromApiTransitRailwayUndertaking(apiData);
        expect(viewData).toEqual(apiData);
    });

    it('should map CommercialLocation from View to API', () => {
        const viewData: CommercialLocationView = {countryCodeUic: '123', number: '456', owner: 'Owner'};
        const apiData: CommercialLocation = service.toApiCommercialLocation(viewData);
        expect(apiData).toEqual(viewData);
    });

    it('should map DemandWagonType from View to API', () => {
        const viewData: DemandWagonTypeView = {code: '001', number: '123', name: 'Type A'};
        const apiData: DemandWagonType = service.toApiDemandWagonType(viewData);
        expect(apiData).toEqual(viewData);
    });

    it('should map IdNameType from View to API', () => {
        const viewData: IdNameTypeView = {id: '1', name: 'Name'};
        const apiData: IdNameType = service.toApiIdNameType(viewData);
        expect(apiData).toEqual(viewData);
    });

    it('should map CustomerInformation from View to API', () => {
        const viewData: CustomerInformationView = {sgvId: 'SGV1', partnerId: 'Partner1'};
        const apiData: CustomerInformation = service.toApiCustomerInformation(viewData);
        expect(apiData).toEqual(viewData);
    });

    it('should map DemandLocation from View to API', () => {
        const viewData: DemandLocationView = {
            commercialLocation: {countryCodeUic: '123', number: '456', owner: 'Owner'},
            freightWagonLocation: {number: '789'}
        };
        const apiData: DemandLocation = service.toApiDemandLocation(viewData);
        expect(apiData.commercialLocation).toEqual(viewData.commercialLocation);
        expect(apiData.freightWagonLocation).toEqual(viewData.freightWagonLocation);
    });

    it('should map FreightWagonLocation from View to API', () => {
        const viewData: FreightWagonLocationView = {number: '789'};
        const apiData: FreightWagonLocation = service.toApiFreightWagonLocation(viewData);
        expect(apiData).toEqual(viewData);
    });

    it('should map NHM from View to API', () => {
        const viewData: NHMView = {code: 'NHM1'};
        const apiData: NHM = service.toApiNHM(viewData);
        expect(apiData).toEqual(viewData);
    });

    it('should map TransitRailwayUndertaking from View to API', () => {
        const viewData: TransitRailwayUndertakingView = {companyCode: 'TRU1'};
        const apiData: TransitRailwayUndertaking = service.toApiTransitRailwayUndertaking(viewData);
        expect(apiData).toEqual(viewData);
    });

    it('should translate status correctly', () => {
        const status = 'CREATED';
        const expectedTranslation = 'ewd.shared.status.created';

        const result = service.fromApiStatus(status);

        expect(result).toBe(expectedTranslation);
    });
});