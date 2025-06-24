import {BasicListRequest, PagingResponse} from "../../../shared/models/paging"
import {CommercialLocation, IdNameType,} from "../../api/generated";
import {CommercialLocationView} from "../../common/models/commercial-location-view";
import {FreightWagonLocationView} from "../../common/models/freight-wagon-location-view";
import {DemandWagonTypeView} from "../../common/models/demand-wagon-type-view";
import {Status} from "../../api/generated/model/status";
import {CustomerInformationView} from "../../common/models/customer-information-view";

export interface OrderSummaryRequestView extends BasicListRequest {

    templateName?: Array<string>;
    demandLocations?: Array<CommercialLocation>;
    demandWagonTypes?: Array<DemandWagonTypeView>;
    ordererSgvs?: Array<IdNameType>;
    ordererPartners?: Array<IdNameType>;
    loadRunCountryCodeIso?: Array<string>;

    offset: number;

    limit: number;

    sort?: string;

    deliveryDateTimeFrom?: string;

    deliveryDateTimeTo?: string;
    origin?: Array<string>;
    status?: Array<Status>;

    reference?: string;
}

export interface OrderSummaryResponseView extends PagingResponse {
    items: OrderSummaryView[];
}

export interface OrderSummaryView {
    orderId: string,
    templateName?: string,
    internalOrderNumber?: string,
    orderIdConsumer: string
    orderer: CustomerInformationView
    shipper?: CustomerInformationView
    demandLocation: CommercialLocationView,
    freightWagonLocation?: FreightWagonLocationView,
    demandWagonType: DemandWagonTypeView,
    numberOfWagonsOrdered: number,
    numberOfWagonsDisposed?: number,
    status: string,
    origin: string,
    deliveryDateTime: Date,
    commentToCustomerService?: string
    customerReference?: string,
    loadRunInformation?: LoadRunInformationView,
    enableEditButton: boolean,
    enableCancelButton: boolean
}

export interface LoadRunInformationView {

    countryCodeUic: string,
    locationNumber: string,
    transitRailwayUndertakingCode?: string,
    nhmCode?: string
}



