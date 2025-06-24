export interface BasicLocation {
    name: string;
    objectKeyAlpha: string;
    objectKeySequence: number;
}

export interface InfrastructureLocation extends BasicLocation {
    tafTsiPrimaryCode?: string,
    country?: string
}

export interface InfrastructureLocationDisplay extends InfrastructureLocation {
    displayName: string;
}

export interface CommercialOrProductionLocationDisplay extends BasicLocation {
    companyLocationNumberOwner?: string;
    displayName: string;
}

export interface InfrastructureLocationResponse extends Array<InfrastructureLocation> {}

export interface CommercialLocation extends BasicLocation {
    companyLocationNumberOwner?: string;
    locationNumber?: number;
}

export interface CommercialLocationResponse extends Array<CommercialLocation> {}

export interface ProductionLocation extends BasicLocation {
    companyLocationNumberOwner?: string;
}

export interface ProductionLocationResponse extends Array<ProductionLocation> {}

export enum StationType {
    DEPARTURE = 'DEPARTURE',
    DESTINATION = 'DESTINATION'
}
