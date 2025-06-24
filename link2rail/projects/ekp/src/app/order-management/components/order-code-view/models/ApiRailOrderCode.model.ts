import { BasicListRequest, PagingResponse } from "@src/app/shared/models/paging"
import { CustomerProfile } from "@src/app/trainorder/models/authorization";
import { ListKeyValue } from "@src/app/shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";
import { LocationRequest } from "@src/app/order-management/models/rail-order-api";

export interface RailOrderCodeSearchSummary {
    authorization: string[],
    templateNumber: string,
    templateName: string,
    sendingStation: string,
    pointOfLoadingName: string,
    receivingStation: string,
    pointOfUnloadingName: string,
    consignorName: string,
    consigneeName: string,
    nhmCode: string,
    nhmDescription: string,
    unCode: string,
    unDescription: string
}

export interface RailOrderCodeSummaryRequest extends BasicListRequest {
    orderTemplateNumbers: string[],
    templateNumber: string,
    sendingStations: LocationRequest[],
    receivingStations: LocationRequest[],
    consignorProfiles: CustomerProfile[],
    consigneeProfiles: CustomerProfile[],
    nhmCodes: string[],
    unCodes: string[],
    sendingStationCountryCodes: [],
    receivingStationCountryCodes: [],
    customerProfiles: CustomerProfile[],
}

export interface RailOrderCodeSummaryResponse extends PagingResponse {
    items: RailOrderCodeSearchSummary[];
}

// Storage
export interface RailOrderCodeSummaryRequest4Storage extends RailOrderCodeSummaryRequest {


    templateNumberSearchInput: string,
    templateNumberArray: Array<ListKeyValue>,
    nhmCodesSearchInput: string,
    nhmCodesArray: Array<ListKeyValue>,
    unCodesSearchInput: string,
    unCodesArray: Array<ListKeyValue>,
    sendingStationsCode: Array<ListKeyValue>,
    sendingStationsSearchInput: string,
    receivingStationsCode: Array<ListKeyValue>
    receivingStationsSearchInput: string,
    consignorProfilesCode: Array<ListKeyValue>,
    consignorSearchInput: string,
    consigneeProfilesCode: Array<ListKeyValue>,
    consigneeSearchInput: string
    templateNumberStorage?: ListKeyValue[],
    sendingStationsStorage?: ListKeyValue[];
    receivingStationsStorage?: ListKeyValue[];
    consignorProfilesStorage?: ListKeyValue[];
    consigneeProfilesStorage?: ListKeyValue[];
    nhmCodesStorage?: ListKeyValue[],
    unCodesStorage?: ListKeyValue[],

    receivingStationCountryCodesSearchInput: string;
    sendingStationCountryCodesSearchInput: string;

    sendingStationCountryCodes: [];
    receivingStationCountryCodes: [];

    sendingStationCountryCodesStorage: ListKeyValue[];
    receivingStationCountryCodesStorage: ListKeyValue[];
}

// export interface LocationRequest {
//     objectKeyAlpha: string;
//     objectKeySequence: number;
// }

export interface NHMCodes {
    nhmCode: string;
    description: string;
}

export interface DangerousGood {
    unCode: string;
    unDescription: string;
}
