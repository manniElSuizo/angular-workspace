export interface ApiError {
    errorCode: string;
    title: string;
    detail: string;
    field: string;
}

export interface ApiProblem {
    errorCode: string;
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    errors?: ApiError[]
}

export interface Supplier {
    uicCompanyCode: string;
    name: string;
}

export interface SupplierResponse extends Array<Supplier> {}

export interface WorkingDirection {
    code: string,
    name: string
}

export interface WorkingDirectionsResponse extends Array<WorkingDirection> {}

export interface CommercialService {
    code: string,
    name: string
}

export interface CommercialServiceResponse extends Array<CommercialService> {}

export interface Border {
    uicBorderCode: string,
    name: string
}

export interface BorderResponse extends Array<Border> {}

export interface TomGroupsResponse extends Array<string> {}
