import { TrainsStation } from "./ApiTrainsList.models";

export interface OrderRequest {
    templateId: string;
    cargo: Cargo[];
    transport: Transport[]
    earliestHandover?: string;
    latestHandover?: string;
    earliestDelivery?: string;
    latestDelivery?: string
}

export interface CargoDetail {
    nhmCode: string;
    nhmCodeText: string;
    unCode: string;
    wagonType: string;
    numberOfWagons: number;
}

export interface Cargo {
    nhmCode: string;
    nhmCodeText: string;
    numberOfWagons: number;
    netWeight: number;
    wagonType?: string;
    dangerousGoodClass?: string;
    unCode?: string;
    bzaNumber?: string;
    weight?: number;
    length?: number;    
    maximumSpeed: number;
    intermodalProfileP2: number;
    intermodalProfileP3: number;
    intermodalProfileC2: number;
    intermodalProfileC3: number;
    items: CargoDetail[];
}

export interface Transport {
    shipmentDate: string;
    customerReference: string;
    orderReason: string;
}

export interface TransportRoute {
    sendingStation: string;
    receivingStation: string;
    carrier: string;
}

export interface ApiNewOrderRequest {
    order: {
        orderer: string;
        partnerId: string;
        customerLanguage: string;
        customerReference: string;
        orderReason: string;
        shipmentDate: string;
        sender: string;
        receiver: string;
        sendingStation: TrainsStation;
        receivingStation: TrainsStation;
        sendingWorkDirection: string;
        receivingWorkDirection: string;
        earliestHandover: Date;
        latestHandover: Date;
        earliestDelivery: Date;
        latestDelivery: Date;
        plannedNumberOfWagons: number;
        plannedWeight: number;
        nhmCode: string;
        dangerousGood: {
            unCode: string;
            unDescription: string;
        };
        miscInformation: string;
        sgvNumber?: string;
        cancelationReason?: string;
        reductionNote?: string;
    };
}