import {BasicListRequest, PagingResponse} from "../../../shared/models/paging";
import {CommercialLocation, IdNameType} from "../../api/generated";
import {DemandWagonTypeView} from "../../common/models/demand-wagon-type-view";
import {CommercialLocationView} from "../../common/models/commercial-location-view";
import {FreightWagonLocationView} from "../../common/models/freight-wagon-location-view";
import {CustomerInformationView} from "../../common/models/customer-information-view";

export interface TemplateSummaryRequestView extends BasicListRequest {

    templateName?: Array<string>;
    demandLocations?: Array<CommercialLocation>;
    demandWagonTypes?: Array<DemandWagonTypeView>;
    ordererSgvs?: Array<IdNameType>;
    ordererPartners?: Array<IdNameType>;
    shipperSgvs?: Array<IdNameType>;
    shipperPartners?: Array<IdNameType>;

    offset: number;
    limit: number;
    sort?: string;
}

export interface TemplateSummaryResponseView extends PagingResponse {
    items: TemplateSummaryView[];
}

export interface TemplateSummaryView {
    templateName?: string,
    customerTemplateName?: string,
    orderer: CustomerInformationView
    shipper?: CustomerInformationView
    demandLocation: CommercialLocationView,
    freightWagonLocation?: FreightWagonLocationView,
    demandWagonType: DemandWagonTypeView,
    loadRunInformation?: CommercialLocationView,
    isReadOnly?: boolean;
}