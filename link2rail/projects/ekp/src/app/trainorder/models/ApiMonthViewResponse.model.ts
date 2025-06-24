import { ProductType } from "@src/app/shared/enums/train-types.enum";
import { TileTypeEnum } from "../components/month-view/tile.model";
import { TrainChainIdentifier, TrainIdentifier } from "./ApiTrainsList.models";
import { Authorization, CustomerProfile } from "./authorization";
import { InfrastructureLocation } from "./location.models";

export interface TrainConnectionResponse {
  offset: number;
  limit: number;
  total: number;
  items: TrainConnection[];
}

export interface TrainConnectionRequest {
  offset: number;
  limit: number;
  startDate: string;
  endDate: string;
  sendingStationObjectKeyAlpha: any;
  sendingStationObjectKeySequence: any;
  receivingStationObjectKeyAlpha: any;
  receivingStationObjectKeySequence: any;
  identifier: string;
  customerProfiles: CustomerProfile[] | null;
  temp_sendingStation?: any;
  temp_receivingStation?: any;
}

export interface TrainConnection {
  sendingStation: InfrastructureLocation,
  receivingStation: InfrastructureLocation,
  elements: TrainConnectionElement[]
}

export interface TrainConnectionElement {
  id?: string,
  trainChainIdentifier?: TrainChainIdentifier
  trains?: TrainIdentifier[],
  delayInMinutes?: number | undefined,
  manualEta?: Date,
  status: TileTypeEnum,
  date?: string,
  parked: boolean,
  dateAsDate?: Date,
  holiday?: string[],
  isTrackable?: boolean,
  cancelable?: boolean,
  productType: ProductType;
  authorization?: Authorization[];
}
