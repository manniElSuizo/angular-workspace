// in Backend: om-internal-api.yaml

export interface SpecialTreatment {
    //code:    type: integer    format: int32
    code: number;
    // name:    type: string
    name: string;
    // includedInPrepaymentNote: boolean;
    includedInPrepaymentNote: boolean;
}

export interface PrepaymentNote {
    code: string;
    text: string;
}

export interface CommercialLocationSummary {
    authority: number;
    locationCode: string;
    locationName: string;
}