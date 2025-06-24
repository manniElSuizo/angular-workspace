import { MasterDataCodeType } from "@src/app/shared/models/masterdata-code-translations";
import { BasicListRequest, PagingResponse } from "@src/app/shared/models/paging";

export interface VehicleKeeperSummaryRequest extends BasicListRequest {
    // Wagenhalter
    vehicleKeeperCodes?: string[];
    // Wagennummer
    vehicleNumber?: string;
    // Wagengattung
    vehicleTypes?: string[];
    // Schadcode
    damageTypes?: string[];
    // Lauffähigkeit
    suitableForRunning?: string;
    // Land
    lastStatusCountryCode?: string;
    // Standort
    lastStatusLocationNames?: string[];
}

export interface VehicleKeeperSummaryResponse extends PagingResponse {
    items: VehicleSummaryForVehicleKeeper[];
    masterDataCodeTypes: MasterDataCodeType[];
}

export interface VehicleSummaryForVehicleKeeper {
    vehicleNumber: string;
    vehicleKeeperCode: string;
    internationalFreightWagonClass: string;
    nationalFreightWagonClass: string;
    seriesGroupNr: string;
    typeOfConstruction: string;
    suitableForRunning: SuitableForRunning;
    damageTypes: DamageCodeWithDescription[];
    lastStatus: Trackingstatus;
}

export interface SuitableForRunning {
    code: string;
    description: string;
}

export interface DamageCodeWithDescription {
    code: string;
    description: string;
}

export interface Trackingstatus {
    statusCode: string;
    statusDescription: string;
    statusDate: Date;
    location: Location;
}

export interface Location {
    authority:string;
    code: string;
    name: string;
    country: Country;
}

export interface Country {
    code: string;
    name: string;
}
