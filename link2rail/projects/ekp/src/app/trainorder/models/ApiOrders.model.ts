
import { TrainIdentifier, TrainsStation } from './ApiTrainsList.models';
import { CommercialLocation, ProductionLocation } from './location.models';
import {OrderStatusTypes} from "../../shared/enums/order-status";
import { OrderTemplateCarrier, OrderTemplatePartner } from './OrderTemplateModels';
import { Cargo } from './ApiNewOrder.model';
import { Authorization, CustomerProfile } from './authorization';
import { MarketSegment } from './ApiCustomers.model';
import { PagingResponse, PagingRequest } from '../../shared/models/paging';

export interface ApiOrdersListRequest extends PagingRequest {
    orderStatus: OrderStatusTypes[];
    customerReference?: string;
    orderNumber: string;
    shipmentDateFrom: any;
    shipmentDateTo: any;
    sendingStationObjectKeyAlpha: any;
    sendingStationObjectKeySequence: any;
    receivingStationObjectKeyAlpha: any;
    receivingStationObjectKeySequence: any;
    customerProfiles: CustomerProfile[] | null;
}

export interface ApiOrdersListResponse extends PagingResponse {
    items: OrderItem[];
}

export interface OrderItem {
    customerReference: string;
    orderNumber: string;
    orderStatus: string;
    shipmentDate: Date;
    sendingStation: TrainsStation;
    receivingStation: TrainsStation;
    length: number;
    weight: number;
    netWeight: number;
    numberOfWagons: number;
    nhmCodes: string[];
    authorization: Authorization[];
    carrierRoute: CarrierRoute[];
}

export interface OrderDetails {
    orderer: OrderTemplatePartner;
    //partnerId: string;
    customerLanguage: string;
    sender: OrderTemplatePartner;
    sendingStation: CommercialLocation;
    wagonStoringPositionSender: ProductionLocation;
    loader: OrderTemplatePartner;
    firstCarrier: OrderTemplateCarrier;
    sendingWorkDirection: string;
    receiver: OrderTemplatePartner;
    receivingStation: CommercialLocation;
    wagonStoringPositionReceiver: ProductionLocation;
    unloader: OrderTemplatePartner;
    lastCarrier: OrderTemplateCarrier;
    receivingWorkDirection: string;
    cargo: Cargo [];
    shipmentDate: string;
    customerReference: string;
    orderReason: string;
    earliestHandover: string;
    latestHandover: string;
    earliestDelivery: string;
    ordererEmail: string;
    cancellationEmail: string;
    latestDelivery: string;
    carrierRoute: CarrierRoute [];
    miscInformation: string;
    orderStatus: string;
    cancelationReason: string;
    reasonCancelName: string;
    reasonRejection: string;
    reductionNote: string;
    trainType: string;
    orderDateTime: string;
    cancellationDateTime: string;
    borderStations: string [];
    customs: string [];
    mainCarrier: OrderTemplateCarrier;
    marketSegmentCode: MarketSegment;
    marketSegmentName: MarketSegment;
    customerFreetext: string;
    reasonOrderName?: string;
    authorization?: [];
}

export interface ApiOrderDetailResponse {
    order: OrderDetails;
}

export interface ApiTrainOrderDetailResponse {
    train: TrainIdentifier;
    order: OrderDetails;
}

export interface ApiOrderReductionRequest {
    reducedNumberOfWagons: number,
    reducedWeight: number,
    reductionNote: string
}

export interface CarrierRouteItem {
    startStation?: string;
    destinationStation?: string;
    carrierr?: string;
}

export interface CarrierRoute {
    carrier?: CarrierItem;
    plannedArrival?: string;
    plannedDeparture?: string;
    productionDate?: Date;
    receivingStation?: TrainsStation;
    sendingStation?: TrainsStation;
    trainNumber?: string;
}

export interface CarrierItem {
    name: string;
    uicCompanyCode: string;
}
