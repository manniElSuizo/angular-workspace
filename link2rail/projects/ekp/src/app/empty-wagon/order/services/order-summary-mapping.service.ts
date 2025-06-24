import {Injectable} from '@angular/core';

import {
    LoadRunInformationView,
    OrderSummaryRequestView,
    OrderSummaryResponseView,
    OrderSummaryView
} from "../models/order-summary-view";
import {OrderStatusTranslations, OrderStatusViewEnum} from "../enums/order-status-view.enum";
import {FreightWagonLocationView} from "../../common/models/freight-wagon-location-view";
import {DemandWagonTypeView} from "../../common/models/demand-wagon-type-view";
import {CommercialLocationView} from "../../common/models/commercial-location-view";
import {CommonMappingService} from "../../common/services/common-mapping.service";

import {TranslateService} from "@ngx-translate/core";
import {CustomerInformationView} from "../../common/models/customer-information-view";
import {
    CommercialLocation,
    CustomerInformation,
    DemandWagonType,
    FreightWagonLocation,
    OrderSummary,
    OrderSummaryRequest,
    OrderSummaryResponse,
    Status
} from "../../api/generated";

@Injectable({
    providedIn: 'root'
})
export class OrderSummaryMappingService {

    private statusToOrderStatusViewEnumMap: Record<Status, OrderStatusViewEnum> = {
        CANCELED: OrderStatusViewEnum.Canceled,
        CREATED: OrderStatusViewEnum.Created,
        DISPATCHED: OrderStatusViewEnum.Dispatched,
        DRAFT: OrderStatusViewEnum.Draft,
        DRAFT_REMOVED: OrderStatusViewEnum.DraftRemoved,
        IN_PROCESS: OrderStatusViewEnum.InProcess,
        IS_TRANSMITTED: OrderStatusViewEnum.IsTransmitted,
        PARTIAL_CANCELLATION: OrderStatusViewEnum.PartialCancellation,
        REJECTED: OrderStatusViewEnum.Rejected,
        TRANSMITTED: OrderStatusViewEnum.Transmitted,
        TRANSMIT_FAILED: OrderStatusViewEnum.TransmitFailed,
    };

    constructor(
        private translate: TranslateService,
        private commonMapping: CommonMappingService
    ) {
    }

    public fromApiResponse(source: OrderSummaryResponse): OrderSummaryResponseView {
        const {offset, total, summaries, limit} = source;
        return {
            items: summaries.map(value => this.mapOrderSummaryToOrderSummaryView(value)),
            limit,
            offset,
            total
        }
    }

    public toApiRequest(source: OrderSummaryRequestView): OrderSummaryRequest {
        return {...source};
    }

    private mapOrderSummaryToOrderSummaryView(suorce: OrderSummary): OrderSummaryView {
        const {
            commentCustomer,
            customerReference,
            deliveryDateTime,
            demandLocation,
            demandWagonType,
            internalOrderNumber,
            isEditable,
            numberOfWagonsDisposed,
            numberOfWagonsOrdered,
            orderer,
            orderId,
            orderIdConsumer,
            origin,
            shipper,
            status,
            templateName
        } = suorce;

        return {
            commentToCustomerService: commentCustomer,
            customerReference,
            deliveryDateTime: new Date(deliveryDateTime),
            demandLocation: this.mapCommercialLocationToDemandLocationView(demandLocation?.commercialLocation),
            demandWagonType: this.mapDemandWagonTypeToDemandWagonTypeView(demandWagonType),
            internalOrderNumber,
            enableCancelButton: isEditable,
            enableEditButton: isEditable,
            freightWagonLocation: this.mapFreightWagonLocationToFreightWagonLocationView(demandLocation?.freightWagonLocation),
            loadRunInformation: this.mapOrderSummaryToLoadRunInformationView(suorce),
            numberOfWagonsDisposed,
            numberOfWagonsOrdered,
            orderer: this.mapCustomerInformationToCustomerInformationView(orderer),
            orderId,
            orderIdConsumer,
            origin,
            shipper: this.mapCustomerInformationToCustomerInformationView(shipper),
            templateName,
            status: this.mapStatus(status),
        }

    }

    private mapFreightWagonLocationToFreightWagonLocationView(freightWagonLocation: FreightWagonLocation): FreightWagonLocationView {
        if (!freightWagonLocation) return null;
        return {...freightWagonLocation};
    }

    private mapCommercialLocationToDemandLocationView(commercialLocation: CommercialLocation): CommercialLocationView {
        if (!commercialLocation) return null;
        return this.commonMapping.fromApiCommercialLocation(commercialLocation);
    }

    private mapDemandWagonTypeToDemandWagonTypeView(demandWagonType: DemandWagonType): DemandWagonTypeView {
        return this.commonMapping.fromApiDemandWagonType(demandWagonType);
    }

    private mapOrderSummaryToLoadRunInformationView(suorce: OrderSummary): LoadRunInformationView {
        const {loadRunLocation = null, nhm = null, transitRailwayUndertaking = null} = suorce;
        if (loadRunLocation == null && nhm == null && transitRailwayUndertaking == null) return null;
        return {
            nhmCode: nhm?.code ?? null,
            countryCodeUic: loadRunLocation?.countryCodeUic ?? null,
            locationNumber: loadRunLocation?.number ?? null,
            transitRailwayUndertakingCode: transitRailwayUndertaking?.companyCode ?? null
        };
    }

    private mapCustomerInformationToCustomerInformationView(source: CustomerInformation): CustomerInformationView {
        return {...source};
    }

    private mapStatus(status: string): string {
        return this.translate.instant(`ewd.shared.status.${OrderStatusTranslations[this.statusToOrderStatusViewEnumMap[status]]}`)
    }
}
