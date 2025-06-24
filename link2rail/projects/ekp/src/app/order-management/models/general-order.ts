export interface RailAuthority {
    uicCompanyCode: number;
    name: string;
    abbreviation: string;
}

export interface Country {
    countryCode: string;
    description: string;
    uicCountryCode: number;
}

export interface CommercialLocationSummary {
    name?: string;
    objectKeyAlpha: string;
    objectKeySequence: number;
    companyLocationNumberOwner?: string;
    locationCode: string;
    uicRailAuthorityCode: number;
    uicBorderCode?: number;
}

export interface LoadingPoint {
    locationNumber: number;
    code: string;
    name: string;
    countryCode: string;
}

export interface Product {
    code: string;
    name: string;
}

export interface OrderNumberFilter {
    orderAuthority: number;
    orderNumber: string;
}

export interface DangerousGoodLaw {
    year: number;
    // Date ''yyyy-MM-dd
    validFrom: string;
    // Date ''yyyy-MM-dd
    validTo: string;
    text: string;
}

export enum RailOrderStatus {
    CAPTURED = 'CAPTURED',
    ACCEPTED = 'ACCEPTED',
    SUBMITTED = 'SUBMITTED',
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
    CANCELLED = 'CANCELLED',
    INVALID = 'INVALID',
    WAITING = 'WAITING',
    TRANSMITTED = 'TRANSMITTED',
    EXPIRED = 'EXPIRED'
}

export enum Action {
    EDIT = 'EDIT',
    BOOK = 'BOOK',
    ORDER = 'ORDER',
    CANCEL = 'CANCEL'
}

export interface CodeNamePair {
    code: string;
    name: string;
    shortName?: string;
}