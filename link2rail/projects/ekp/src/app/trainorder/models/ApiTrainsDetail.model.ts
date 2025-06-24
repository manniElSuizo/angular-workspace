import { TrainChainIdentifier, TrainIdentifier, TrainsStation } from "./ApiTrainsList.models";
import { Authorization } from "./authorization";

export interface MajorDisruption {
    trainId: string;
    name: string;
    validFrom: string;
    validUntil: string;
    objectKeyAlpha: string;
    objectKeySequence: number;
    disruptionLocation: string;
}

export interface ConstructionSite {
    eta: string;
    fploNr: string;
    impact: string;
    location: string;
    period: string;
}

export interface PlannedTimeAndActualTime {
    plannedTime: string,
    actualTime: string
}

export interface TrainDetail {
    train: TrainIdentifier;
    actualArrival?: any;
    actualDeparture: Date;
    authorization: Authorization;
    operationalId: string;
    corridor: string;
    orderStatus: string;
    currentTrainNumber: string;
    timetableDaily: TrainSchedule;
    deadline: Date;
    majorDisruptions: MajorDisruption[];
    productType: string;
    sgvNumber: number;
    timetableYearly: TrainSchedule;
    cancelReasonName: string;
    constructionSites: ConstructionSite[],
    closeTimes: PlannedTimeAndActualTime,
    craneTimes: PlannedTimeAndActualTime,
    provisionTimes: PlannedTimeAndActualTime;
    cancelable: boolean;
    comment?: string;
}

export interface TrainChain {
    trainChainIdentifier: TrainChainIdentifier,
    trainChainName: string,
    trains: TrainDetail[]
}

interface TrainSchedule {
    lengthMax: string;
    plannedArrival: Date;
    plannedDeparture: Date;
    receivingStation: TrainsStation;
    routeLocations: RouteLocation[];
    sendingStation: TrainsStation;
    weightMax:string;
    speedMax: string;
    bzaNumber: string;
}

interface RouteLocation {
    lengthMax: string;
    location: TrainsStation;
    plannedArrival: Date;
    plannedDeparture: Date;
    weightMax:string;
}
