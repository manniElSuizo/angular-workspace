export interface MasterDataCodeType {
    type: string;
    description: string;
    codes: MasterDataCode[];
}

export interface MasterDataCode {
    code: string;
    descriptions: MasterDataCodeDescription[];
}

export interface MasterDataCodeDescription {
    languageCode: string;
    shortDescription: string;
    longDescription: string;
}