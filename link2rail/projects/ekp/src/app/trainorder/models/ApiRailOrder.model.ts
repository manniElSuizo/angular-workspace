import { OrderKey, RailOrderStage } from "@src/app/order-management/components/wagon-view/models/api-wagon-list"
import { BasicListRequest, PagingResponse } from "@src/app/shared/models/paging"
import { Authorization, CustomerProfile } from "./authorization"
import { ListKeyValue } from "@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component"
import { Action, RailOrderStatus } from "@src/app/order-management/models/general-order"
import { LocationRequest } from "@src/app/order-management/models/rail-order-api"

export interface RailorderSummary {
    trainNumber?: string,
    prodDate?: Date,
    wagons: WagonSummary[]
}

export interface RailorderSummaryCalculation{
    wagonCount: number,
    sumCargoWeight : number,
    sumVehicleWeight: number,
    sumTotalWeight: number,
    sumLength: number,
    axesCount:number
}

export interface WagonSummary {
    wagonNumber: string,
    orderAuthority?: number,
    orderNumber: number,
    wagonType?: string,
    shippingTimestamp?: Date,
    consignor?: string,
    consignee?: string,
    nhmCode?: string,
    cargoWeight?: number,
    vehicleWeight?: number,
    totalWeight?: number,
    numberOfAxis?: number,
    length?: number
    sendingStation?: string,
    receivingStation?:string,
}

export interface RailOrderSearchSummary {
    orderId: number;
    orderKey: OrderKey,
    shippingTime: string,
    railOrderStages: RailOrderStage[],
    dangerousGoodsTransport: boolean,
    railOrderStatus: RailOrderStatus,
    zabStatus : RailOrderStatus,
    railOrderStatusTime: string,
    sendingStation: string,
    receivingStation: string,
    consignorName: string,
    consigneeName: string,
    templateNumber: string,
    wagonCount?: number;
    wagonNumbers: string[];
    allowedActions: Action[];
    authorization: Authorization[];
}

export interface RailOrderSummaryResponse extends PagingResponse {
    items: RailOrderSearchSummary[];
}

export interface RailOrderSummaryRequest4Storage extends RailOrderSummaryRequest {
    shippingDateFromChanged: boolean,
    sendingStationsCode: Array<ListKeyValue>,
    sendingStationsSearchInput: string,
    receivingStationsCode: Array<ListKeyValue>
    receivingStationsSearchInput: string,
    consignorProfilesCode: Array<ListKeyValue>,
    consignorSearchInput: string,
    consigneeProfilesCode: Array<ListKeyValue>,
    consigneeSearchInput: string,
    railOrderStageList: RailOrderStageForFilter[],
    receivingStationCountryCodesSearchInput: string;
    sendingStationCountryCodesSearchInput: string;
    sendingStationCountryCodes: string[];
    receivingStationCountryCodes: string[];
    sendingStationCountryCodesStorage: ListKeyValue[];
    receivingStationCountryCodesStorage: ListKeyValue[];
}

export interface RailOrderSummaryRequest extends BasicListRequest {
    orderNumber: string,
    shippingDateFrom: string,
    shippingDateTo: string,
    railOrderStatus: RailOrderStatus[],
    railOrderStages: RailOrderStageForFilter[],
    dangerousGoodsTransport: boolean,
    orderTemplateNumbers: string[],
    sendingStations: LocationRequest[],
    receivingStations: LocationRequest[],
    wagonNumber: string,
    consignorProfiles: CustomerProfile[],
    consigneeProfiles: CustomerProfile[],
    sendingStationsStorage?: ListKeyValue[];
    receivingStationsStorage?: ListKeyValue[];
    consignorProfilesStorage?: ListKeyValue[];
    consigneeProfilesStorage?: ListKeyValue[];
    reference?: string,
    sendingStationCountryCodes ?: String[];
    receivingStationCountryCodes ?: String[];
}

export enum RailOrderStageForFilter {
  TRANSPORT_ORDER = RailOrderStage.TRANSPORT_ORDER,
  BOOKING = RailOrderStage.BOOKING,
  DRAFT = RailOrderStage.DRAFT,
  DANGEROUS_GOODS = 'DANGEROUS_GOODS',
  ALL = 'ALL'
}
