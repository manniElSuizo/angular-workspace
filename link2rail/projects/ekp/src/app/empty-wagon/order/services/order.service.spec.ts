import {TestBed} from '@angular/core/testing';

import {OrderService} from './order.service';
import {OrderSummaryRequestView, OrderSummaryResponseView} from "../models/order-summary-view";

import {of} from "rxjs";
import {OrderSummaryMappingService} from "./order-summary-mapping.service";

import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";
import {OrderInquiryView} from "../models/order-inquiry-view";
import {EmptyWagonOrderService} from "../../api/generated/api/empty-wagon-order.service";
import {OrderSummaryRequest} from "../../api/generated/model/order-summary-request";
import {OrderSummaryResponse} from "../../api/generated/model/order-summary-response";
import {Order} from "../../api/generated/model/order";
import {OrderModificationRequest} from "../../api/generated/model/order-modification-request";
import {Status} from "../../api/generated/model/status";
import {OrderModificationResponse} from "../../api/generated/model/order-modification-response";
import createSpyObj = jasmine.createSpyObj;

describe('OrderService', () => {
    let service: OrderService;
    let spyApiService = createSpyObj([
        "searchEmptyWagonOrders",
        "getEmptyWagonOrderByOrderIdConsumer",
        "modifyEmptyWagonOrder",
        "createEmptyWagonOrder",
    ]);
    let spyMapper = createSpyObj(["toApiRequest", "fromApiResponse", "fromApiStatusHistory"]);
    let orderInquiryMapperSpy = createSpyObj(["mapToApiOrderModificationRequest", "mapToApiOrderCreationRequest"]);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot({}),
                HttpClientTestingModule
            ],
            providers: [OrderService,
                {provide: EmptyWagonOrderService, useValue: spyApiService},
                {provide: OrderSummaryMappingService, useValue: spyMapper},
            ]
        });
        service = TestBed.inject(OrderService);

    });

    describe('searchOrders', function () {

        it('should map request and return mapped response when valid request provided', () => {
            const requestView: OrderSummaryRequestView = {
                offset: 0,
                limit: 10,
                templateName: ['template1'],
                status: ['CREATED']
            };

            const mappedRequest: OrderSummaryRequest = {
                offset: 0,
                limit: 10,
                templateName: ['template1'],
                status: ['CREATED']
            };

            const apiResponse: OrderSummaryResponse = {
                offset: 0,
                limit: 10,
                total: 1,
                summaries: []
            };

            const expectedResponse: OrderSummaryResponseView = {
                offset: 0,
                limit: 10,
                total: 1,
                items: []
            };

            spyMapper.toApiRequest.and.returnValue(mappedRequest);
            spyApiService.searchEmptyWagonOrders.and.returnValue(of(apiResponse));
            spyMapper.fromApiResponse.and.returnValue(expectedResponse);

            service.searchOrders(requestView).subscribe(result => {
                expect(spyMapper.toApiRequest).toHaveBeenCalledWith(requestView);
                expect(spyApiService.searchEmptyWagonOrders).toHaveBeenCalledWith(mappedRequest);
                expect(spyMapper.fromApiResponse).toHaveBeenCalledWith(apiResponse);
                expect(result).toEqual(expectedResponse);
            });
        });

        // Handles null/undefined request parameters
        it('should handle undefined request by passing empty request to service', () => {
            const undefinedRequest: OrderSummaryRequestView = undefined;

            const emptyMappedRequest: OrderSummaryRequest = {limit: 10, offset: 0};

            const apiResponse: OrderSummaryResponse = {
                offset: 0,
                limit: 10,
                total: 0,
                summaries: []
            };

            const expectedResponse: OrderSummaryResponseView = {
                offset: 0,
                limit: 10,
                total: 0,
                items: []
            };

            spyMapper.toApiRequest.and.returnValue(emptyMappedRequest);
            spyApiService.searchEmptyWagonOrders.and.returnValue(of(apiResponse));
            spyMapper.fromApiResponse.and.returnValue(expectedResponse);

            service.searchOrders(undefinedRequest).subscribe(result => {
                expect(spyMapper.toApiRequest).toHaveBeenCalledWith(undefinedRequest);
                expect(spyApiService.searchEmptyWagonOrders).toHaveBeenCalledWith(emptyMappedRequest);
                expect(spyMapper.fromApiResponse).toHaveBeenCalledWith(apiResponse);
                expect(result).toEqual(expectedResponse);
            });
        });

        // Successfully maps OrderSummaryRequestView to OrderSummaryRequest
        it('should map request and return mapped response when valid request provided', () => {
            const requestView: OrderSummaryRequestView = {
                limit: 10,
                offset: 0,
                templateName: ['template1'],
                reference: 'ref123'
            };

            const mappedRequest: OrderSummaryRequest = {
                limit: 10,
                offset: 0,
                templateName: ['template1'],
                reference: 'ref123'
            };

            const apiResponse: OrderSummaryResponse = {
                limit: 10,
                offset: 0,
                total: 1,
                summaries: []
            };

            const expectedResponse: OrderSummaryResponseView = {
                limit: 10,
                offset: 0,
                total: 1,
                items: []
            };

            spyMapper.toApiRequest.and.returnValue(mappedRequest);
            spyApiService.searchEmptyWagonOrders.and.returnValue(of(apiResponse));
            spyMapper.fromApiResponse.and.returnValue(expectedResponse);

            service.searchOrders(requestView).subscribe(result => {
                expect(spyMapper.toApiRequest).toHaveBeenCalledWith(requestView);
                expect(spyApiService.searchEmptyWagonOrders).toHaveBeenCalledWith(mappedRequest);
                expect(spyMapper.fromApiResponse).toHaveBeenCalledWith(apiResponse);
                expect(result).toEqual(expectedResponse);
            });
        });

        // Handles null/undefined request parameters
        it('should handle undefined request parameters by passing empty request', () => {
            const requestView: OrderSummaryRequestView = {
                limit: 10,
                offset: 0
            };

            const mappedRequest: OrderSummaryRequest = {
                limit: 10,
                offset: 0
            };

            const apiResponse: OrderSummaryResponse = {
                limit: 10,
                offset: 0,
                total: 0,
                summaries: []
            };

            const expectedResponse: OrderSummaryResponseView = {
                limit: 10,
                offset: 0,
                total: 0,
                items: []
            };

            spyMapper.toApiRequest.and.returnValue(mappedRequest);
            spyApiService.searchEmptyWagonOrders.and.returnValue(of(apiResponse));
            spyMapper.fromApiResponse.and.returnValue(expectedResponse);

            service.searchOrders(requestView).subscribe(result => {
                expect(spyMapper.toApiRequest).toHaveBeenCalledWith(requestView);
                expect(spyApiService.searchEmptyWagonOrders).toHaveBeenCalledWith(mappedRequest);
                expect(result).toEqual(expectedResponse);
            });
        });
    });

    describe('getOrderStatusHistory', () => {
        it('should get order status history', (done: DoneFn) => {
            const mockOrder: Order = {
                orderId: '123',
                orderIdConsumer: '456',
                statusHistory: [{status: 'CREATED', dateTime: '2023-10-01T10:00:00Z'}]
            } as Order;

            const expectedHistory = {
                orderIdConsumer: '456',
                history: [{status: 'ewd.shared.status.created', dateTime: new Date('2023-10-01T10:00:00Z')}]
            };

            spyApiService.getEmptyWagonOrderByOrderIdConsumer.and.returnValue(of(mockOrder));

            service.getOrderStatusHistory('456').subscribe(history => {
                expect(history).toEqual(expectedHistory);
                done();
            });
        });
    });

    describe('modifyOrder', () => {
        it('should call modifyEmptyWagonOrder with correct parameters', () => {
            const orderIdConsumer = '12345';
            const demandDate = new Date(2025, 1, 1, 12, 0);
            const orderInquiryView: OrderInquiryView = {
                templateName: 'template1',
                orderer: {
                    sgvId: 'sgvId',
                    partnerId: 'partnerId'
                },
                demand: [{
                    demandLocation: {
                        commercialLocation: {
                            countryCodeUic: "80",
                            number: "12345",
                            owner: "2180"
                        }
                    },
                    demandDateTimes: [
                        {
                            deliveryDateTime: demandDate,
                            demands: [
                                {
                                    demandWagonType: {code: "2180", number: "12345"},
                                    numberOfWagonsOrdered: 1,
                                }
                            ]
                        }
                    ]

                }]
            };
            const mockRequest = {
                demandDateTime: demandDate.toISOString(),
                numberOfWagons: 1,
                customerReference: undefined,
                commentCustomer: undefined,
                nhm: null,
                loadRunLocation: null,
                transitRailwayUndertaking: null
            } as OrderModificationRequest;
            const mockResponse: OrderModificationResponse = {orderIdConsumer: '12345', status: Status.Transmitted};

            orderInquiryMapperSpy.mapToApiOrderModificationRequest.and.returnValue(mockRequest);
            spyApiService.modifyEmptyWagonOrder.and.returnValue(of(mockResponse));

            service.modifyOrder(orderIdConsumer, orderInquiryView.demand[0]).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            expect(spyApiService.modifyEmptyWagonOrder).toHaveBeenCalledWith(orderIdConsumer, mockRequest);
        });
    });

});
