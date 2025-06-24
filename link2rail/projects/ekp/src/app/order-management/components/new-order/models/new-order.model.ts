export interface BasicLocation {
    name: string;
    objectKeyAlpha: string;
    objectKeySequence: number;
}

export enum HandOverTakeOverEnum {
    takeOver = 0,
    handOver = 1
}

export interface HandOverTakeOverOptions {
    value: HandOverTakeOverEnum;
    label: string;
}


export function railOrderServiceTypeToString(serviceType: RailOrderServiceType): string {
    return serviceType;
}

export enum RailOrderServiceType {
    AC = 'AC',
    OM = 'OM',
    LWM = 'LWM',
    PVG = 'PVG',
    TMS = 'TMS',
    LPK = 'LPK'
};

export enum Prepayment {
    TRANSFER = 'TRANSFER',
    PREPAID = 'PREPAID'
}

export enum CurrencyCodeList {
    ALL = 'ALL',
    BAD = 'BAD',
    BAM = 'BAM',
    BGN = 'BGN',
    CAD = 'CAD',
    CHF = 'CHF',
    CZK = 'CZK',
    DKK = 'DKK',
    EEK = 'EEK',
    EUR = 'EUR',
    GBP = 'GBP',
    HRK = 'HRK',
    HUF = 'HUF',
    LTL = 'LTL',
    MKD = 'MKD',
    NOK = 'NOK',
    PLN = 'PLN',
    RON = 'RON',
    RSD = 'RSD',
    RUB = 'RUB',
    SEK = 'SEK',
    SIT = 'SIT',
    SKK = 'SKK',
    TRY = 'TRY',
    USD = 'USD',
    XDR = 'XDR',
  }

  export interface CurrencyCode  {
    code : string,
    name : string 
}
export function getCurrencyList(): CurrencyCode[] {
    return Object.values(CurrencyCodeList).map((code) => ({
      code,
      name: code 
    }));
  }