import { ApiTrainsListRequest } from "./ApiTrainsList.models";
import { CustomerProfile } from "./authorization";

export interface CustomerTrainNumberRequest {
  trainNumber: string;
  productionDateFrom?: any;
  productionDateTo?: any;
  plannedDepartureFrom: any;
  plannedDepartureTo: any;
  sendingStationObjectKeyAlpha: any;
  sendingStationObjectKeySequence: any;
  receivingStationObjectKeyAlpha: any;
  receivingStationObjectKeySequence: any;
  customerProfiles?: CustomerProfile[] | null;
}

export interface CustomerTrainNumberResponse extends Array<string> {}

export class CustomerTrainNumberHelpers {
  static apiTrainsListRequest2Request(aReq: ApiTrainsListRequest) {
    let cReq: CustomerTrainNumberRequest = {
      trainNumber: aReq.trainNumber,
      productionDateFrom: aReq.productionDateFrom,
      productionDateTo: aReq.productionDateTo,
      plannedDepartureFrom: aReq.plannedDepartureFrom,
      plannedDepartureTo: aReq.plannedDepartureTo,
      sendingStationObjectKeyAlpha: aReq.sendingStationObjectKeyAlpha,
      sendingStationObjectKeySequence: aReq.sendingStationObjectKeySequence,
      receivingStationObjectKeyAlpha: aReq.receivingStationObjectKeyAlpha,
      receivingStationObjectKeySequence: aReq.receivingStationObjectKeySequence,
      customerProfiles: aReq.customerProfiles,
    };
    
    return cReq;
  };
}
