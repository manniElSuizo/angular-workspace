import { CustomerProfile } from "./profile.model";
import { Role } from "./role.model";
import { UserGroup } from "./usergroup.model";

export interface CustomerGroup {
    id?: number;
    groupName: string;
    userGroups: UserGroup[];
    userGroupIds: number[];
    roles: Role[];
    roleIds: number[];
    numGroups?: number;
}

export interface CustomerGroupResponse {
    group: CustomerGroup,
    error?: Error
}

export interface CustomerGroupSaveResponse {
    customerGroupId: number,
    success: boolean,
    errors: Error[]
}

export class CustomerGroupData {
    groupId?: number;
    groupName: string;
    roleIds: number[];
    userGroupIds: number[];
}

export function emptyGroup(): CustomerGroup {
    return {
        groupName: '',
        roles: [],
        roleIds: [],
        userGroups: [],
        userGroupIds: [],
    }
}