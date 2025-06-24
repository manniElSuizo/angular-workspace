import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

import {OrderSummaryMappingService} from "./order-summary-mapping.service";
import {OrderSummaryRequestView, OrderSummaryResponseView} from "../models/order-summary-view";
import {map} from "rxjs/operators";

import {OrderView} from "../models/order-view";
import {OrderMappingService} from "./order-mapping.service";
import {OrderInquiryView} from "../models/order-inquiry-view";
import {OrderInquiryMappingService} from "./order-inquiry-mapping.service";
import {DemandView} from "../../template/models/template-demand-view";
import {EmptyWagonOrderService} from "../../api/generated/api/empty-wagon-order.service";
import {OrderModificationResponse} from "../../api/generated/model/order-modification-response";
import {OrderCreationResponse} from "../../api/generated/model/order-creation-response";
import {Order} from "../../api/generated/model/order";
import {OrderSummaryRequest} from "../../api/generated/model/order-summary-request";

@Injectable({
    providedIn: "root",
})
export class OrderService {

    constructor(
        private apiService: EmptyWagonOrderService,
        private orderSummaryMappingService: OrderSummaryMappingService,
        private orderMapper: OrderMappingService,
        private orderInquiryMapper: OrderInquiryMappingService
    ) {}

    public cancelOrderByIdConsumer(orderIdConsumer: string): Observable<OrderModificationResponse> {
        return this.apiService.cancelEmptyWagonOrder(orderIdConsumer);
    }

    public cancelOrdersByOrderId(orderId: string): Observable<Array<OrderModificationResponse>> {

        return this.apiService.cancelEmptyWagonOrdersByOrderId(orderId);
    }

    public createOrder(orderInquiryView: OrderInquiryView): Observable<OrderCreationResponse> {

        return this.apiService.createEmptyWagonOrders(
            this.orderInquiryMapper.mapToApiOrderCreationRequest(orderInquiryView));
    }

    public getOrderByIdConsumer(orderIdConsumer: string): Observable<OrderView> {
        return this.apiService.getEmptyWagonOrderByOrderIdConsumer(orderIdConsumer).pipe(
            map((order: Order) => this.orderMapper.fromApiOrder(order))
        );
    }

    public getOrdersByOrderId(orderId: string): Observable<Array<OrderView>> {
        return this.apiService.getEmptyWagonOrdersByOrderId(orderId).pipe(
            map((orders: Array<Order>) => orders.map(order => this.orderMapper.fromApiOrder(order)))
        );
    }

    public modifyOrder(orderIdConsumer: string, demand: DemandView): Observable<OrderModificationResponse> {
        return this.apiService.modifyEmptyWagonOrder(orderIdConsumer,
            this.orderInquiryMapper.mapToApiOrderModificationRequest(demand));
    }

    public searchOrders(request: OrderSummaryRequestView): Observable<OrderSummaryResponseView> {
        const orderSummaryRequest: OrderSummaryRequest = this.orderSummaryMappingService.toApiRequest(request);
        return this.apiService.searchEmptyWagonOrders(orderSummaryRequest).pipe(
            map(response => this.orderSummaryMappingService.fromApiResponse(response))
        );
    }

    public getOrderStatusHistory(orderIdConsumer: string) {
        return this.apiService.getEmptyWagonOrderByOrderIdConsumer(orderIdConsumer).pipe(
            map((order: Order) => this.orderMapper.fromApiStatusHistory(order))
        );
    }
}