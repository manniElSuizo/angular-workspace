export enum PermissionType {
    READ = "Read",
    WRITE = "Write"
};

export interface Permission {
    object: string;
    type: PermissionType[];
};