import {Injectable} from '@angular/core';
import {CommonMappingService} from '../../common/services/common-mapping.service';

import {OrderDemandDateTimeView} from "../../order/models/order-demand-date-time-view";
import {OrderDemandTypeView} from "../../order/models/order-demand-type-view";
import {OrderInquiryView} from "../../order/models/order-inquiry-view";
import {DemandView} from "../models/template-demand-view";

import {TemplateDemand} from "../../api/generated/model/template-demand";
import {DemandType} from "../../api/generated/model/demand-type";
import {Template} from "../../api/generated/model/template";

@Injectable({
    providedIn: 'root'
})
export class TemplateMappingService {

    constructor(private commonMapping: CommonMappingService) {}

    public fromApiTemplate(source: Template): OrderInquiryView {
        const {templateName, customerTemplateName, orderer, shipper, demand} = source;

        return {
            templateName,
            customerTemplateName,
            orderer: this.commonMapping.fromApiCustomerInformation(orderer),
            shipper: this.commonMapping.fromApiCustomerInformation(shipper),
            demand: demand.map(d => this.mapTemplateDemandToTemplateDemandView(d))
        } as OrderInquiryView;
    }

    private mapTemplateDemandToTemplateDemandView(source: TemplateDemand): DemandView {
        const {demandLocation, demandTypes} = source;

        return {
            demandLocation: this.commonMapping.fromApiDemandLocation(demandLocation),
            demandDateTimes: [this.mapDemandDateTimeToView(demandTypes)]
        } as DemandView;
    }

    mapDemandDateTimeToView(source: DemandType[]): OrderDemandDateTimeView {
        return {
            deliveryDateTime: null,
            demands: source.map(type => this.mapDemandTypeToOrderDemandTypeView(type)),
        } as OrderDemandDateTimeView;
    }

    private mapDemandTypeToOrderDemandTypeView(source: DemandType): OrderDemandTypeView {
        const {
            demandWagonType,
            nhm,
            loadRunLocation,
            transitRailwayUndertaking,
            assessment,
            shipperAuthorization,
            maxOrderAmount,
            referenceNumber,
            commentCustomer
        } = source;

        return {
            demandWagonType: this.commonMapping.fromApiDemandWagonType(demandWagonType),
            nhm: nhm ? this.commonMapping.fromApiNHM(nhm) : undefined,
            loadRunLocation: loadRunLocation ? this.commonMapping.fromApiCommercialLocation(loadRunLocation) : undefined,
            transitRailwayUndertaking: transitRailwayUndertaking ? this.commonMapping.fromApiTransitRailwayUndertaking(transitRailwayUndertaking) : undefined,
            numberOfWagonsOrdered: undefined,
            numberOfWagonsDisposed: undefined,
            maxNumberOfWagons: maxOrderAmount,
            customerReference: referenceNumber,
            commentToCustomerService: commentCustomer,
            commentDisponent: undefined,
            assessment: assessment,
            shipperAuthorization: shipperAuthorization,
        } as OrderDemandTypeView;
    }
}