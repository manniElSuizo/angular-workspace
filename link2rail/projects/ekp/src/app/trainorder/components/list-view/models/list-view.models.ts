export interface ListViewFilterSessionStorageObjekt {
    filterActive?: number
    trainChain?:TrainChain,
    trainnumber?:string,
    sendingStation?:Location,
    receivingStation?:Location,
    plannedDepartureFrom?:Date | string,
    plannedDepartureTo?:Date 
}

export interface Location {
    stationName:string,
    stationKeyAlpha:string,
    stationKeySequence:number
}

export interface TrainChain {
    trainChainId?:string,
    trainChainName?:string
}

