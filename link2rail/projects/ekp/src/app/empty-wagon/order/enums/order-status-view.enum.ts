export enum OrderStatusViewEnum {
    Canceled = 'CANCELED',
    Created = 'CREATED',
    Dispatched = 'DISPATCHED',
    Draft = 'DRAFT',
    DraftRemoved = 'DRAFT_REMOVED',
    InProcess = 'IN_PROCESS',
    IsTransmitted = 'IS_TRANSMITTED',
    PartialCancellation = 'PARTIAL_CANCELLATION',
    Rejected = 'REJECTED',
    Transmitted = 'TRANSMITTED',
    TransmitFailed = 'TRANSMIT_FAILED',
}

export const OrderStatusTranslations = {
    [OrderStatusViewEnum.Canceled]: 'canceled',
    [OrderStatusViewEnum.Created]: 'created',
    [OrderStatusViewEnum.Dispatched]: 'dispatched',
    [OrderStatusViewEnum.Draft]: 'draft',
    [OrderStatusViewEnum.DraftRemoved]: 'draftRemoved',
    [OrderStatusViewEnum.InProcess]: 'inProcess',
    [OrderStatusViewEnum.IsTransmitted]: 'isTransmitted',
    [OrderStatusViewEnum.PartialCancellation]: 'partialCancellation',
    [OrderStatusViewEnum.Rejected]: 'rejected',
    [OrderStatusViewEnum.Transmitted]: 'transmitted',
    [OrderStatusViewEnum.TransmitFailed]: 'transmitFailed',
};