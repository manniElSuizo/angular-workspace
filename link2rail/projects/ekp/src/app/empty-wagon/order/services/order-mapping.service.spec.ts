import {TestBed} from '@angular/core/testing';
import {OrderMappingService} from './order-mapping.service';
import {CommonMappingService} from '../../common/services/common-mapping.service';

import {OrderStatusHistoryView, OrderView} from '../models/order-view';
import {OrderStatusViewEnum} from '../enums/order-status-view.enum';
import {Order} from "../../api/generated/model/order";

describe('OrderMappingService', () => {
    let service: OrderMappingService;
    let commonMappingService: jasmine.SpyObj<CommonMappingService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('CommonMappingService', [
            'fromApiCustomerInformation',
            'fromApiDemandLocation',
            'fromApiDemandWagonType',
            'fromApiCommercialLocation',
            'fromApiTransitRailwayUndertaking',
            'fromApiNHM',
            'fromApiStatus'
        ]);

        TestBed.configureTestingModule({
            providers: [
                OrderMappingService,
                {provide: CommonMappingService, useValue: spy}
            ]
        });

        service = TestBed.inject(OrderMappingService);
        commonMappingService = TestBed.inject(CommonMappingService) as jasmine.SpyObj<CommonMappingService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should map Order to OrderView correctly', () => {
        const order: Order = {
            orderId: '123',
            orderIdConsumer: '456',
            internalOrderNumber: '789',
            templateName: 'Template1',
            orderer: {sgvId: 'SGV1', partnerId: 'Partner1'},
            shipper: {sgvId: 'SGV1', partnerId: 'Partner1'},
            demandLocation: {
                commercialLocation: {countryCodeUic: '123', number: '456', owner: 'Owner'},
                freightWagonLocation: {number: '789'}
            },
            demandWagonType: {code: '001', number: '123', name: 'Type A'},
            numberOfWagonsOrdered: 10,
            numberOfWagonsDisposed: 5,
            status: 'CREATED',
            origin: 'Origin1',
            deliveryDateTime: '2023-10-01T10:00:00Z',
            loadRunLocation: {countryCodeUic: '321', number: '654', owner: 'Owner2'},
            transitRailwayUndertaking: {companyCode: 'TRU1', companyName: 'TRU Name'},
            nhm: {code: 'NHM1'},
            commentCustomer: 'Customer comment',
            commentDisponent: 'Disponent comment',
            customerReference: 'Ref123'
        };

        commonMappingService.fromApiCustomerInformation.and.returnValue({sgvId: 'SGV1', partnerId: 'Partner1'});
        commonMappingService.fromApiDemandLocation.and.returnValue({
            commercialLocation: {countryCodeUic: '123', number: '456', owner: 'Owner'},
            freightWagonLocation: {number: '789'}
        });
        commonMappingService.fromApiDemandWagonType.and.returnValue({code: '001', number: '123', name: 'Type A'});
        commonMappingService.fromApiCommercialLocation.and.returnValue({
            countryCodeUic: '321', number: '654', owner: 'Owner2'
        });
        commonMappingService.fromApiTransitRailwayUndertaking.and.returnValue({
            companyCode: 'TRU1', companyName: 'TRU Name'
        });
        commonMappingService.fromApiNHM.and.returnValue({code: 'NHM1'});
        commonMappingService.fromApiStatus.and.returnValue(OrderStatusViewEnum['CREATED']); // Mock the fromApiStatus
                                                                                            // method

        const orderView: OrderView = service.fromApiOrder(order);

        expect(orderView.orderId).toBe(order.orderId);
        expect(orderView.orderIdConsumer).toBe(order.orderIdConsumer);
        expect(orderView.internalOrderNumber).toBe(order.internalOrderNumber);
        expect(orderView.templateName).toBe(order.templateName);
        expect(orderView.orderer.sgvId).toBe(order.orderer.sgvId);
        expect(orderView.shipper?.sgvId).toBe(order.shipper?.sgvId);
        expect(orderView.status).toBe(OrderStatusViewEnum[order.status]);
        expect(orderView.origin).toBe(order.origin);
    });

    it('should map API order status history to OrderStatusHistoryView', () => {
        const mockOrder: Order = {
            orderId: '123',
            orderIdConsumer: '456',
            internalOrderNumber: '789',
            templateName: 'Template1',
            orderer: {sgvId: 'SGV1', partnerId: 'Partner1'},
            shipper: {sgvId: 'SGV1', partnerId: 'Partner1'},
            demandLocation: {
                commercialLocation: {countryCodeUic: '123', number: '456', owner: 'Owner'},
                freightWagonLocation: {number: '789'}
            },
            demandWagonType: {code: '001', number: '123', name: 'Type A'},
            numberOfWagonsOrdered: 10,
            numberOfWagonsDisposed: 5,
            status: 'CREATED',
            origin: 'Origin1',
            deliveryDateTime: '2023-10-01T10:00:00Z',
            loadRunLocation: {countryCodeUic: '321', number: '654', owner: 'Owner2'},
            transitRailwayUndertaking: {companyCode: 'TRU1', companyName: 'TRU Name'},
            nhm: {code: 'NHM1'},
            commentCustomer: 'Customer comment',
            commentDisponent: 'Disponent comment',
            customerReference: 'Ref123',
            statusHistory: [
                {status: 'DISPATCHED', dateTime: '2023-10-02T12:00:00Z'},
                {status: 'CREATED', dateTime: '2023-10-01T10:00:00Z'},
            ]
        } as Order;

        const expected: OrderStatusHistoryView = {
            orderIdConsumer: '456',
            history: [
                {status: OrderStatusViewEnum['DISPATCHED'], dateTime: new Date('2023-10-02T12:00:00Z')},
                {status: OrderStatusViewEnum['CREATED'], dateTime: new Date('2023-10-01T10:00:00Z')}
            ]
        };

        const result = service.fromApiStatusHistory(mockOrder);
        expect(result).toEqual(expected);
    });
});