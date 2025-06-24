import { TrackingHistory } from "./ApiTrainsTrackingHistory.model";

export interface OrderModel {
  trainId: string;
  trainStatus: string;
  trainNumber: string;
  productionDate: string;
  startDate: string;
  productType: string;
  location: string;
  sendingStation: StationModel;
  receivingStation: StationModel;
  plannedDeparture: string;
  plannedArrival: string;
  trackingHistory: TrackingHistory;
  comment: string;
  sgvNumber?: string;
  orderStatus?: string;
  orderDate?: string;
  clientNumber?: string;
  actualDeparture?: string;
  actualArrival?: string;
  orderId?: string;
  acceptanceDeadline?: string;
  corridor?: string;
  operationalId?: string;
}

export interface StationModel {
  name: string;
}
