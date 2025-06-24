import {Injectable} from '@angular/core';

import {LoadRunInformationView} from "../../order/models/order-summary-view";
import {FreightWagonLocationView} from "../../common/models/freight-wagon-location-view";
import {DemandWagonTypeView} from "../../common/models/demand-wagon-type-view";
import {CommercialLocationView} from "../../common/models/commercial-location-view";
import {CommonMappingService} from "../../common/services/common-mapping.service";
import {OrderSummary} from "../../api/generated/model/order-summary";
import {CommercialLocation, DemandWagonType, FreightWagonLocation} from "../../api/generated";
import {CustomerInformation} from "../../api/generated/model/customer-information";
import {
    TemplateSummaryRequestView,
    TemplateSummaryResponseView,
    TemplateSummaryView
} from "../models/template-symmary-view";
import {TemplateSummaryRequest} from "../../api/generated/model/template-summary-request";
import {TemplateSummaryResponse} from "../../api/generated/model/template-summary-response";
import {TemplateSummary} from "../../api/generated/model/template-summary";
import {CustomerInformationView} from "../../common/models/customer-information-view";

@Injectable({
    providedIn: 'root'
})
export class TemplateSummaryMappingService {

    constructor(
        private commonMapping: CommonMappingService
    ) {
    }

    public fromApiResponse(source: TemplateSummaryResponse): TemplateSummaryResponseView {
        const {offset, total, summaries, limit} = source;
        return {
            items: summaries.map(value => this.mapOrderSummaryToOrderSummaryView(value)),
            limit,
            offset,
            total
        }
    }

    public toApiRequest(source: TemplateSummaryRequestView): TemplateSummaryRequest {
        return {...source};
    }

    private mapOrderSummaryToOrderSummaryView(suorce: TemplateSummary): TemplateSummaryView {
        const {
            templateName,
            orderer,
            shipper,
            demand,
            isReadOnly
        } = suorce;

        return {
            templateName,
            orderer: this.mapCustomerInformationToCustomerInformationView(orderer),
            shipper: this.mapCustomerInformationToCustomerInformationView(shipper),
            isReadOnly
        } as TemplateSummaryView

    }

    private mapFreightWagonLocationToFreightWagonLocationView(freightWagonLocation: FreightWagonLocation): FreightWagonLocationView {
        return {...freightWagonLocation};
    }

    private mapCommercialLocationToDemandLocationView(commercialLocation: CommercialLocation): CommercialLocationView {
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

}
