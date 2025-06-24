
export interface GoodModel {
    
    nhmCode: string;
    description: string;
}

export interface ApiGoodResponse extends Array<GoodModel> {}

export interface WagonCodes extends Array<string> {}

export interface WagonType {
    name?: string;
    code?: string;
    wagonLength?: number;
    wagonWeight?: number;
}

export interface ApiWagonTypeResponse extends Array<WagonType> {}

export interface DangerousGoodModel {
    unCode: string;
    unDescription: string;
}

export interface DangerousGoodObject {
    dangerousGoodsNumber: number,
    unCode: string,
    description: string,
    dangerousGoodsClass: string,
    packingGroup: string,
    dangerLabel1: string,
    dangerLabel2: string,
    dangerLabel3: string,
    dangerLabel4: string,
    dangerLabelInformation: string,
    tremcardNumber: string,
    nagFlag : boolean,
    approvalFlag: boolean,
    restrictionFlag: boolean
}

export interface ApiDangerousGoodResponse extends Array<DangerousGoodModel> {}

export interface DangerousGoodClass {
    name: string;
    code:string;
}

export interface DangerousGoodsClassesResponse extends Array<DangerousGoodClass> {}
