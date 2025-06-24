import {Injectable} from '@angular/core';

import {OrderStatusHistoryView, OrderView, StatusHistoryView} from '../models/order-view';
import {OrderDemandTypeView} from "../models/order-demand-type-view";
import {DemandView} from "../../template/models/template-demand-view";
import {OrderDemandDateTimeView} from "../models/order-demand-date-time-view";
import {CommonMappingService} from "../../common/services/common-mapping.service";
import {Order} from "../../api/generated/model/order";

@Injectable({
    providedIn: 'root'
})
export class OrderMappingService {

    constructor(private commonMapping: CommonMappingService) {}

    public fromApiOrder(source: Order): OrderView {
        return {
            orderId: source.orderId,
            orderIdConsumer: source.orderIdConsumer,
            internalOrderNumber: source.internalOrderNumber,
            templateName: source.templateName,
            orderer: this.commonMapping.fromApiCustomerInformation(source.orderer),
            shipper: this.commonMapping.fromApiCustomerInformation(source.shipper),
            status: this.commonMapping.fromApiStatus(source.status),
            origin: source.origin,
            commentDisponent: source.commentDisponent,
            customerReference: source.customerReference,
            demand: this.mapTemplateDemandToTemplateDemandView(source)
        } as OrderView;
    }

    public fromApiStatusHistory(source: Order): OrderStatusHistoryView {

        return {
            orderIdConsumer: source.orderIdConsumer,
            history: source.statusHistory.map(history => {
                return {
                    status: this.commonMapping.fromApiStatus(history.status),
                    dateTime: new Date(history.dateTime)
                } as StatusHistoryView
            }).sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()) // Sort by dateTime descending
        }
    }

    private mapTemplateDemandToTemplateDemandView(source: Order): DemandView {
        const {demandLocation} = source;

        return {
            demandLocation: this.commonMapping.fromApiDemandLocation(demandLocation),
            demandDateTimes: [this.mapDemandDateTimeToView(source)]
        } as DemandView;
    }

    mapDemandDateTimeToView(source: Order): OrderDemandDateTimeView {
        return {
            deliveryDateTime: new Date(source.deliveryDateTime),
            demands: [this.mapOrderDemandTypeToView(source)]
        } as OrderDemandDateTimeView;
    }

    private mapOrderDemandTypeToView(source: Order): OrderDemandTypeView {
        const {
            demandWagonType,
            nhm,
            loadRunLocation,
            transitRailwayUndertaking,
            numberOfWagonsOrdered,
            numberOfWagonsDisposed,
            customerReference,
            commentCustomer,
            commentDisponent
        } = source;

        return {
            demandWagonType: this.commonMapping.fromApiDemandWagonType(demandWagonType),
            nhm: nhm ? this.commonMapping.fromApiNHM(nhm) : undefined,
            loadRunLocation: loadRunLocation ? this.commonMapping.fromApiCommercialLocation(loadRunLocation) : undefined,
            transitRailwayUndertaking: transitRailwayUndertaking ? this.commonMapping.fromApiTransitRailwayUndertaking(transitRailwayUndertaking) : undefined,
            numberOfWagonsOrdered,
            numberOfWagonsDisposed,
            customerReference,
            commentToCustomerService: commentCustomer,
            commentDisponent,
            assessment: null,
            shipperAuthorization: null

        } as OrderDemandTypeView;
    }

}