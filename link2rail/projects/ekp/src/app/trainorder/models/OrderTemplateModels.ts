import { Cargo } from "./ApiNewOrder.model";
import { CustomerProfile } from "./authorization";
import { CommercialLocation, ProductionLocation } from "./location.models";
import { PagingResponse, PagingRequest } from "../../shared/models/paging";

export interface OrderTemplate {
    name?: string;
    templateId?: string;
    cargo: Cargo[];
    orderer: OrderTemplatePartner;
    customerLanguage: string;
    sender: OrderTemplatePartner
    sendingStation: CommercialLocation;
    wagonStoringPositionSender: ProductionLocation;
    loader?: OrderTemplatePartner;
    firstCarrier: OrderTemplateCarrier;
    workDirectionSend?: string;
    trainType: string;

    receiver: OrderTemplatePartner;
    receivingStation: CommercialLocation;
    wagonStoringPositionReceiver: ProductionLocation;
    unloader?: OrderTemplatePartner;
    lastCarrier: OrderTemplateCarrier;
    workDirectionReceive?: string;

    mainCarrier: OrderTemplateCarrier;
    marketSegmentCode: string;
    marketSegmentName: string;
    tomGroup?: string;
    operationalId?: string;
    validFrom?: string;
    validUntil?: string;
    commercialService?: string;
    borderStation?: string[];
    route?: OrderTemplateRoute[];
}

export interface OrderTemplateResponse {
    orderTemplate: OrderTemplate;
}

export interface OrderTemplateCarrier {
    name: string;
    uicCompanyCode: string;
}

export interface OrderTemplateSummary {
    templateId: string;
    templateName: string | undefined | null;
    trainType: string;
    sender: string;
    sendingStation: string;
    receiver: string;
    receivingStation: string;
    validFrom: Date;
    validTo: Date;
}

export interface OrderTemplateSummaryResponse extends PagingResponse {
    items: OrderTemplateSummary[];
}

export interface OrderTemplateSummaryRequest extends PagingRequest {
    templateId: string;
    senderName: string;
    receiverName: string;
    sendingStationObjectKeyAlpha?: string | null;
    sendingStationObjectKeySequence?: string | null;
    receivingStationObjectKeyAlpha?: string | null;
    receivingStationObjectKeySequence?: string | null;
    customerProfiles: CustomerProfile[] | null;
}
export interface OrderTemplatePartner {
    sgvId: string,
    partnerId: string,
    name: string,
    siteName?: string
}

export interface OrderTemplateRequest {
    orderTemplate: OrderTemplate
}
export interface OrderTemplateModificationRequest {
    orderTemplate: OrderTemplate,
    templateId: string
}

export interface OrderTemplateRoute {
    sendingStation: CommercialLocation,
    receivingStation: CommercialLocation,
    carrier: OrderTemplateCarrier
}
