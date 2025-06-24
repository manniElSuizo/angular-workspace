export interface WagonTrackingHistoryRequest {
    // name: wagonNumber in: path description: Wagon identifier required: true example: '338079568253' schema: type: string
    wagonNumber: string;
    orderId: number;
}

export interface WagonTrackingHistory {
    // WagonTrackingHistory: type: object properties:
    trainNumber?: string // trainNumber: type: string example: '47111' 
    eventDateTime: string // eventDateTime: type: string description: Datetime of the tracking event format: date-time example: '2024-07-24T09:37:42Z' 
    infrastructureLocation: InfrastructureLocation // infrastructureLocation: $ref: '#/components/schemas/InfrastructureLocation'
    event : WagonEventType // event: $ref: '#/components/schemas/WagonEventType'
}

export interface InfrastructureLocation {
    // InfrastructureLocation:type: object properties: allOf: $ref: '#/components/schemas/Location'
    // Location: type: object required: - authority - locationCode properties:
    // authority: type: number format: int32 description: Location, where wagon is taken over from previous RU ( referred as GPCP in X RAIL bookings)
    authority: number
    // locationCode: type: string maxLength: 6 description: code of location for GPCP
    locationCode: string
    // locationName: type: string maxLength: 35 description: name of location for GPCP
    locationName?: string
    countryCode?: string // country: type: string maxLength: 2 description: country code of location for GPCP
}

export enum WagonEventType {
    DEPARTURE = 'DEPARTURE',
    PASS_THROUGH = 'PASS_THROUGH',
    ARRIVAL = 'ARRIVAL',
    ACTIVATION = 'ACTIVATION',
    COMPLETION = 'COMPLETION',
    HANDOVER = 'HANDOVER',
    TAKEOVER = 'TAKEOVER'
}