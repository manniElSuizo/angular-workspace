export interface Role {
    id: number;
    role: string;
    abbreviation: string;
    isInternal: boolean;
    module: string;
    description: string;
    isExclusiveForModule: boolean;
    isRelationRelevant: boolean;
}