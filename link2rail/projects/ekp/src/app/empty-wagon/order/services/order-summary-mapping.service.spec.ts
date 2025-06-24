import {TestBed} from '@angular/core/testing';

import {OrderSummaryMappingService} from './order-summary-mapping.service';

import {OrderStatusViewEnum} from "../enums/order-status-view.enum";
import {OrderSummaryRequestView} from "../models/order-summary-view";
import {CommonMappingService} from "../../common/services/common-mapping.service";

import {TranslateService} from "@ngx-translate/core";
import {OrderSummaryResponse} from "../../api/generated/model/order-summary-response";

describe('OrderSummaryMapperService', () => {
    let service: OrderSummaryMappingService;

    beforeEach(() => {
        let spyTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
        spyTranslateService.instant.and.returnValue('CREATED');
        TestBed.configureTestingModule({
            providers: [
                CommonMappingService,
                {provide: TranslateService, useValue: spyTranslateService}
            ]
        });
        service = TestBed.inject(OrderSummaryMappingService);
    });

    // Maps OrderSummaryResponse to OrderSummaryResponseView with all properties and nested properties of summary
    it('should map all properties and nested properties of OrderSummaryResponse to OrderSummaryResponseView', () => {
        const input: OrderSummaryResponse = {
            offset: 0,
            limit: 10,
            total: 100,
            summaries: [{
                orderId: '123',
                orderIdConsumer: 'consumer123',
                internalOrderNumber: 'internal123',
                templateName: 'template1',
                orderer: {
                    sgvId: 'sgv1',
                    partnerId: 'partner1'
                },
                shipper: {
                    sgvId: 'sgv2',
                    partnerId: 'partner2'
                },
                demandLocation: {
                    commercialLocation: {
                        name: 'Location',
                        number: '1234',
                        countryCodeUic: 'CH',
                        owner: 'owner'
                    },
                    freightWagonLocation: {
                        number: '5678',
                        satelliteNumber: 'sat1',
                        name: 'Freight Location'
                    }
                },
                demandWagonType: {
                    number: 'wt1',
                    name: 'Wagon Type 1'
                },
                numberOfWagonsOrdered: 5,
                numberOfWagonsDisposed: 3,
                status: 'CREATED',
                origin: 'origin1',
                deliveryDateTime: '2023-01-01T00:00:00Z',
                loadRunLocation: {
                    countryCodeUic: 'DE',
                    number: '7890',
                    owner: 'owner2'
                },
                transitRailwayUndertaking: {
                    companyCode: 'TRU1'
                },
                nhm: {
                    code: 'NHM1'
                },
                commentCustomer: 'Customer comment',
                commentDisponent: 'Disponent comment',
                customerReference: 'custRef1',
                isEditable: true,
                isCancelable: false
            }]
        };

        const result = service.fromApiResponse(input);

        expect(result.offset).toBe(0);
        expect(result.limit).toBe(10);
        expect(result.total).toBe(100);
        expect(result.items).toHaveSize(1);
        let firstItem = result.items[0];
        expect(firstItem.orderId).toBe('123');
        expect(firstItem.orderIdConsumer).toBe('consumer123');
        expect(firstItem.internalOrderNumber).toBe('internal123');
        expect(firstItem.templateName).toBe('template1');
        expect(firstItem.orderer.sgvId).toBe('sgv1');
        expect(firstItem.orderer.partnerId).toBe('partner1');
        expect(firstItem.shipper.sgvId).toBe('sgv2');
        expect(firstItem.shipper.partnerId).toBe('partner2');
        expect(firstItem.demandLocation.name).toBe('Location');
        expect(firstItem.demandLocation.number).toBe('1234');
        expect(firstItem.demandLocation.countryCodeUic).toBe('CH');
        expect(firstItem.freightWagonLocation.number).toBe('5678');
        expect(firstItem.freightWagonLocation.satelliteNumber).toBe('sat1');
        expect(firstItem.freightWagonLocation.name).toBe('Freight Location');
        expect(firstItem.demandWagonType.number).toBe('wt1');
        expect(firstItem.demandWagonType.name).toBe('Wagon Type 1');
        expect(firstItem.numberOfWagonsOrdered).toBe(5);
        expect(firstItem.numberOfWagonsDisposed).toBe(3);
        expect(firstItem.status).toBe(OrderStatusViewEnum.Created);
        expect(firstItem.origin).toBe('origin1');
        expect(firstItem.deliveryDateTime.toISOString()).toBe('2023-01-01T00:00:00.000Z');
        expect(firstItem.loadRunInformation.countryCodeUic).toBe('DE');
        expect(firstItem.loadRunInformation.locationNumber).toBe('7890');
        expect(firstItem.loadRunInformation.transitRailwayUndertakingCode).toBe('TRU1');
        expect(firstItem.loadRunInformation.nhmCode).toBe('NHM1');
        expect(firstItem.commentToCustomerService).toBe('Customer comment');
        expect(firstItem.customerReference).toBe('custRef1');
        expect(firstItem.enableEditButton).toBe(true);
        expect(firstItem.enableCancelButton).toBe(true);
    });

    // Spread operator correctly copies all properties from OrderSummaryRequestView to OrderSummaryRequest
    it('should copy all properties from OrderSummaryRequestView to OrderSummaryRequest when all properties are set', () => {

        const source: OrderSummaryRequestView = {
            templateName: ['template1'],
            demandLocations: [{
                name: 'Location 1',
                owner: '2180',
                number: '123',
                countryCodeUic: 'CH'
            }],
            demandWagonTypes: [{
                code: 'CODE1',
                number: '456',
                name: 'Wagon Type 1'
            }],
            ordererSgvs: [{id: '1', name: 'SGV1'}],
            ordererPartners: [{id: '2', name: 'Partner1'}],
            loadRunCountryCodeIso: ['CH'],
            offset: 0,
            limit: 10,
            sort: '+name',
            deliveryDateTimeFrom: '2023-01-01',
            deliveryDateTimeTo: '2023-12-31',
            origin: ['WEB'],
            status: [OrderStatusViewEnum.Draft],
            reference: 'REF123'
        };

        const result = service.toApiRequest(source);

        expect(result).toEqual(source);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
