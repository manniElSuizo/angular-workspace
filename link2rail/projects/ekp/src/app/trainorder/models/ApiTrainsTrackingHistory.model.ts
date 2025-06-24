import { TrainIdentifier } from "./ApiTrainsList.models";
import { InfrastructureLocation } from "./location.models";

export interface TrackingHistory {
  manualEta?: Date;
  parked?: boolean;
  timetableDaily: TrackingHistoryEntry[];
  timetableYearly: TrackingHistoryEntry[];
}

export interface TrackingHistoryEntry {
  event?: string;
  eventDateTime?: string;
  location: InfrastructureLocation;
  scheduleDateTime?: Date;
  scheduleDelta?: number;
  delayReason?: string;
  eventGroup?: EventGroup
}

export interface TrainTrackingHistory extends TrackingHistory {
  train: TrainIdentifier,
  sendingStation: InfrastructureLocation,
  receivingStation: InfrastructureLocation
}

export interface TrainTrackingHistoryResponse extends Array<TrainTrackingHistory> {
}

export enum EventGroup {
  PRE_CARRIAGE = 'PRE_CARRIAGE',
  TRAVEL_POINT = 'TRAVEL_POINT',
  POST_TRANSPORT = 'POST_TRANSPORT'
};

export enum Event {
  DEPARTURE = 'DEPARTURE',
  ARRIVAL = 'ARRIVAL',
  PASSTHROUGH = 'PASSTHROUGH',
  STABLING = 'STABLING',
  CONTINUATION = 'CONTINUATION',
  DELAY = 'DELAY',
  REMARK = 'REMARK',
  MAJOR_DISRUPTION = 'MAJOR_DISRUPTION',
  // Pre- and AfterEvents
  START_WAGON_INSPECTION = 'START_WAGON_INSPECTION',
  HANDOVER_UNLOADER = 'HANDOVER_UNLOADER',
  END_TRAIN_FORMATION_EMPTY_TRAIN = 'END_TRAIN_FORMATION_EMPTY_TRAIN',
  END_WAGON_INSPECTION = 'END_WAGON_INSPECTION',
  TRAIN_TRACTION = 'TRAIN_TRACTION',
  HANDOVER_LOADER = 'HANDOVER_LOADER',
  HANDOVER_TO_DBC = 'HANDOVER_TO_DBC',
  HANDOVER_FROM_DBC = 'HANDOVER_FROM_DBC',
  ARRIVAL_PLACE_OF_UNLOADING = 'ARRIVAL_PLACE_OF_UNLOADING',
  LOADING_PREPARATION = 'LOADING_PREPARATION',
  START_LOADING = 'START_LOADING',
  END_LOADING = 'END_LOADING',
  UNLOADING_PREPARATION = 'UNLOADING_PREPARATION',
  START_UNLOADING = 'START_UNLOADING',
  END_UNLOADING = 'END_UNLOADING',
  DEPARTURE_FROM_DEPOT = 'DEPARTURE_FROM_DEPOT',
  DEPARTURE_TO_DEPOT = 'DEPARTURE_TO_DEPOT'
}