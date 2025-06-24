import { Authorization, CustomerProfile } from "./authorization";
import { InfrastructureLocation } from "./location.models";
import { PagingResponse, PagingRequest } from "../../shared/models/paging";

export interface ApiTrainsListRequest extends PagingRequest {
    trainNumber: string;
    trainChainId: string;
    trainStatus?: any;
    productionDateFrom?: any;
    productionDateTo?: any;
    plannedDepartureFrom: any;
    plannedDepartureTo: any;
    sendingStationObjectKeyAlpha: any;
    sendingStationObjectKeySequence: any;
    receivingStationObjectKeyAlpha: any;
    receivingStationObjectKeySequence: any;
    customerProfiles: CustomerProfile[] | null;
    allTrainChains: boolean;
    productType?: any;
}

export interface ApiTrainsListResponse extends PagingResponse {
    items: TrainSummary[];
}

export interface TrainChainSummary {
    name: string,
    trainChainId: string,
    trainNumbers: string[]
}

export interface TrainSummary {
    trains: TrainIdentifier[],
    trainChainIdentifier: TrainChainIdentifier,
    sendingStation: TrainsStation,
    receivingStation: TrainsStation,
    plannedDeparture: Date,
    plannedArrival: Date,
    actualDeparture: Date,
    actualArrival: Date,
    cancellationFee: boolean,
    currentLocation: string,
    delayInMinutes: number,
    // remark: string,
    productType: string,
    progress: number,
    manualEta?: Date,
    operationalMode: string,
    customerServiceRemark: string,
    orderStatus: string,
    cancelable: boolean,
    cancelReasonName: string,
    currentTrainNumber: string,
    authorization: Authorization[],
    numberOfConstructionSites: number,
    comments?: boolean,
    zabdetails?: boolean,
    parked?: boolean,
    numberOfWagons?: number
}

export interface TrainIdentifier {
    trainId: string,
    trainNumber: string,
    productionDate: Date,
    startDate: Date
}

export interface TrainChainIdentifier {
    trainChainId: string,
    trainChainDate: Date,
    trainChainType?: TrainChainType,
    trainChainName: string
}

export enum TrainChainType {
    INTERMODAL = 'INTERMODAL',
    ROUNDTRIP = 'ROUNDTRIP'
}

export interface TrainsStation {
    name: string;
    objectKeyAlpha: string;
    objectKeySequence: number;
    tafTsiPrimaryCode?: string;
    country?: string;
}

/**
 * use this interface for transporting train data to identifiy a train, eg. when calling modal windows
 */
export interface TrainInfoData extends BasicTrainInfoData {
    sendingStation: InfrastructureLocation,
    receivingStation: InfrastructureLocation
}

export interface BasicTrainInfoData {
    trains: TrainIdentifier[],
    trainChainIdentifier?: TrainChainIdentifier,
    authorization?: Authorization[]
}