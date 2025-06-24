import { AccountsReceivableNumber } from "./accountsreveivablenumber.model";
import { CustomerGroup } from "./customergroup.model";
import { Role } from "./role.model";
import { UserGroup } from "./usergroup.model";
import { WagonKeeper } from "./wagon-keeper.model";

export interface User {
    userId: string,
    userType: AccUserType
    userName: string,
    salutation: string,
    firstname: string,
    lastname: string,
    email: string,
    secondaryEmail?: string,
    phone: string,
    deactivated: boolean,
    primaryGroupId: number;
    roles: Role[] | null,
    roleIds: number[] | null,
    groups: UserGroup[] | null,
    groupIds?: number[] | null,
    customerGroups: CustomerGroup[] | null,
    customerGroupIds?: number[] | null,
    wagonKeepers?: WagonKeeper[];
    accountsReceivableNumbers?: AccountsReceivableNumber[];
    marketAreaCustomerNumber?: number,
    sgvId: string,
    numActiveUserGroups?: string,
    numActiveCustomerGroups?: string,
    numWagonKeepers?: number;
    numAccountsReceivableNumbers?: number;
    customername: string,
    companyLocationNumber: string,
    authorizationsChanged: boolean,
    lastLogin?: Date
}

export enum AccUserTypeFilter {
    INTERNAL = 'Internal', EXTERNAL = 'External', ALL = 'All'
}

export enum AccUserType {
    INTERNAL = 'INTERNAL', EXTERNAL = 'EXTERNAL'
}

export interface UserResponse {
    user: User,
    error?: Error
}

export interface UserSaveResponse {
    userId: number,
    success: boolean,
    errors: Error[]
}

export enum Scope {
    ALL_PROFILES="ALL_PROFILES", CUSTOMER_GROUP="CUSTOMER_GROUP", CUSTOMER_PROFILE="CUSTOMER_PROFILE"
}

export interface UserAuthorizationInfo {
    customerGroup: string;
    userGroup: string;
    authorizationRole: string;
    scope: Scope;
    customer: string;
    authorization: string;
    module: string;
    customerRoles: string[]
    relatedCustomer: string;
    relatedCustomerRole: string
}

export interface UserAuthorizationMatrix {
    authorizations: UserAuthorizationInfo[];
}

export class  UserData {
    userId: number | undefined;
    userType: AccUserType;
    userName: string;
    salutation: string;
    firstname: string;
    lastname: string;
    email: string;
    secondaryEmail: string;
    phone: string;
    groupIds: number[];
    roleIds: number[];
    customerGroupIds: number[];
    wagonKeepers: string[];
    accountsReceivableNumbers: string[];
    primaryGroupId: number;
}


export function emptyUser(): User {
    return {
        userName: '',
        groups: [],
        customerGroups: [],
        marketAreaCustomerNumber: 0,
        sgvId: '',
        userId: '',
        roles: [],
        roleIds: [],
        customername: '',
        companyLocationNumber: '',
        salutation: '',
        firstname: '',
        lastname: '',
        email: '',
        secondaryEmail: '',
        phone: '',
        userType: AccUserType.EXTERNAL,
        deactivated: false,
        primaryGroupId: null,
        authorizationsChanged: false
    }
}
