import { CustomerProfile } from "./profile.model";
import { Role } from "./role.model";

export interface UserGroup {
    groupId?: number;
    groupName: string;
    customerProfile?: CustomerProfile;
    roles: Role[];
    roleIds: number[];
    relationRoles: Role[];
    relationRoleIds: number[];
}

export interface UserGroupResponse {
    group: UserGroup,
    error?: Error
}

export interface UserGroupSaveResponse {
    groupId: number,
    success: boolean,
    errors: Error[]
}

export class UserGroupData {
    groupId?: number;
    groupName: string;
    profileId: number;
    roleIds: number[];
    relationRoleIds: number[];
}

export function emptyGroup(): UserGroup {
    return {
        groupName: '',
        roles: [],
        roleIds: [],
        relationRoles: [],
        relationRoleIds: [],
    }
}