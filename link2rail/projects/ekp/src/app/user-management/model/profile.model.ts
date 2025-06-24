import { Role } from "./role.model";

export interface CustomerProfileSaveResponse {
    profileId: number,
    success: boolean,
    errors: Error[]
}

export interface CustomerProfile {
    id?: number;
    tomGroup: TomGroup | undefined;
    completionStatus?: ProfileStatusType;
    changed?: boolean;
    changeAmount?: number;
    customerProfileId: number;
    sgv: Sgv;
}


export interface Sgv {
    marketAreaCustomerNumber: string;
    customerName: string;
    companyLocationNumber: string;
    siteName: string;
    sgvId: string;
}

export interface CustomerProfileResponse {
    customerProfiles: CustomerProfile[],
    errors: Error[]
}

export interface TomGroup {
    description: string;
    id: number;
    groupName: string;
}

export interface CustomerRelationData {
    relationId: number;
    granteeCustomerProfileId: number;
}

export interface CustomerRelation {
    relationType: CustomerRelationType,
    grantorCustomer: CustomerProfile,
    granteeCustomer: CustomerProfile
}

export interface CustomerRelationType {
    id: number,
    relatioName: string,
    customerRole: string,
    relatedCustomerRole: string
}

export interface CustomerProfileDetails {
    id?: number;
    customerProfileId?: number;
    sgv: Sgv;
    tomGroup: TomGroup | undefined;
    grantorRelations: CustomerRelation[];
    granteeRelations: CustomerRelation[];
}

export class CustomerProfileData {
    customerId: number | undefined;
    customerProfileId: number | undefined;
    sgvId: string;
    companyLocationNumber: string | undefined;
    tomGroupId: number | undefined;
    grantorRelations: CustomerRelationData[] | undefined;
}

export enum ProfileStatusType {
    INCOMPLETE = 'INCOMPLETE',
    COMPLETE = 'COMPLETE',
    CREATED = 'CREATED',
    NOT_CREATED = 'NOT_CREATED',
    ALL = 'ALL'
}

export interface CustomerProfileSave {
    customerId?: number | null,
    customerProfileId?: number | null,
    sgvId: string | null,
    companyLocationNumber: string | null,
    tomGroupId: number | null | undefined
}