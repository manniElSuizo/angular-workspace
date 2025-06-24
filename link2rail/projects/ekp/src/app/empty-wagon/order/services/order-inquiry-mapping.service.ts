import {Injectable} from '@angular/core';
import {OrderInquiryView} from "../models/order-inquiry-view";

import {CommonMappingService} from "../../common/services/common-mapping.service";
import {DemandView} from "../../template/models/template-demand-view";
import {OrderDemandTypeView} from "../models/order-demand-type-view";
import {OrderCreationRequest} from "../../api/generated/model/order-creation-request";
import {OrderModificationRequest} from "../../api/generated/model/order-modification-request";
import {OrderDemand} from "../../api/generated/model/order-demand";
import {OrderDemandType} from "../../api/generated/model/order-demand-type";

@Injectable({
    providedIn: 'root'
})
export class OrderInquiryMappingService {

    constructor(private commonMapping: CommonMappingService) { }

    mapToApiOrderCreationRequest(source: OrderInquiryView): OrderCreationRequest {
        return {
            templateName: source.templateName,
            demands: this.mapOrderDemands(source.demand)
        };
    }

    mapToApiOrderModificationRequest(source: DemandView): OrderModificationRequest | null {
        const firstDemandDateTime = source.demandDateTimes[0];
        if (!firstDemandDateTime) return null;

        const {deliveryDateTime, demands} = firstDemandDateTime;
        if (!deliveryDateTime || demands.length === 0) return null;

        const firstDemandType = demands[0];
        if (firstDemandType.numberOfWagonsOrdered < 1) return null;

        return this.createOrderModificationRequest(deliveryDateTime, firstDemandType);
    }

    private mapOrderDemands(source: Array<DemandView>): Array<OrderDemand> {
        return source.flatMap(this.mapOrderDemand.bind(this));
    }

    private mapOrderDemand(source: DemandView): Array<OrderDemand> {
        const {demandLocation, demandDateTimes} = source;
        return demandDateTimes.map(item => ({
            demandLocation: this.commonMapping.toApiDemandLocation(demandLocation),
            demandDateTime: item.deliveryDateTime.toISOString(),
            demandTypes: this.mapOrderDemandTypes(item.demands)
        }));
    }

    private mapOrderDemandTypes(source: Array<OrderDemandTypeView>): Array<OrderDemandType> {
        return source
            .filter(item => item.numberOfWagonsOrdered > 0)
            .map(this.mapOrderDemandType.bind(this));
    }

    private mapOrderDemandType(item: OrderDemandTypeView): OrderDemandType {
        return {
            assessment: this.mapAssessmentToApi(item),
            shipperAuthorization: item.shipperAuthorization,
            commentToCustomerService: item.commentToCustomerService,
            customerReference: item.customerReference,
            demandWagonType: this.commonMapping.toApiDemandWagonType(item.demandWagonType),
            numberOfWagons: item.numberOfWagonsOrdered,
            nhm: this.commonMapping.toApiNHM(item.nhm),
            loadRunLocation: this.commonMapping.toApiCommercialLocation(item.loadRunLocation),
            transitRailwayUndertaking: this.commonMapping.toApiTransitRailwayUndertaking(item.transitRailwayUndertaking)
        };
    }

    private mapAssessmentToApi(view: OrderDemandTypeView): boolean {
        if (view.assessment) return true;
        const {maxNumberOfWagons = 99, numberOfWagonsOrdered} = view;
        return numberOfWagonsOrdered > maxNumberOfWagons;
    }

    private createOrderModificationRequest(deliveryDateTime: Date, demandType: OrderDemandTypeView): OrderModificationRequest {
        return {
            demandDateTime: deliveryDateTime.toISOString(),
            numberOfWagons: demandType.numberOfWagonsOrdered,
            customerReference: demandType.customerReference,
            commentCustomer: demandType.commentToCustomerService,
            nhm: this.commonMapping.toApiNHM(demandType.nhm),
            loadRunLocation: this.commonMapping.toApiCommercialLocation(demandType.loadRunLocation),
            transitRailwayUndertaking: this.commonMapping.toApiTransitRailwayUndertaking(demandType.transitRailwayUndertaking)
        };
    }
}