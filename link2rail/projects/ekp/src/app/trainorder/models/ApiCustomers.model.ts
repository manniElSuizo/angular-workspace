
export interface Customer {
    name: string,
    sgvNumber: string
}

export interface CustomerResponse extends Array<Customer> {}

export interface Site {
    name: string,
    partnerId: string
}

export interface SiteResponse extends Array<Site> {}

export interface MarketAreaCustomer {
    customerName: string,
    marketAreaCustomerNumber: string
}

export interface SiteAddress {
    country: string;
    street: string;
    postalCode: string;
    city: string;
}

export interface MarketSegment {
    code: string,
    name: string
}

export interface MarketSegmentResponse extends Array<MarketSegment> {}
