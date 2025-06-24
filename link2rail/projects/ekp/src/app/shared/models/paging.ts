import { CustomerProfile } from "@src/app/trainorder/models/authorization";
export interface PagingRequest {
  offset: number,
  limit: number,
  sort?: string
}

export interface PagingResponse {
    offset: number,
    limit: number,
    total: number
}

export interface CustomerProfilesRequest {
  customerProfiles?: CustomerProfile[];
}

export interface BasicListRequest extends PagingRequest {}
export interface BasicListRequestCustomerProfiles extends BasicListRequest, CustomerProfilesRequest {};
