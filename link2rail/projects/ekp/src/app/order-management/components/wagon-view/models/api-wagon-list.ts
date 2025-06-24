import { RailOrderStatus } from "@src/app/order-management/models/general-order";
import { LocationRequest } from "@src/app/order-management/models/rail-order-api";
import { ListKeyValue } from "@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";
import { PagingResponse, PagingRequest } from "@src/app/shared/models/paging";
import { CustomerProfile } from "@src/app/trainorder/models/authorization";


export interface WagonSummaryRequest extends PagingRequest {
    wagonNumber?: string;
    orderAuthority?: number;
    orderNumber?: string;
    shippingDateFrom?: Date;
    shippingDateTo?: Date;
    incomingBy?: Date;
    sendingStations?: LocationRequest[];
    receivingStations?: LocationRequest[];
    currentLocations?: string[];
    emptyWagons?: boolean
    // TODO
    consignorProfiles?: CustomerProfile[];
    consigneeProfiles?: CustomerProfile[];
    customerProfiles?: CustomerProfile[];
    reference?: string,
    sendingStationCountryCodes ?: String[];
    receivingStationCountryCodes ?: String[];
}

export interface WagonSummaryResponse extends PagingResponse {
    summaries: WagonSearchSummary[];
}

export interface WagonSearchSummaryDetailedResponse extends PagingResponse {
    detailedSummaries: WagonSearchSummaryDetailed[];
}

export interface WagonSummaryRequest4Storage extends WagonSummaryRequest {
    sendingStationsSearchInput?: string;
    sendingStationsStorage?: ListKeyValue[];
    receivingStationsSearchInput?: string;
    receivingStationsStorage?: ListKeyValue[];
    currentLocationsSearchInput?: string;
    currentLocationsStorage?: ListKeyValue[];
    consignorProfilesSearchInput?: string;
    consignorProfilesStorage?: ListKeyValue[];
    consigneeProfilesSearchInput?: string;
    consigneeProfilesStorage?: ListKeyValue[];
    dispatchDateFromChanged?: boolean;
    sendingStationCountryCodesStorage?: ListKeyValue[],
    sendingStationCountryCodesSearchInput?: string,
    sendingStationCountryCodes?: string[],
    receivingStationCountryCodes?: string[],
    receivingStationCountryCodesStorage?: ListKeyValue[],
    receivingStationCountryCodesSearchInput?: string,
    incomingBy?: Date
}


export interface WagonSearchSummary {
    wagonNumber?: string;
    emptyWagon?: boolean;
    suitableForRunning?: string;
    shippingTime?: Date;
    estimatedArrivalTime?: Date;
    latestArrivalTime?:Date;
    sendingStation?: string;
    receivingStation?: string;
    lastWagonEventTime?: Date;
    lastWagonEventType?: WagonSearchEventType;
    currentLocationCountryCode?: string; // ISO 3166-1 alpha-2 country code
    timeConstraintType?: string;
    currentLocation?: string;
    consignorName?: string;
    consigneeName?: string;
    railOrderStatus?: RailOrderStatus;
    orderId: number;
    orderKey: OrderKey;
}

export interface WagonSearchSummaryDetailed extends WagonSearchSummary {
    firstTrainNumber?: string;
    currentTrainNumber?: string
    actualDepartureTime?: string; // IST-Abfahrt  type: string   format: date-time
    actualArrivalTime?: string;  // IST-Ankunft //  type: string   format: date-time
    consignorReference?: string; //  Absenderreferenz type: string
    consignorSgv?: string; // Absendernumnmer  type: string
    consigneeSgv?: string  // Empfängernummer  type: string
    nhmCode?: string //  NhmCode        type: string
    nhmDescription?:string; // Warenbezeichnung  type: string
    internationalFreightWagonClass?: string // Wagengattung type: string
    tareWeight?: number; // Wagengewicht type: number
    weight?: number; //  Nettogewicht type: number
    totalWeight: number; // Bruttogewicht  type: number
    tariffNumber: string; //  Zollnummer type: string
    bzaNumber: string; //  BZA-Nummer  type: string
    discountCode: string; //  Kundenabkommen type: string
    templateNumber:string; //  Auftragscode  type: string
    zabStatus: RailOrderStatus //  ZAB-Status type: string
    damageTypeCodes: string[];  // type: array
    damageTypeDescriptions: string[]; // Schadcodes type: array
    customerReferences: string[]; //  Kundenreferenz type: array
}

export interface OrderKey {
    orderAuthority: number;
    orderNumber: number;
}

export interface InfrastructureLocationSummary {
    name: string,
    objectKeyAlpha: string,
    objectKeySequence: number
}

export interface PartnerSummary {
    name: string,
    sgvId: string,
    partnerId: string,
    ownerNumber?: string
}

export enum WagonSearchEventType {
    LOCATION_CHANGE = 'LOCATION_CHANGE',
    ACTIVATION = 'ACTIVATION',
    DEPARTURE = 'DEPARTURE',
    PASS_THROUGH = 'PASS_THROUGH',
    ARRIVAL = 'ARRIVAL',
    COMPLETION = 'COMPLETION'
}

export enum RailOrderStage {
    DRAFT = 'DRAFT',
    BOOKING = 'BOOKING',
    TRANSPORT_ORDER = 'TRANSPORT_ORDER'
}

export function railOrderStatusToString(status: RailOrderStatus): string {
    return status;
}

export enum PartnerRole {
    CONSIGNOR = 'CONSIGNOR',
    CONSIGNEE = 'CONSIGNEE'
}
