import { Action, RailOrderStatus } from "@src/app/order-management/models/general-order";
import { OrderKey } from "../components/wagon-view/models/api-wagon-list";
import { RailOrderStage } from "../components/wagon-view/models/api-wagon-list";
import { RailOrderServiceType, railOrderServiceTypeToString } from "../components/new-order/models/new-order.model";
import { Authorization } from "@src/app/trainorder/models/authorization";

export interface BorderAndCommercialLocationSummary {
    //type: object
    // required:  - objectKeyAlpha  - objectKeySequence

    //  name:     type: string  description: Name of the infrastructure location at this border example: "Karlsruhe"
    name?: string;
    // objectKeyAlpha:     type: string    description: Object key alpha of the infrastructure location example: 'HAMELN'
    objectKeyAlpha: string;
    //  objectKeySequence:     type: integer    format: int64    description: Object key sequence of the infrastructure location     example: 1
    objectKeySequence: number;
    // uicBorderCode:     type: integer    format: int32
    uicBorderCode?: number;
    // uicRailAuthorityCode:     type: integer    format: int32
    uicRailAuthorityCode?: number;

    // Commercial Location Attributes
    // companyLocationNumberOwner        companyLocationNumberOwner: type: string
    companyLocationNumberOwner?: string;
    // locationCode: type: string
    locationCode: string;

}

export interface AttachedDocument {
    // required: - code
    // code: type: string maxLength: 3 description: codified type of the document
    code: string,
    //description: type: string maxLength: 70 description: description of document type
    description?: string,
    // dateOfIssue: type: string format: date description: date, when document was generated on issued
    dateOfIssue?: Date,
    // numberOfOriginals: type: integer minimum: 0 maximum: 99 description: Number of originals of that document handed over
    numberOfOriginals?: number,
    // referenceNumber: type: string maxLength: 35 description: identifying reference number of document
    referenceNumber?: string
}

export interface SpecialTreatmentCharging {
    // startAuthority: type: integer format: int32 maximum: 99 description: Start IM Code of charging section, in which extra charge has to be charged
    startAuthority?: number;
    // startLocationCode: type: string maxLength: 6 description: Start Location Code of charging section, in which extra charge has to be charged
    startLocationCode?: string;
    // startBorderCode: type: integer format: int32 maximum: 999 description: Start Border Code of charging section, in which extra charge has to be charged
    startBorderCode?: number;
    //endAuthority: type: integer format: int32 maximum: 99 description: End IM Code of charging section, in which extra charge has to be charged
    endAuthority?: number;
    // endLocationCode: type: string maxLength: 6 description: End Location Code of charging section, in which extra charge has to be charged
    endLocationCode?: string;
    // endBorderCode: type: integer format: int32 maximum: 999
    endBorderCode?: number;
    // prepayment: type: string maxLength: 10 description: (In case of Transit it has not to be marked as payed by consignor (free) in the consignment note)
    prepayment?: string;
    // amount: type: number maximum: 99999.99 multipleOf: 0.01 description: amount of money prepaid by consignor for special treatment on the actual charging section
    amount?: number;
};

export interface SpecialTreatmentOrderUTI {
    // loadUnitPrefix: type: string maxLength: 4 description: intermodal transport unit for which service was executed;visualized by subordinate under load unit in 'All Line Items View'
    loadUnitPrefix: string;
    // loadUnitNumber: type: string maxLength: 12 description: intermodal transport unit for which service was executed;visualized by subordinate under load unit in 'All Line Items View'
    loadUnitNumber: string;
};

export interface Location {
    // authority: type: integer format: int32 maximum: 99 // description: Location, where wagon is taken over from previous RU ( referred as GPCP in X RAIL bookings description
    authority: number;
    // locationCode: type: string maxLength: 6 description: code of location for GPCP
    locationCode: string;
    // locationName: type: string maxLength: 35 description: name of location for GPCP
    locationName?: string;
};

export interface ProductionLocation extends Location {
    //additionalProperties: false
    // allOf: - $ref: "#/components/schemas/Location"
};

export interface SpecialTreatmentOrder {
    // productName: type: string maxLength: 128 description: name of special treatment product, for example 'exceptional consignment'
    productName?: string;
    // info: type: string maxLength: 40 description: additional information for the special treatment (freetext)
    info?: string;
    // productExtraChargeCode: type: integer format: int32 maximum: 999 description: codification of extra charge for additional service
    // TODO In Komponente NewOrderService gibt es eine Liste für diese Codes. Wenn in der Liste der hier angegebene Code vorkommt, soll diese Serviceleistung in
    // der Oberfläche angezeigt werden.
    productExtraChargeCode: number;
    // authority: type: integer format: int32 maximum: 99 description: codification of extra charge for additional service
    authority?: number;
    //locationCode: type: string maxLength: 6 description: railway location where special treatment is executed
    locationCode?: string;
    //locationName: type: string maxLength: 35 description: railway location where special treatment is executed
    locationName?: string;
    // includedInPrepaymentNote: type: boolean description: indication wether special Service has to be included in the prepayment note on consignment note level. (The special treatments already included in the prepayment of the consignor, always are known at consignment note creation time) type: type: string maxLength: 5 description: Type of Special treatment, e.g. Weighing; Customs Services, etc
    // TODO Kommerziell -> weitere Eingaben -> einschl. Nebengebührencodes: wenn dieses Flag gesetzt ist, wird der productExtraChargeCode hier angezeigt
    includedInPrepaymentNote?: boolean;
    type?: string;
    // specialTreatmentChargings: uniqueItems: true type: array maxItems: 15 items: $ref: "#/components/schemas/SpecialTreatmentCharging"
    specialTreatmentChargings?: SpecialTreatmentCharging[];
    // specialTreatmentOrderWagonPositions: uniqueItems: true type: array items: type: integer format: int32 maxItems: 99
    specialTreatmentOrderWagonPositions?: number[];
    // specialTreatmentOrderUTIs: uniqueItems: true type: array items: $ref: "#/components/schemas/SpecialTreatmentOrderUTI" maxItems: 396
    specialTreatmentOrderUTIs?: SpecialTreatmentOrderUTI[]
    // productionNode: $ref: "#/components/schemas/ProductionLocation"
    productionNode?: ProductionLocation;
};

export interface ExternalReference {
    // type: type: string maxLength: 3 description: Type, which uniquely defines the actual reference number
    type: string;
    // description: type: string maxLength: 35 description: Text which describes the actual reference number
    description?: string;
    // identifier: type: string maxLength: 35 description: reference number
    identifier?: string;
    // subType: type: string maxLength: 10 description: Used for the customs procedure type
    subType?: string;
};

export interface LoadingPoint {
    // country: type: string maxLength: 2 description: Country of location / track where loading of wagon is accomplished. Could be a Location within the Harbor area.
    country?: string;
    // code: type: integer format: int32 maximum: 999999 description: Code of location / track where loading of wagon is accomplished.Could be a Location within the Harbor area.
    code?: string;
    // name: type: string maxLength: 40 description: Name of location / track where loading of wagon is accomplished.Could be a Location within the Harbor area.
    name?: string;
    // countryDescription: type: string codeDescription: type: string maxLength: 15 description: number of loading point without reference to any master data as passed by ECN
    countryDescription?: string;
    codeDescription?: string;
    // nameDescription: type: string maxLength: 35 description: description of loading point without reference to any master data as passed by ECN
    nameDescription?: string;
};

// export interface ParkingPosition {
//     // required: - authority - locationCode - subLocation - subLocationSeqNumber
//     // authority: type: integer format: int32 maximum: 99 description: Authority
//     authority: number;
//     // locationCode: type: string maxLength: 6 description: Location
//     locationCode: number;
//     // subLocation: type: integer format: int32 maximum: 99 description: Sub location
//     subLocation: number;
//     // subLocationSeqNumber: type: integer format: int32 maximum: 9999 description: Sub location sequence
//     subLocationSeqNumber: number;
// };

export interface OperationalTransportConditions {
    // specialTransportationPlanDescription: type: string maxLength: 250 description: freetext description of transportation plan
    // specialTransportationPlanDescription?: string;
    // additionalBorderDigit: type: integer format: int32 maximum: 9999 description: additional digit (Grenzausgangszusatzziffer) to support train arrangement at border exit
    // additionalBorderDigit?: number;
    // domesticTransport: type: boolean description: indication whether transport is domestic
    // domesticTransport?: boolean;
    // pointOfLoading: $ref: "#/components/schemas/LoadingPoint"
    pointOfLoading?: LoadingPoint;
    // pointOfUnloading: $ref: "#/components/schemas/LoadingPoint"
    pointOfUnloading?: LoadingPoint;
    // acceptancePointParkingPosition: $ref: "#/components/schemas/ParkingPosition"
    // acceptancePointParkingPosition?: ParkingPosition;
    // // deliveryPointParkingPosition: $ref: "#/components/schemas/ParkingPosition"
    // deliveryPointParkingPosition?: ParkingPosition;
    // acceptancePointProductionNode: $ref: "#/components/schemas/ProductionLocation"
    acceptancePointProductionNode?: ProductionLocation;
    // deliveryPointProductionNode: $ref: "#/components/schemas/ProductionLocation"
    deliveryPointProductionNode?: ProductionLocation;
};

export interface PrepaymentUpTo {
    // authority: type: integer format: int32 maximum: 99 description: Infrastructure Manager Code of border Crossing location up to which payment for carriage was done
    authority?: number;
    // locationCode: type: string maxLength: 6 description: Location code of border Crossing location up to which payment for carriage was done
    locationCode?: string;
    // locationName: type: string maxLength: 35 description: Location name of border Crossing location up to which payment
    locationName?: string;
    // borderCode: type: integer format: int32 maximum: 999 description: Code of border up to which prepayment was done by consignor
    borderCode?: number;
    // borderName: type: string maxLength: 35 description: description of border
    borderName?: string;
    // borderDescription: type: string maxLength: 35 description: Freetext description of border up to which, prepayment of consignor is done
    borderDescription?: string;
};

// export interface CashOnDelivery {
//     // price: type: number maximum: 9999999999999.99 multipleOf: 0.01 description: In case of payment of delivery, i.e. if payment of shipment is done by consignee, amount and currency of money which has to be charged
//     price?: number;
//     // currency: type: string maxLength: 3 description: In case of payment of delivery, i.e. if payment of shipment is done by consignee, amount and currency of money which has to be charged
//     currency?: string;
//     // certificateNumber: type: string maxLength: 13 description: number / Identifier of certificate which documents the obligation of payment by consignee
//     certificateNumber?: string;
//     // dateTimeOfCertificate: type: string format: date-time description: Date and time of certificate
//     dateTimeOfCertificate?: string;
// };

export interface CurrencyValue {
    // price: type: number maximum: 9999999999999.99 multipleOf: 0.01
    price?: number;
    // currency: type: string maxLength: 3 description: Currency code. example: EUR
    currency?: string;
};

export interface CustomerID {
    // ownerOfCustomerId: type: string maxLength: 4 description: Owner of customer id. That is code of RU who has defined the customer id (for DBSR = 80)
    ownerOfCustomerId?: string;
    // authorityOfCustomerId: type: integer format: int32 maximum: 99 description: Authority of the customer id;
    authorityOfCustomerId?: number;
    // sgv: type: string maxLength: 10 description: Customer id
    sgv?: string;
};

export interface PartnerID {
    // ownerOfPartnerId: type: string maxLength: 4 description: Owner of partner Id
    ownerOfPartnerId?: string;
    // site: type: string
    site?: string;
};

export interface FreightpayerTransit {
    // name: type: string maxLength: 45 description: Name of customer who has to be invoiced
    name?: string;
    // customerId: $ref: "#/components/schemas/CustomerID"
    customerId?: CustomerID;
    // partnerId: $ref: "#/components/schemas/PartnerID"
    partnerId?: PartnerID;
};

export interface SectionalInvoicing {

    // required: - sectionalInvoicingCarrierCode
    // sectionalInvoicingCarrierCode: type: string maxLength: 4 description: RU Code of Carrier who accomplishes invoicing to customer on a section
    sectionalInvoicingCarrierCode?: string;
    // sectionalInvoicingCarrierName: type: string maxLength: 45 description: Name of Carrier who accomplishes invoicing to customer on a section
    sectionalInvoicingCarrierName?: string;
    // startAuthority: type: integer format: int32 maximum: 99 description: IM Code of first country of section, for which sectional invoicing is to be performed
    startAuthority?: number;
    // endAuthority: type: integer format: int32 maximum: 99 description: IM Code of last country of section, for which sectional invoicing is to be performed
    endAuthority?: number;
    // executingCarrierRUCode: type: string maxLength: 4 description: RU Code of carrier for which sectional invoicing has to be performed
    executingCarrierRUCode?: string;
    // executingCarrierName: type: string maxLength: 45 description: Name of carrier for which sectional invoicing has to be performed
    executingCarrierName?: string;
    // freightpayerTransit: $ref: "#/components/schemas/FreightpayerTransit"
    freightpayerTransit?: FreightpayerTransit;
};

export interface ChargingSection {
    // required: - startAuthority
    // detourKM: type: number maximum: 99999.99 multipleOf: 0.01 description: Km to travel and therefore to charge because of exceptional consignment for example associated with extra charge code 235 (surcharge because of exceptional consignment)
    detourKM?: number;
    // detourZones: type: integer format: int32 maximum: 99999 description: Zones to travel and therefore to charge because of exceptional consignment for example associated with extra charge code 235 (surcharge because of exceptional consignment)
    detourZones?: number;
    // startAuthority: type: integer format: int32 maximum: 99 description: starting location of charging section. IM code of country.
    startAuthority?: number;
    // startLocationCode: type: string maxLength: 6 description: starting location of charging section:location code of location if location is indicated
    startLocationCode?: string;
    // startBorderCode: type: integer format: int32 maximum: 999 description: starting location of charging section:code of border crossing if border is indicated
    startBorderCode?: number;
    // startDescription: type: string maxLength: 20 description: starting location of charging section:additional freetext description
    startDescription?: string;
    // endAuthority: type: integer format: int32 maximum: 99 description: End location of charging section. IM code of country
    endAuthority?: number;
    // endLocationCode: type: string maxLength: 6 description: End location of charging section:location code of location if location is indicated
    endLocationCode?: string;
    // endBorderCode: type: integer format: int32 maximum: 999 description: End location of charging section:code of border crossing if border is indicated
    endBorderCode?: number;
    // endDescription: type: string maxLength: 20 description: end location of charging section:additional freetxt description
    endDescription?: string;
    // globalIndicator: type: boolean description: indicator wether this is one global charging section for that whole shipment
    globalIndicator?: boolean;
    // consignorsCharge: type: number maximum: 99999999.99 multipleOf: 0.01 description: fixed amount of money known in advance, the consignor is already charged for the charging section concerned. This sum later on has to be subtracted from chargement of consignee.
    consignorsCharge?: number;
    // consigneesCharge: type: number maximum: 99999999.99 multipleOf: 0.01 description: fixed amount of money known in advance, the consignee is to charge for the charging section concerned. This sum later on has to be subtracted from chargement of consignee.
    consigneesCharge?: number;
    // currency: type: string maxLength: 3 description: currency which has to be used on the charging section concerned
    currency?: string;
    // nhmCode: type: string maxLength: 6 description: NHM (nomenclature harmoniseee des marchandises) code as defined internatl. NHM register
    nhmCode?: string;
    // tariffNumber: type: string maxLength: 7 description: Tariff number to be applied for freight calculation on the actual charging section
    tariffNumber?: string;
    // freightWeight: type: number maximum: 99999999.99 multipleOf: 0.01 description: actual weight of freight in KG which serves as base of freight calculation. The freight weight is the sum of the commodities loaded + all loading tackles of the customer (loading tackles which are not indicated private) + fixed freight for every protection wagon (recognizable by NHM Nr and Tarf Nr). The freight rate is preset by the system but may be override by the user
    freightWeight?: number;
};

export interface CommercialTransportConditions {
    // prepaymentNote: type: string maxLength: 4 description: 'Code of declaration of prepayment (prepayment already done by consignor / freightpayer at shipping site) can be done as i) alphanumeric indicator (then it is an incoterm code) ii) numeric indicator (then it is an prepayment code)'
    prepaymentNote?: string;
    // prepaymentNoteRailway: type: integer format: int32 maximum: 99
    // prepaymentNoteRailway?: number;
    // chargesNote: type: boolean description: Indicator that special note to consignor for prepayment has to be supplied / printed out
    // chargesNote?: boolean;
    // discountCode: type: string maxLength: 10 description: code (freetext) justifying a discount
    discountCode?: string;
    // amountPrepaid: type: number maximum: 9999999999999.99 multipleOf: 0.01 description: amount of money prepaid by consignor for freight
    // amountPrepaid?: number;
    // prepaymentUpTo: $ref: "#/components/schemas/PrepaymentUpTo"
    prepaymentUpTo?: PrepaymentUpTo;
    // cashOnDelivery: $ref: "#/components/schemas/CashOnDelivery"
    // cashOnDelivery?: CashOnDelivery;
    // valueOfDelivery: $ref: "#/components/schemas/CurrencyValue"
    valueOfDelivery?: CurrencyValue;
    // valueOfCommodity: $ref: "#/components/schemas/CurrencyValue"
    valueOfCommodity?: CurrencyValue;
    // sectionalInvoicings: uniqueItems: true type: array maxItems: 30 items: $ref: "#/components/schemas/SectionalInvoicing"
    sectionalInvoicings?: SectionalInvoicing[];
    // chargingSections: uniqueItems: true type: array maxItems: 15 items: $ref: "#/components/schemas/ChargingSection"
    chargingSections?: ChargingSection[];
};

export interface SubsequentOrder {
    // required: - type - clientAgent - dbAgent - dateAndTime
    // type: type: string maxLength: 10 description: Type of subsequent order (temporary stop / Anhalten ; Redirection/ Umverfuegung )
    type: string;
    //clientAgent: type: string maxLength: 20 description: person an client site who requested the change / subsequent order (nachtraegliche Verfuegung)
    clientAgent: string;
    // dbAgent: type: string maxLength: 20 description: person an DB site site which accepted the change / subsequent order (nachtraegliche Verfuegung)
    dbAgent: string;
    // dateAndTime: type: string format: date-time description: date and time when subsequent order was accepted at DB Schenker Rail
    dateAndTime: Date;
    // comment: type: string maxLength: 350 description: special remark, as for example the reason of subsequent order
    comment?: string;
};

export interface ChargesNoteReturn {
    // name: type: string maxLength: 50 description: indicates the name the charges note should be returned to
    name?: string;
    // address: type: string maxLength: 45 description: indicates the address the charges note should be returned to
    address?: string;
    // zipCode: type: string maxLength: 9 description: indicates the zip code the charges note should be returned to
    zipCode?: string;
    // city: type: string maxLength: 35 description: indicates the city the charges note should be returned to
    city?: string;
};

export interface Printer {
    // required: - documentType - printerName
    // printerName: type: string maxLength: 20 description: name of printer where consignment note was issued
    printerName: string;
    // documentType: type: string maxLength: 10 description: document type for the print out, for which the corresponding printer is used
    documentType: string;
};

export interface ConsignmentNote {
    // deliveryNoteCreated: type: boolean description: indicator that a delivery not was created upon the arrival of the first wagon
    deliveryNoteCreated?: boolean;
    // consignmentNumber: type: integer format: int32 maximum: 999999 description: Number of consignment, used to identify consignment by customer and railway undertaken
    consignmentNumber?: number;
    // shippingRailway: type: string maxLength: 4 description: Railway Undertaker / shipping carrier issuing the Number of consignment
    shippingRailway?: string;
    // typeOfConsignment: type: string maxLength: 10 description: Type of consignment specifying which type of document has to be printed
    typeOfConsignment?: TypeOfConsignment;
    // printDate: type: string format: date-time description: Date and time, when original of consignment note was printed
    printDate?: Date;
    // generationDate: type: string format: date-time description: For orders originated in other OM Systems (like ZAB, LPK) the date of generation is transferred via ECN XML
    generationDate?: Date;
    //versionNumber: type: integer format: int32 maximum: 99 description: Version of consignment as made available to other railways starting with 0, when consignment is announced the first time to other railways and incremented by one anytime a consignment note change is made public. Used in communication with ZAB and LPK and later Orfeus
    versionNumber?: number;
    //ecNConfiguration: type: string maxLength: 10 description: Configuration, of how information exchange within electronic consignment note has to be done
    ecNConfiguration?: string;
    // ecNStatus: type: string maxLength: 10 description: Status of Information exchange with ECN (e.g. ECN active, ECN On Hold, Print Notification, etc.)
    ecNStatus?: string;
    // printTemplate: type: string maxLength: 10 description: Definition of language version of CIM template to be used; preset, when entering new order according to user language chosen by using appropriate URL at system start
    printTemplate?: string;
    // printConfiguration: type: string maxLength: 10 description: Configuration, of consignment note print out concrete which documents / exemplars have to be printed
    printConfiguration?: string;
    // printLanguage: type: string maxLength: 3 description: Language which should be used for the consignment note print
    printLanguage?: string;
    // footerRuCode: type: string maxLength: 4 description: RU Code of the carrier specified in the footer of the mail (contractual or other carrier with flag "ORDER transfer EOM" set in the account)
    footerRuCode?: string;
    //printDescriptor: type: string maxLength: 10 description: indicates which documents (especially parts of the Consignment Note ) already was printed by EOM or other partner
    printDescriptor?: string;
    // printEnforcement: type: boolean description: Check box for user to manually enforce consignment note print out, even if according to existing configurations consignment note would be not printed out
    printEnforcement?: boolean;
    // printSuppression: type: boolean description: Check box for user to manually suppress consignment note print out, even if according to existing configurations consignment note would be printed out
    printSuppression?: boolean;
    // printLabel: type: string maxLength: 20 description: label that is printed in field 30 of the consignment note, if the consignment note was already printed before (indication of a duplicate)
    printLabel?: string;
    // additionalInfo: type: string maxLength: 350 description: ECN freetext (for multiple operational Hints ) for print out in Field 21
    additionalInfo?: string;
    // wagonLabelRequired: type: boolean description: indicates whether Wagon Label (Hauptzettel) is required
    wagonLabelRequired?: boolean;
    // subsequentOrder: $ref: "#/components/schemas/SubsequentOrder"
    subsequentOrder?: SubsequentOrder;
    // chargesNoteReturn: $ref: "#/components/schemas/ChargesNoteReturn"
    chargesNoteReturn?: ChargesNoteReturn;
    // printers: uniqueItems: true type: array maxItems: 5 items: $ref: "#/components/schemas/Printer"
    printers?: Printer[];
};

export interface CustomsPrincipal {
    // required: - ruCode
    // ruCode: type: string maxLength: 4 description: RU Code of responsible carrier, who is responsible for customs procedure towards customs
    ruCode: string;
    // name: type: string maxLength: 70 description: Name of responsible carrier, who is responsible for customs procedure towards customs
    name: string;
};

export interface CustomsData {
    // additionalCustomsProcedure: type: string maxLength: 2 description: codified additional customs procedure applied for that order, especially used for transport from and to Hamburg
    additionalCustomsProcedure?: string;
    // transitProcedure: type: string maxLength: 30 description: customs procedure applied for the shipment, could be simplified common shipment procedure
    transitProcedure?: string;
    // customsDescriptor: type: string maxLength: 1 description: indication in which way DB Schenker Rail has to care about customs procedures
    customsDescriptor?: string;
    // customsNote: type: string maxLength: 350 description: special note from customs, in some cases has to printed out
    customsNote?: string;
    // customsPrincipal: $ref: "#/components/schemas/CustomsPrincipal"
    customsPrincipal?: CustomsPrincipal;
};

export interface HandoverConditions {
    //  allOf:       - $ref: '#/components/schemas/DT_INT_1'  description: codified type of handover conditions for intermodal transports,        which specifies in which way the load unit is delivered picked by DB Schenker      to next partner
    typeOfHandover: number,
    // allOf:      - $ref: '#/components/schemas/DT_CHAR_35'  description: name of shipowner (Reeder), for ship to which transport unit    is handed over
    shipOwner?: string;
    // shipName: type: string maxLength: 35 description: name of ship which delivers transport unit
    shipName?: string;
    // scheduled date type: string format: date-time description: scheduled date / time of arrival of ship
    departure?: string;
    // destinationPort: type: string maxLength: 35 description: name of origin port of sea ship
    destinationPort?: string;
}

export interface TakeOverConditions {
    // typeOfTakeover: type: integer format: int32 maximum: 9 description: codified type of takeover conditions for intermodal transports, which specifies in which way the load unit is picked up by DB Schenker from previous partner
    typeOfTakeover?: number;
    // shipOwner: type: string maxLength: 35 description: name of shipowner (Reeder) of ship which delivers transport unit
    shipOwner?: string;
    // shipName: type: string maxLength: 35 description: name of ship which delivers transport unit
    shipName?: string;
    // arrival: type: string format: date-time description: scheduled date / time of arrival of ship
    arrival?: string;
    // originPort: type: string maxLength: 35 description: name of origin port of sea ship
    originPort?: string;
    // loadingAuthorisation: type: string maxLength: 30 description: authorisation of customer to load goods on wagons
    loadingAuthorisation?: string;

};

export interface Seal {
    // type: type: string maxLength: 2 description: Type of actual seal, used to enclose transport unit
    type?: string;
    // referenceNumber: type: string maxLength: 10 description: Reference Number of seal, used to enclose actual transport unit
    referenceNumber?: string;
};


export interface DangerousGood {
    referenceId?: string;
    // classificationCode: type: string maxLength: 4 description: dangerous good classification Code according to RID classification
    classificationCode?: string;
    // class: type: string maxLength: 4 description: dangerous good class, not defined in dangerous good data base, in some case may be derived from classification code
    class?:string;

    type?: string;
    // description: type: string maxLength: 350 description: description of dangerous good as defined in RID registers
    description?: string;
    // unNr: type: string maxLength: 4 description: UN Number of dangerous good as defined in RID registers
    unNr?: string;
    // dangerIdentificationNumber: type: string maxLength: 4 description: "danger identification number (Gefahrnummer) "
    dangerIdentificationNumber?: string;
    // explosiveMass: type: number maximum: 999999.99 multipleOf: 0.01 description: mass of explosive material in KG
    explosiveMass?: number;
    // weight: type: number maximum: 999999.99 multipleOf: 0.01 description: complete weight of dangerous good described
    weight?: number;
    //emptyNotCleansed: description: indicator whether dangerous good position corresponds to empty not cleansed container or wagon type: boolean
    emptyNotCleansed?: boolean;
    // emptyPackingUnit: type: string maxLength: 3 description: code of empty units, which might have rests of dangerous good, loaded previously in that unit
    emptyPackingUnit?: string;
    // emptyPackingDescription: type: string maxLength: 35 description: description of empty units, which might have rests of dangerous good, loaded previously in that unit
    emptyPackingDescription?: string;
    // packingGroup: type: string maxLength: 3 description: Code of group of packing as defined by the RID
    packingGroup?: string;
    // specialInstruction: type: string maxLength: 350 description: Special Instruction as 'environmental danger' corresponding to dangerous good transport.
    specialInstruction?: string;
    // restrictionFlag: description: indicator that transportation of dangerous good is prohibited type: boolean
    restrictionFlag?: boolean;
    // additionalInformation: type: string maxLength: 350 description: freetext additional information for goods, if not defined in dangerous good description (NAG, unless otherwise specified.)
    additionalInformation?: string;
    // previousLoadedGoodNHM: type: string maxLength: 6 description: nhm code of last good loaded in case of dangerous good position concerning empty not cleansed wagon or intermodal transport unit
    previousLoadedGoodNHM?: string;
    // previousLoadedGoodDescription: type: string maxLength: 350 description: freetext description of last good loaded in case of dangerous good position concerning empty not cleansed wagon or intermodal transport unit
    previousLoadedGoodDescription?: string;
    // wasteIndicator: description: indicator that good contains waste and there for has to be registered at respective waste registry type: boolean
    wasteIndicator?: boolean;
    // dangerLabels: items: type: string maxLength: 10 description: 'standardized code (e.g.: 1.; 6, 2.3) of first occurrence of dangerous good labels for actual dangerous good position' maxItems: 5 type: array
    dangerLabels?: string[];
    // dangerLabelInfo: type: string maxLength: 2048
    dangerLabelInfo?: string;
    // approvalFlag: type: boolean
    approvalFlag?: boolean;
    // accidentInformationSheetNr: type: string
    accidentInformationSheetNr?: string;
     // nagFlag
     nagFlag?: boolean;
};

export interface PackingID {
    // required: - packingID
    // packingId: type: string maxLength: 35 description: special ID of good indicated on package of good
    packingId: string;
};

export interface PackingUnit {
    // required: - type
    // number: type: integer format: int32 maximum: 99 description: number of packings of the type indicated used for that good
    number?: number;  // Anzahl
    // type: type: string maxLength: 5 description: Code of type of packing, used for that good
    type: string;         // Verpackung
    // description: type: string maxLength: 125 description: description of type of packing defined by packing code
    description?: string;
};

export interface Goods {
    referenceId?: string;
    // nhmCode: type: string maxLength: 6 description: nhm (nomenclature harmoniseee des marchandises) code as defined in nhm register
    nhmCode?: string;
    // nhmDescription: type: string maxLength: 350 description: nhm (nomenclature harmoniseee des marchandises) description as defined in nhm register
    nhmDescription?: string;
    // additionalDescription: type: string maxLength: 350 description: optional additional goods description
    additionalDescription?: string; // Zusatzinfo
    // additionalDeclarationCode: type: string maxLength: 2 description: code of additional declaration out of a set of possible declarations
    additionalDeclarationCode?: string;
    //additionalDeclaration: type: string maxLength: 500 description: additional declaration out of a set of possible declarations
    additionalDeclaration?: string;
    // weight: type: number maximum: 999999.99 multipleOf: 0.01 description: weight of actual good in KG
    weight?: number;
    // volume: type: number minimum: 99999.99 multipleOf: 0.01 description: volume of good as measured by measuring unit
    volume?: number;
    // unit: type: string maxLength: 30 description: volume measuring unit as for example ltr, gallon, barrel
    unit?: string;
    // wasteId: type: integer format: int32 maximum: 999999 description: reference number under which registration at waste registry was done
    wasteId?: number; //AVV-Schlüssel
    // customsReferenceNumber: type: string maxLength: 8 description: reference number to goods position for customs
    customsReferenceNumber?: string; //Zolltarif-NR
    // dangerousGoods: uniqueItems: true type: array maxItems: 50 items: $ref: "#/components/schemas/DangerousGood"
    dangerousGoods?: DangerousGood[];
    // packingIds: uniqueItems: true type: array maxItems: 99 items: $ref: "#/components/schemas/PackingID"
    packingIds?: PackingID[];
    // packingUnits: uniqueItems: true type: array maxItems: 99 items: $ref: "#/components/schemas/PackingUnit"
    packingUnits?: PackingUnit[];
    // externalReferences: uniqueItems: true type: array maxItems: 10 items: $ref: "#/components/schemas/ExternalReference"
    externalReferences?: ExternalReference[];

};

export interface LoadingTackles {
    // required: - type - weight
    // type: type: string maxLength: 3 description: Type of the loading tackle referenced;as in KV normally a certain type is not supplied an general type like "all loading tackles" has to be used
    type: string;
    // description: type: string maxLength: 35 description: description of the loading tackle referenced;as in KV normally a certain type is not supplied an general type like "all loading tackles" has to be used
    description?: string;
    // indicationPrivate: type: boolean description: Indication wether it's a loading tackle of customer
    indicationPrivate?: boolean;
    // number: type: integer format: int32 maximum: 99 description: Number of the loading tackles of the type indicated
    number?: number;
    // weight: type: number maximum: 999999.99 multipleOf: 0.01 description: weight of all loading tackles of the typ indicated
    weight: number;
    // identifier: type: string maxLength: 15 description: identifying string of loading tackles, normally only used if number of loading tackles for the actual type is 1
    identifier?: string;
};

export interface EmptyWagonInformation {
    // modelId: type: string maxLength: 3 description: Code of wagon construction
    modelId?: string;
    // cluster: type: string maxLength: 7 description: Wagon Cluster defines more specific the disposition of empty wagon
    cluster?: string;
    // type: type: string maxLength: 9 description: Wagon type consist of RU code (4 digits) and sequence No (5 digits)
    type?: string;
    // description: type: string maxLength: 25 description: Name of the empty wagon type, have to be displayed in PVG
    description?: string;
};

export interface HandoverTakeover {
    // timestamp: type: string format: date-time description: scheduled take_over_DATE (for DB Schenker Rail)
    timestamp?: Date;
    // authority: type: integer format: int32 maximum: 99 description: Location, where wagon is taken over from previous RU ( referred as GPCP in X RAIL bookings)
    authority?: number;
    // locationCode: type: string maxLength: 6 description: code of location for GPCP
    locationCode?: string;
    // locationName: type: string maxLength: 35 description: name of location for GPCP
    locationName?: string;
    // trainId: type: string maxLength: 6 description: ID of DBSR Train at TakeOver
    trainId?: string;
};

export interface Cancellation {
    // required: - timestamp
    // accountableToCustomer: type: boolean description: indication whether Cencallation is accountable to customer
    accountableToCustomer?: boolean;
    // cause: type: string maxLength: 3 description: Cause for CANCELLATION (affects billing )
    cause?: string;
    // clientAgent: type: string maxLength: 20 description: Client agent name, who cancelled the wagon
    clientAgent?: string;
    // timestamp: type: string format: date-time description: Cencallation timestamp(originated/set by customer)
    timestamp: Date;
    // communicationChannel: type: string maxLength: 10 description: Communication channel e.g. EDI, FAX, Mail,manual oder Tra+
    communicationChannel?: string;
};

export interface ShippingDeliveryConditions {
    // scheduled: type: string format: date-time description: scheduled shipping date and time
    scheduled?: Date;
    // actual: type: string format: date-time description: actual shipping date and time
    actual?: Date;
    // deviationReasonCode: type: string maxLength: 3
    deviationReasonCode?: string;
    // deviationReasonDescription: type: string maxLength: 100
    deviationReasonDescription?: string;
    // deviationCauser: type: string maxLength: 3
    deviationCauser?: string;
};

export interface ExceptionalConsignment {
    // required: - imCode - permissionNumber
    // imCode: type: string maxLength: 4 description: RU Code of Railway, where exceptional consignment (extra dimension, extra weight) license (BZA) from local authorities is necessary
    imCode: string;
    // permissionNumber: type: string maxLength: 24 description: license number of the Railway, where exceptional consignment (extra dimension, extra weight) is necessary
    permissionNumber?: string;
};

export interface SpecialWagonHandling {
    // required: - code
    // code: type: integer format: int32 maximum: 99 description: code for special handling for the wagon, e.g. prohibition of shunting
    code: number;
    // description: type: string maximum: 60 description: description for special handling for the wagon, e.g. prohibition of shunting
    description?: string;
};

export interface WagonInformation {
    referenceId?: string;
    // required: - loadingStatus

    // wagonNumber: type: string maxLength: 12 description: international unique identifier of wagon
    wagonNumber?: string
    // loadingStatus: type: boolean description: indicator, whether wagon is loaded or empty
    loadingStatus: boolean;
    // limitedQuantity: type: boolean description: indication that consignment contains limited quantities of dangerous good, not to be declared, bit to be handled with special care
    limitedQuantity?: boolean;
    // originShippingCountry: type: string maxLength: 2 description: ISO Code (3166 1 Alpha 2) of country where wagon originally was shipped before DBSR railway transport started
    originShippingCountry?: string;
    // finalDestinationCountry: type: string maxLength: 2 description: ISO Code (3166 1 Alpha 2) of country where load wagon finally is send to after completion of DBSR transport
    finalDestinationCountry?: string;
    // dangerousGoodIndicator: type: boolean description: indicator wether wagon unit contains dangerous good
    dangerousGoodIndicator?: boolean;
    // goodWeight: type: number maximum: 999999.99 multipleOf: 0.01 description: weight of all goods in wagon not loading tackles in KG
    goodWeight?: number;
    // loadingTacklesWeight: type: number maximum: 999999.99 multipleOf: 0.01 description: sum of weight of all loading tackles, can be derived from the loading tackle entries
    loadingTacklesWeight?: number;
    // comment: type: string maxLength: 500 description: DBSR comment for actual wagon unit freetext (e.g. documentation of damages at hand over)
    comment?: string;

    // seals: uniqueItems: true type: array items: $ref: "#/components/schemas/Seal" maxItems: 10
    seals: Seal[];
    // goods: uniqueItems: true type: array items: $ref: "#/components/schemas/Goods" maxItems: 99
    goods: Goods[];
    // loadingTackles: uniqueItems: true type: array items: $ref: "#/components/schemas/LoadingTackles" maxItems: 99
    loadingTackles: LoadingTackles[];
    // externalReferences: uniqueItems: true type: array items: $ref: "#/components/schemas/ExternalReference" maxItems: 10
    externalReferences?: ExternalReference[];
    // summarizedIndicator: type: boolean description: indicates that all wagons are represented by that Line Item. Only 1 line Item of this type is allowed.
    summarizedIndicator?: boolean;
    // typeOfWagon: type: string maxLength: 15 description: type of wagon to define certain characteristics for capacity management in case the actual wagon number is not yet known
    typeOfWagon?: string;
    // emptyWeight: type: number maximum: 999999.99 multipleOf: 0.01 description: weight of wagon without goods and loading tackles in KG
    emptyWeight?: number;
    // numberOfAxle: type: integer format: int32 maximum: 99 description: Number of axles of wagon
    numberOfAxle?: number;
    // lengthOfWagon: type: integer format: int32 maximum: 999999 description: length of the wagon in mm
    lengthOfWagon?: number;
    // loadLimit: type: number maximum: 999999.99 multipleOf: 0.01 description: maximum load weight admitted for that wagon in tons.
    loadLimit?: number;
    // status: type: string maxLength: 30 description: Status of wagon according to Status model
    status?: string;
    // weighingIndicator: type: boolean description: indicates explicitly that weighing was done / fulfilled.
    weighingIndicator?: boolean;
    // transportPlanId: type: string maxLength: 35 description: PVG-ID. Field "ProductionalOrderID" in TripPlanInformation
    transportPlanId?: string;
    // specialTreatmentForEmptyWagon: type: string maxLength: 1 description: purpose for the transport of an empty wagon, e.g. demand coverage, on stock, to the workshop
    specialTreatmentForEmptyWagon?: string;
    // bookingTimestamp: type: string format: date-time description: First Order Booking Timestamp
    bookingTimestamp?: Date;
    // completionTimestamp: type: string format: date-time description: OrderCompletion_TIMESTAMP (single Wagon)
    completionTimestamp?: Date;
    // minimumLineCategory: type: string maxLength: 3 description: the 'LEAST' Line category as calculated by KAPA for each Wagon
    minimumLineCategory?: string;
    // fulfilmentIndicator: type: boolean description: indication that the wagons already arrived at destination area
    fulfilmentIndicator?: boolean;
    // atvCode: type: string maxLength: 7 description: special tariff number in connection with rail vehicles on their own wheels or buffer wagons
    atvCode?: string;
    // wagonPosition: type: integer format: int32 maximum: 999 description: position in which the wagon occurs in an order according to a given sequence by the customer
    wagonPosition?: number;
    // wagonIdentifier: type: string maxLength: 26 description: identifier of a wagon, if the wagon number is not known; can be provided by an EDI customer
    wagonIdentifier?: string;
    // printEraseIndicator: type: boolean description: indication that a print request from PVG does not contain this wagon
    printEraseIndicator?: boolean;
    // completedByWagonItem: type: boolean description: indication that this wagon was completed by a wagon item message (EDI message function 2)
    completedByWagonItem?: boolean;
    // bookingNumber: type: string maxLength: 64 description: Booking Number used by Xrail
    bookingNumber?: string;
    // priority: type: string maxLength: 1 description: priority of the wagon
    priority?: string;
    // imProfile: type: string maxLength: 10 description: IM profile of the wagon
    imProfile?: string;
    // totalWeight: type: number maximum: 999999.99 multipleOf: 0.01 description: total weight of the wagon
    totalWeight?: number;
    // emptyWagonInformation: $ref: "#/components/schemas/EmptyWagonInformation"
    emptyWagonInformation?: EmptyWagonInformation;
    // handOver: $ref: "#/components/schemas/HandoverTakeover"
    handOver?: HandoverConditions;
    // takeOver: $ref: "#/components/schemas/HandoverTakeover"
    takeOver?: TakeOverConditions;
    // cancellation: $ref: "#/components/schemas/Cancellation"
    // cancellation?: Cancellation;
    // shippingConditions: $ref: "#/components/schemas/ShippingDeliveryConditions"
    shippingConditions?: ShippingDeliveryConditions;
    // deliveryConditions: $ref: "#/components/schemas/ShippingDeliveryConditions"
    deliveryConditions?: ShippingDeliveryConditions;
    // exceptionalConsignments: uniqueItems: true type: array maxItems: 10 items: $ref: "#/components/schemas/ExceptionalConsignment"
    exceptionalConsignments?: ExceptionalConsignment[];
    // specialWagonHandlings: uniqueItems: true type: array maxItems: 5 items: $ref: "#/components/schemas/SpecialWagonHandling"
    specialWagonHandlings?: SpecialWagonHandling[];
};

export interface ConsignorDeclaration {
    // required: - code
    // code: type: string maxLength: 3 description: codified consignors declaration
    code: string;
    // description: type: string maxLength: 100 description: longtext of consignors declaration
    description?: string;
    // additionalInformation: type: string maxLength: 350 description: if admitted additional information to include in declarations of consignor
    additionalInformation?: string;
};

export interface CommercialSpecification {
    // code: type: string maxLength: 3 description: codified commercial specification
    code?: string;
    // description: type: string maxLength: 100 description: longtext of commercial specification
    description?: string;
    // additionalInformation: type: string maxLength: 350 description: if admitted additional information to include in commercial specification
    additionalInformation?: string;
};

export interface CarrierDeclaration {
    // required: - code - ruCode
    // ruCode: type: string maxLength: 4 description: RU Code of carrier, who issued carrier declaration (needed for ECN XML)
    ruCode: string;
    // code: type: string maxLength: 3 description: code of carrier declarations, indicating caveats
    code: string;
    // description: type: string maxLength: 100 description: longtext of carrier declarations of caveats
    description?: string;
    // additionalInformation: type: string maxLength: 350 description: if admitted additional information to include in carrier declarations of caveats
    additionalInformation?: string;
};

export interface SpecialAnnotations {
    // annotationOfConsignorDescription: type: string maxLength: 350 description: longtext of annotation of consignor
    annotationOfConsignorDescription?: string;
    // additionalDeclarationOfCarrier: type: string maxLength: 350 description: freetext declaration of carrier, concerning the consignment
    additionalDeclarationOfCarrier?: string;
    // consignorDeclarations: uniqueItems: true type: array items: $ref: "#/components/schemas/ConsignorDeclaration" maxItems: 5
    consignorDeclarations?: ConsignorDeclaration[];
    // commercialSpecifications: uniqueItems: true type: array items: $ref: "#/components/schemas/CommercialSpecification" maxItems: 5
    commercialSpecifications?: CommercialSpecification[];
    // carrierDeclarations: uniqueItems: true type: array items: $ref: "#/components/schemas/CarrierDeclaration" maxItems: 30
    carrierDeclarations?: CarrierDeclaration[];

};

export interface CommercialLocation extends Location {
    // additionalProperties: false
    // allOf: - $ref: "#/components/schemas/Location"
};

export interface AcceptancePoint extends Location {
    // AcceptancePoint: additionalProperties: false
    // allOf: - $ref: "#/components/schemas/Location"
    // required: - countryCode - locationCode - authority
    // countryCode: type: string maxLength: 2 description: ISO Code of shipping country
    countryCode: string;
    // countryName: type: string maxLength: 35 description: Descode of delivery point country
    countryName?: string;
    // information: type: string maxLength: 200 description: additional freetext information concerning the acceptance point
    information?: string;
    // commercialLocation: $ref: "#/components/schemas/CommercialLocation"
    commercialLocation?: CommercialLocation;
};

export interface DeliveryPoint extends Location {
    // additionalProperties: false allOf: - $ref: "#/components/schemas/Location"
    // required: - countryCode - locationCode - authority
    // countryCode: type: string maxLength: 2 description: ISO Code (3166 1 alpha 2) of destination country
    countryCode: string;
    // countryName: type: string maxLength: 35 description: Descode of delivery point country
    countryName?: string;
    // information: type: string maxLength: 200 description: additional freetext information concerning the delivery point
    information?: string;
    // rpCode: type: string maxLength: 5 description: Routing Point Code (RIP Code) of destination location, used for international train arrangement and for routing, Usually derived from RP Code of unloading point if indicated or unique for all possible unloading points, otherwise to be selected by user out of possible unloading points
    rpCode?: string;
    // commercialLocation: $ref: "#/components/schemas/CommercialLocation"
    commercialLocation?: CommercialLocation;
};

// export interface DelayedCompletion {
//     // required: - cause
//     // accountableToCustomer: type: boolean description: differential indication whether delayed completion is accountable to customer
//     accountableToCustomer?: boolean;
//     // cause: type: string maxLength: 3 description: cause/causer for delayed completion
//     cause?: string;
// };

// export interface OrderChange {
//     // required: - cause
//     // accountableToCustomer: type: boolean description: differential indication whether order change is accountable to customer
//     accountableToCustomer?: boolean;
//     // cause: type: string maxLength: 3 description: Documentation of cause for order changes (with effect on capacity booking)
//     cause: string;
// };

// export interface Threshold {
//     // length: type: number maximum: 99999999.99 multipleOf: 0.01 description: Threshold value which when exceeded should not result in an automatic ORDER REJECTION in case of capacity problems, but set on the waitlist.
//     length?: number;
//     // weight: type: number maximum: 99999999.99 multipleOf: 0.01 description: Threshold value which when exceeded should not result in an automatic ORDER REJECTION in case of capacity problems, but set on the waitlist.
//     weight?: number;
// };

// export interface Period {
//     //endOfBookingPeriod: type: string format: date-time description: End of booking period
//     endOfBookingPeriod?: Date;
//     // endOfCompletionPeriod: type: string format: date-time description: End of order completion period
//     endOfCompletionPeriod?: Date;
//     // endOfCancellationPeriod: type: string format: date-time description: End of cancel period
//     endOfCancellationPeriod?: Date;
// };

// export interface AlternativeOffset {
//     // required: - type - dateTime
//     // type: type: string maxLength: 10 description: alternative type (for more Offers from KAPA; serves as OFFSET for more alternatives)
//     type: string;
//     // dateTime: type: string format: date-time description: in case for more offers from KAPA
//     dateTime: Date;
// };

// export interface MaximumTransportDuration {
//     // deliveryProvisioningDays: type: integer format: int32 maximum: 999 description: maximum transport duration specified in days
//     deliveryProvisioningDays?: number;
//     // deliveryProvisioningTime: type: string pattern: ^[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{0,12})?(Z|(\+|-)[0-9]{2}:[0-9]{2})? example: 14:43:12.333Z
//     deliveryProvisioningTime?: string;
//     // specialRuleSaturday: type: string maxLength: 1 description: special rule for calculation of the maximum transport duration
//     specialRuleSaturday?: string;
//     // specialRuleSunday: type: string maxLength: 1 description: special rule for calculation of the maximum transport duration
//     specialRuleSunday?: string;
//     // specialRuleHoliday: type: string maxLength: 1 description: special rule for calculation of the maximum transport duration
//     specialRuleHoliday?: string;
//     // monday: type: boolean description: indicates whether maximum transport duration is valid for the specific day
//     monday?: boolean;
//     // tuesday: type: boolean description: indicates whether maximum transport duration is valid for the specific day
//     tuesday?: boolean;
//     // wednesday: type: boolean description: indicates whether maximum transport duration is valid for the specific day
//     wednesday?: boolean;
//     // thursday: type: boolean description: indicates whether maximum transport duration is valid for the specific day
//     thursday?: boolean;
//     // friday: type: boolean description: indicates whether maximum transport duration is valid for the specific day
//     friday?: boolean;
//     // saturday: type: boolean description: indicates whether maximum transport duration is valid for the specific day
//     saturday?: boolean;
//     // sunday: type: boolean description: indicates whether maximum transport duration is valid for the specific day
//     sunday?: boolean;
//     // holiday: type: boolean description: indicates whether maximum transport duration is valid for the specific day
//     holiday?: boolean;
// };

export interface TransportIndicator {
    // emptyWagon: type: boolean description: Indicates an empty wagon order from EWDS or PVG
    emptyWagon?: boolean;
    // damagedWagon: type: boolean description: Indicates a damaged wagon transport
    damagedWagon?: boolean;
    // inboundTraffic: type: boolean description: The indicator is set if the order is an inbound traffic
    inboundTraffic?: boolean;
    // intermodalEmpty: type: boolean description: Indicates an empty intermodal transport
    intermodalEmpty?: boolean;
    // intermodalLoaded: type: boolean description: Indicates a loaded intermodal transport
    intermodalLoaded?: boolean;
    // wasteTransport: type: boolean description: Indicates a waste transport
    wasteTransport?: boolean;
    // militaryTransport: type: boolean description: Indicates a military transport
    militaryTransport?: boolean;
    // xrail: type: boolean description: Indicates a transport in which Xrail is involved
    xrail?: boolean;
};
export interface PartyAddress {
    // street: type: string maxLength: 50 description: street
    street?: string;
    // houseNumber: type: string maxLength: 5 description: House number
    houseNumber?: string;
    // poBox: type: string maxLength: 35 description: Post office (P.O.) box
    poBox?: string;
    // zipCode: type: string maxLength: 9 description: Zip Code
    zipCode?: string;
    // city: type: string maxLength: 35 description: City
    city?: string;
    // country: type: string maxLength: 2 description: ISO country code
    country?: string;
};

export interface ContactPerson {
    // name: type: string maxLength: 35 description: Name of person to contact at consignor site in case of necessary clarifications
    name?: string;
    // tel: type: string maxLength: 30 description: Tel of person to contact at consignor site in case of necessary clarifications
    tel?: string;
    // fax: type: string maxLength: 30 description: Fax of person to contact at consignor side in case of necessary clarifications
    fax?: string;
    // email: type: string maxLength: 50 description: E MAIL of Person to contact at consignor side in case of necessary clarifications
    email?: string;
};

export interface Party {
    // name: type: string maxLength: 45 description: Name
    name?: string;
    // customerId: $ref: "#/components/schemas/CustomerID"
    customerId?: CustomerID;
    // partnerId: $ref: "#/components/schemas/PartnerID"
    partnerId?: PartnerID;
    // extCustomerId: type: string maxLength: 16 description: External customer id of freightpayer
    extCustomerId?: string;
    // comment: type: string maxLength: 45 description: freetext comment
    comment?: string;
    // signature: type: string maxLength: 35 description: ' Field 1 (signature); provided by ECN '
    signature?: string;
    // vatIndicator: type: integer format: int32 maximum: 99 description: Indicator for calculating VAT for freightpayer
    vatIndicator?: number;
    // vatId: type: string maxLength: 25 description: VAT Id
    vatId?: string;
    // address: $ref: "#/components/schemas/PartyAddress"
    address?: PartyAddress;
    // contactPerson: $ref: "#/components/schemas/ContactPerson"
    contactPerson?: ContactPerson;
};

export interface RailOrder {
    orderId: number | null;
    orderKey?: OrderKey;
    // type: string maxLength: 7 description: Number of Tariff / Contract, applied for customer billing, as agreed in contract.
    contractNumber?: string;
    // generationId: type: string maxLength: 7 description: Number of the agreement generation. Needed to identify the proper contract.
    // generationId?: string;
    // rerecorded type: boolean description: Indicator that order was re recorded after fulfillment, to ensure transmission to invoicing system(Nacherfassung)
    // recorded?: boolean;
    // creationDate: type: string format: date-time description: Date and Time the order was created
    // creationDate?: Date;
    // originalCapturingSystem: type: string maxLength: 10 description: Identification String of system which has captured order originally at DBSR (ZAB,LPK, EOM, ComGate, TRA,EWDS,PVG)
    // originalCapturingSystem?: string;
    // inputChannel: type: string maxLength: 10 description: Channel which was used to transmit order (EDI, Portal, Manual)
    // inputChannel?: string;
    // orderTemplateFlag: type: boolean description: Indicates a template
    // orderTemplateFlag?: boolean;
    // notificationSuppression: type: boolean description: Check box, which indicates that special duties of the railway to inform other railways do not have to be executed
    // notificationSuppression?: boolean;
    // notificationEnforcement: type: boolean description: Check box, which indicates that the notification of partner RUs has to be executed, though this is not prescribed
    // notificationEnforcement?: boolean;
    // cpITransmitted: type: boolean description: indication whether order was transmitted to CPI
    // cpiTransmitted?: boolean;
    // // cpIReturnCode: type: integer format: int32 maximum: 99 description: CPI Return Code of last transmission
    // cpiReturnCode?: number;
    // // cpIReturnMessage: string; type: string maxLength: 300 description: CPI Message of last transmission Acknowledgement
    // cpiReturnMessage?: string;
    // // cpICancellationTransmitted: type: boolean description: indication wether a message including only cancelled wagons was transmitted to CPI
    // cpiCancellationTransmitted?: boolean;
    // // cpICancellationReturnCode: type: integer format: int32 maximum: 99 description: CPI Return Code of last transmission belonging to a message including only cancelled wagons
    // cpiCancellationReturnCode?: number;
    // cpICancellationReturnMessage?: string;
    // epSTransmitted: type: boolean description: indication wether order was transmitted to EPS (Europ. Production System)
    // epsTransmitted?: boolean;
    // templateWarning: string; type: string maxLength: 100 description: only used in conjunction with order template to generate a validation message when creating (new) order based on that template
    // templateWarning?: string;
    // templateNumber: type: string maxLength: 8 description: Template which was used for Order creation
    templateNumber?: string;
    // templateName: type: string maxLength: 50 description: name of the template that is defined by a TRA user; when the template is created it coincides with the template number, but it can be renamed in TRA
    templateName?: string;
    // orderRevision: type: integer format: int32 maximum: 99999 description: number of the revision (version) of an order
    // orderRevision?: number;
    // // editingRemark: type: string maxLength: 150 description: remark by an order manager in the course of working on the order
    // editingRemark?: string;
    // serviceType: type: string Value of Enum RailOrderServiceType
    serviceType?: string;
    // specialTreatmentOrders: uniqueItems: true type: array items: $ref: "#/components/schemas/SpecialTreatmentOrder"
    specialTreatmentOrders?: SpecialTreatmentOrder[];
    // TODO compare with yaml rail-order-api.yaml starting from here
    // externalReferences: uniqueItems: true type: array items: $ref: "#/components/schemas/ExternalReference"
    externalReferences?: ExternalReference[];
    // customerRevision: type: boolean description: This flag is set for the revision of the order that has to be compared with the inbound message in the logic of intelligent merge
    // customerRevision?: boolean;
    // bookingTimestamp: type: string format: date-time description: Date and Time the booking was done. Initially it coincides with the Creation Date, but in case of an essential modification (e.g. shipping date), it is refreshed.
    // bookingTimestamp?: Date;
    // shippingTimestamp: type: string format: date-time description: shipping date the customer has ordered for the consignment to be handed over to the first railway.
    shippingTimestamp?: string;
    // numberOfWagons: type: integer format: int32 maximum: 99 description: indicating the number of wagons in the interface to IPL KAPA
    numberOfWagons?: number;
    // typeOfTransportCode: type: string maxLength: 10 description: special type of transport as "normal Transport", "military transport", "waste transport", "empty Wagon provision", "Damaged wagon" derived from product
    // typeOfTransportCode?: string;
    // typeOfTransportDescription: type: string maxLength: 30
    typeOfTransportDescription?: string;
    // orderedTrainReference: type: string maxLength: 6 description: reference of Block train (or block train contingent) ordered by customer, which was passed to the customer. May differ from corresponding operational train number
    orderedTrainReference: string;
    // actualTrainReference: type: string maxLength: 6 description: actual operational train number
    // actualTrainReference?: string;
    // printDataSheet: type: boolean description: indicator that a data sheet for that rail transport has to be printed, which serves as supporting document for internal workflow or to complete consignment note delivered by customer
    // printDataSheet?: boolean;
    type?: string
    /*status: enum: - CAPTURED - ACCEPTED - SUBMITTED - ACTIVE - CLOSED - CANCELLED - INVALID
    description: Status of Rail Transport Order, according to Rail Transport Order Status model */
    status?: RailOrderStatus;
    // validationStatus: type: string maxLength: 10
    // validationStatus?: string;
    // exceptionalConsignmentIndicator: type: boolean description: indication that consignment is exceptional in terms of dimension
    exceptionalConsignmentIndicator?: boolean;
    // transportMonitoring: type: boolean description: indicator, wether special transport monitoring is required
    // transportMonitoring?: boolean;
    // minimumLineCategory: type: string maxLength: 3 description: the least Line category on the whole route, for non german route sections
    // minimumLineCategory?: string;
    // fulfilmentIndicator: type: boolean description: indication that all wagons of transport already arrived at destination area
    // fulfilmentIndicator?: boolean;
    // deliveryDateTimeOrdered: type: string format: date-time description: delivery Date ordered by customer for the consignment to arrive at the consignee. It is only used with backward termination, which means that a transportplan is calculated that meets the EZP regarding the max runtime (Ziellaufzeit) resulting in an appropriate VZP scheduled
    // deliveryDateTimeOrdered?: Date;
    // aodIndicator: type: boolean description: Advice on Delivery requested by ECN
    // aodIndicator?: boolean;
    // orderStage: type: string maxLength: 1 description: 'requested "maturity level / stage" within order processing: booking Inquiry; booking order ; completed order; order template'
    orderStage?: RailOrderStage;
    // originalOrderNumber: type: integerformat: int64 maximum: 99999999999999999 description: creating a new Order ID
    // originalOrderNumber?: number;
    // coreConfiguration: type: string maxLength: 5 description: Core Configuration as calculated by EOM on base of Booking Timestamp OR supplied by customer as "Product_Id" OR as special ID for "Block Train"
    coreConfiguration?: string;
    // reservationType: type: string maxLength: 1 description: Reservation TYPE, when Order is based on Reservation (Reservierung / Vormerkung ) Indicates that confirmation is still required. Alternatively the confirmation could be done on the reservation directly.
    // reservationType?: string;
    // reservationNumber: type: string maxLength: 20 description: Reservation ID (optional, when Order is based on Reservation)
    // reservationNumber?: string;
    // latestDelivery: type: string format: date-time description: latest delivery calculated by KAPA accdg. To maximum Transport duration. (as DEFINED in the CONTRACT )
    // latestDelivery?: Date;
    // dangerousWasteIndicator: type: boolean description: indicates that at least ONE good position contains dangerous waste and therefore in GERMANY ZeDAL monitoring has to be triggered
    // dangerousWasteIndicator?: boolean;
    // waitlistIndicator: type: string maxLength: 30 description: Status of order on waitlist ; e.g. Not on List ; waiting; re submitted ; removed)
    // waitlistIndicator?: string;
    // //completionTimestamp: type: string format: date-time transportPlanStatus: type: string maxLength: 30 description: 'result of TransportPlan calculation : e.g. no TPL calculated; TPL available ; TPL not avail. ; TPL booked'
    // completionTimestamp?: Date;
    // // deletedFromWaitlist: type: string format: date-time description: if the order is set on the waitlist, it can stay there according to the core configuration only until a certain timestamp
    // deletedFromWaitlist?: Date;
    // // templateValidFrom: type: string format: date description: First Date on which the template is valid; not given for orders
    // templateValidFrom?: Date;
    // // templateValidTo: type: string format: date description: Last Date on which the template is valid; not given for orders
    // templateValidTo?: Date;
    // submitProcessRunning: type: boolean description: flag is set when submit process starts; as soon as submit process is finished (including Kapa response), flag is unset
    // submitProcessRunning?: boolean;
    // archivingStatus: type: string maxLength: 10 description: status of archiving in BCM (Not yet archived, Sent to archive, Successfully archived, Archiving failed)
    // archivingStatus?: string;
    // // archivingTimestamp: type: string format: date-time description: timestamp, when the last try to archive in BCM was done
    // archivingTimestamp?: Date;
    // ridOldFlag: type: boolean description: indicates whether an old version of the RID is used in a transition period.
    // ridOldFlag?: boolean;
    // transportationType: type: string maxLength: 2 description: Value of the Befoerderungsart
    transportationType?: string; // Beförderungsart im FE
    modeOfTransport?: string; // MD_CodeTable MODES_OF_TRANSPORT Transportart im FE
    // dangerousGoodLaw:  type: string  maxLength: 4  description: dangerous good law is updated periodically. After update usually      a short period of time defined, where both versions of dangerous good      law is admitted. Here the concrete dangerous goods law version is referenced
    dangerousGoodLaw: string;
    // ediCollation: type: boolean description: Indicates that a separate message at the time of collation of the wagons will be send
    // ediCollation?: boolean;
    // operationalTransportConditions: $ref: "#/components/schemas/OperationalTransportConditions"
    operationalTransportConditions?: OperationalTransportConditions;
    // commercialTransportConditions: $ref: "#/components/schemas/CommercialTransportConditions"
    commercialTransportConditions?: CommercialTransportConditions;
    // consignmentNote: $ref: "#/components/schemas/ConsignmentNote"
    consignmentNote?: ConsignmentNote;
    // customsData: $ref: "#/components/schemas/CustomsData"
    customsData?: CustomsData;
    // attachedDocuments:    uniqueItems: true    type: array    items:      $ref: "#/components/schemas/AttachedDocument"    maxItems: 10
    attachedDocuments?: AttachedDocument[],
    // wagonInformation: uniqueItems: true type: array items: $ref: "#/components/schemas/WagonInformation" maxItems: 99
    wagonInformation?: WagonInformation[];
    // specialAnnotations: $ref: "#/components/schemas/SpecialAnnotations"
    specialAnnotations?: SpecialAnnotations;
    // acceptancePoint: $ref: "#/components/schemas/AcceptancePoint"
    acceptancePoint?: AcceptancePoint;
    // deliveryPoint: $ref: "#/components/schemas/DeliveryPoint"
    deliveryPoint?: DeliveryPoint;
    // delayedCompletion: $ref: "#/components/schemas/DelayedCompletion"
    // delayedCompletion: DelayedCompletion;
    // orderChange: $ref: "#/components/schemas/OrderChange"
    // orderChange?: OrderChange;
    // threshold: $ref: "#/components/schemas/Threshold"
    // threshold?: Threshold;
    // period: $ref: "#/components/schemas/Period"
    // period?: Period;
    // alternativeOffset: $ref: "#/components/schemas/AlternativeOffset"
    // alternativeOffset?: AlternativeOffset;
    // maximumTransportDurations: uniqueItems: true type: array items: $ref: "#/components/schemas/MaximumTransportDuration"
    // maximumTransportDurations?: MaximumTransportDuration[];
    // transportIndicator: $ref: "#/components/schemas/TransportIndicator"
    // transportIndicator?: TransportIndicator;
    // unloadingParty: $ref: "#/components/schemas/Party"
    unloadingParty?: Party;
    // loadingParty: $ref: "#/components/schemas/Party"
    loadingParty?: Party;
    // consignor: $ref: "#/components/schemas/Party"
    consignor?: Party;
    // consignee: $ref: "#/components/schemas/Party"
    consignee?: Party;
    // contractualCarrier: $ref: "#/components/schemas/Party"
    // contractualCarrier?: Party;
    // freightpayerConsignor: $ref: "#/components/schemas/Party"
    freightpayerConsignor?: Party;
    // freightpayerConsignee: $ref: "#/components/schemas/Party"
    freightpayerConsignee?: Party;
    // handOverConditions: $ref: "#/components/schemas/HandOverConditions" takeOverConditions: $ref: "#/components/schemas/TakeOverConditions"
    handOverConditions: HandoverConditions;
    // takeOverConditions
    takeOverConditions: TakeOverConditions;
    allowedActions: Action[];
    authorization: Authorization[];
};

export interface TemplateSummary {
    templateNumber: string;
    templateName: string;
}

export interface LocationRequest {
    authority: number;
    locationCode: string;
}

export enum TypeOfConsignment {
    CIM = 'CIM',
    CUV = 'CUV',
    NAT = 'NAT'
}

export enum CustomsDescriptor {
    A = 'A',
    D = 'D',
    K = 'K',
    N = 'N'
}

export function initialSubsequentOrder(): SubsequentOrder {
    return {
        // required: - type - clientAgent - dbAgent - dateAndTime
        type: null,
        clientAgent: null,
        dbAgent: null,
        dateAndTime: null,
        comment: null
    };
};

export function initialChargesNoteReturn(): ChargesNoteReturn {
    return {
        name: null,
        address: null,
        zipCode: null,
        city: null
    };
};

export function initialPrinter(): Printer {
    return {
        // required: - documentType - printerName
        printerName: null,
        documentType: null
    };
};

export function initalPrinterList(): Printer[] {
    return [];
};

export function initialCommercialConsignmentNote(): ConsignmentNote {
    return {
        deliveryNoteCreated: null,
        consignmentNumber: null,
        shippingRailway: null,
        typeOfConsignment: null,
        printDate: null,
        generationDate: null,
        versionNumber: null,
        ecNConfiguration: null,
        ecNStatus: null,
        printTemplate: null,
        printConfiguration: null,
        printLanguage: null,
        footerRuCode: null,
        printDescriptor: null,
        printEnforcement: null,
        printSuppression: null,
        printLabel: null,
        additionalInfo: null,
        wagonLabelRequired: null,
        subsequentOrder: initialSubsequentOrder(),
        chargesNoteReturn: initialChargesNoteReturn(),
        printers: initalPrinterList()
    };
};

export function intialCustomsPrincipal(): CustomsPrincipal {
    return {
        // required: - ruCode
        ruCode: null,
        name: null
    };
};

export function initialCustomsData(): CustomsData {
    return {
        additionalCustomsProcedure: null,
        transitProcedure: null,
        customsDescriptor: null,
        customsNote: null,
        // customsPrincipal: intialCustomsPrincipal()
    };
};

export function initialHandoverConditions(): HandoverConditions {
    return {
        typeOfHandover: 0,
        shipOwner: null,
        shipName: null,
        departure: null,
        destinationPort: null,
    };
}
export function initialTakeOverConditions(): TakeOverConditions {
    return {

        typeOfTakeover: 1,
        shipOwner: null,
        shipName: null,
        arrival: null,
        originPort: null,
        loadingAuthorisation: null
    }
}

export function initialSeal(): Seal {
    return {
        type: null,
        referenceNumber: null
    };
};

export function initialSealList(): Seal[] {
    return [];
};

export function initialDangerousGood(): DangerousGood {
    return {
        class:null,
        classificationCode: null,
        type: null,
        description: null,
        unNr: null,
        dangerIdentificationNumber: null,
        explosiveMass: null,
        weight: null,
        emptyNotCleansed: null,
        emptyPackingUnit: null,
        emptyPackingDescription: null,
        packingGroup: null,
        specialInstruction: null,
        restrictionFlag: null,
        additionalInformation: null,
        previousLoadedGoodNHM: null,
        previousLoadedGoodDescription: null,
        wasteIndicator: null,
        dangerLabels: initialDangerLabelsList(),
        dangerLabelInfo: null,
        approvalFlag: null,
        accidentInformationSheetNr: null,
        nagFlag : null
    };
};

export function initialDangerLabelsList(): string[] {
    return [];
};

export function initialDangerousGoodList(): DangerousGood[] {
    return [];
};

export function initalPackingID(): PackingID {
    // required: - packingID
    return {
        packingId: null
    }
};

export function initialPackingUnit(): PackingUnit {
    // required: - type
    return {
        number: null,
        type: null,
        description: null
    };
};

export function initialPackingUnitList(): PackingUnit[] {
    return [];
};

export function initialPackingIDList(): PackingID[] {
    return [];
};

export function initialExternalReferenceList(): ExternalReference[] {
    return [];
};

export function initialGood(): Goods {
    return {
        nhmCode: null,
        nhmDescription: null,
        additionalDescription: null,
        additionalDeclarationCode: null,
        additionalDeclaration: null,
        weight: null,
        volume: null,
        unit: null,
        wasteId: null,
        customsReferenceNumber: null,
        dangerousGoods: initialDangerousGoodList(),
        packingIds: initialPackingIDList(),
        packingUnits: initialPackingUnitList(),
        externalReferences: initialExternalReferenceList()
    };
};

export function initialGoodMinimal(): Goods {
    return {
        nhmCode: null,
        nhmDescription: null,
        dangerousGoods: [],
        packingIds: [],
        packingUnits: [],
        externalReferences: [],
        weight: null,
        additionalDescription: null
    };
};

export function initialGoodsList(): Goods[] {
    return [];
};

export function initialLoadingTacklesList(): LoadingTackles[] {
    return [];
};

export function initalLoadingTackles(): LoadingTackles {
    // required: - type - weight
    return {
        type: null,
        description: null,
        indicationPrivate: null,
        number: null,
        weight: 0,
        identifier: null
    };
};

export function initalLoadingTacklesList(): LoadingTackles[] {
    return [];
};


export function initialEmptyWagonInformation(): EmptyWagonInformation {
    return {
        modelId: null,
        cluster: null,
        type: null,
        description: null,
    };
};

export function initialHandoverTakeover(): HandoverTakeover {
    return {
        timestamp: null,
        authority: null,
        locationCode: null,
        locationName: null,
        trainId: null
    };
};

export function initialCancellation(): Cancellation {
    // required: - timestamp
    return {
        accountableToCustomer: null,
        cause: null,
        clientAgent: null,
        timestamp: null,
        communicationChannel: null,
    };
};

export function initialShippingDeliveryConditions(): ShippingDeliveryConditions {
    return {
        scheduled: null,
        actual: null,
        deviationReasonCode: null,
        deviationReasonDescription: null,
        deviationCauser: null,

    };
};

export function initialExceptionalConsignment(): ExceptionalConsignment {
    // required: - imCode - permissionNumber
    return {
        imCode: null,
        permissionNumber: null
    };
};

export function initialExceptionalConsignmentList(): ExceptionalConsignment[] {
    return [];
};

export function initialSpecialWagonHandling(): SpecialWagonHandling {
    // required: - code
    return {
        code: null,
        description: null
    };
};

export function initialSpecialWagonHandlingList(): SpecialWagonHandling[] {
    return [];
};

export function initalWagonInformation(): WagonInformation {
    // required: - loadingStatus
    return {
        wagonNumber: null,
        loadingStatus: null,
        limitedQuantity: null,
        originShippingCountry: null,
        finalDestinationCountry: null,
        dangerousGoodIndicator: null,
        goodWeight: null,
        loadingTacklesWeight: null,
        comment: null,
        seals: initialSealList(),
        goods: initialGoodsList(),
        loadingTackles: initalLoadingTacklesList(),
        externalReferences: initialExternalReferenceList(),
        summarizedIndicator: null,
        typeOfWagon: null,
        emptyWeight: null,
        numberOfAxle: null,
        lengthOfWagon: null,
        loadLimit: null,
        status: null,
        weighingIndicator: null,
        transportPlanId: null,
        specialTreatmentForEmptyWagon: null,
        bookingTimestamp: null,
        completionTimestamp: null,
        minimumLineCategory: null,
        fulfilmentIndicator: null,
        atvCode: null,
        wagonPosition: null,
        wagonIdentifier: null,
        printEraseIndicator: null,
        completedByWagonItem: null,
        bookingNumber: null,
        priority: null,
        imProfile: null,
        totalWeight: null,
        emptyWagonInformation: initialEmptyWagonInformation(),
        handOver: initialHandoverConditions(),
        takeOver: initialTakeOverConditions(),
        // cancellation: initialCancellation(),
        shippingConditions: initialShippingDeliveryConditions(),
        deliveryConditions: initialShippingDeliveryConditions(),
        exceptionalConsignments: initialExceptionalConsignmentList(),
        specialWagonHandlings: initialSpecialWagonHandlingList()
    };
};

export function initialWagonInformationMinimal(): WagonInformation {
    return {
        loadingStatus: null,
        limitedQuantity: null,
        dangerousGoodIndicator: null,
        seals: [],
        goods: [],
        loadingTackles: [],
        externalReferences: [],
        summarizedIndicator: false,
        status: null,
        weighingIndicator: false,
        fulfilmentIndicator: false,
        wagonPosition: null,
        printEraseIndicator: false,
        completedByWagonItem: false,
        priority: null,
        exceptionalConsignments: [],
        specialWagonHandlings: []
      };
};

export function initialAttachedDocument(): AttachedDocument {
    return {
        code: null,
        description: null,
        dateOfIssue: null,
        numberOfOriginals: null,
        referenceNumber: null
    }
};

export function initialAttachedDocumentsList(): AttachedDocument[] {
    return [];
};

export function initialWagonInformationList(): WagonInformation[] {
    return [];
};


export function initialConsignorDeclaration(): ConsignorDeclaration {
    // required: - code
    return {
        code: null,
        description: null,
        additionalInformation: null
    };
};



export function initalConsignorDeclarationList(): ConsignorDeclaration[] {
    return [];
};

export function initialCommercialSpecification(): CommercialSpecification {
    return {
        code: null,
        description: null,
        additionalInformation: null
    };
};

export function initialCommercialSpecificationList(): CommercialSpecification[] {
    return [];
};

export function initialCarrierDeclaration(): CarrierDeclaration {
    return {
        // required: - code - ruCode
        ruCode: null,
        code: null,
        description: null,
        additionalInformation: null
    };
};

export function initalCarrierDeclarationList(): CarrierDeclaration[] {
    return [];
};

export function initialSpecialAnnotations(): SpecialAnnotations {
    return {
        annotationOfConsignorDescription: null,
        additionalDeclarationOfCarrier: null,
        consignorDeclarations: initalConsignorDeclarationList(),
        commercialSpecifications: initialCommercialSpecificationList(),
        carrierDeclarations: initalCarrierDeclarationList()
    };
};

export function initalCommercialLocation(): CommercialLocation {
    return {
        authority: null,
        locationCode: null,
        locationName: null
    };
};

export function initialAcceptancePoint(): AcceptancePoint {
    return {
        authority: null,
        locationCode: null,
        locationName: null,
        countryCode: null,
        countryName: null,
        information: null,
        // commercialLocation: initalCommercialLocation()
    };
};

export function initailDeliveryPoint(): DeliveryPoint {
    return {

        authority: null,
        locationCode: null,
        locationName: null,
        countryCode: null,
        countryName: null,
        information: null,
        rpCode: null,
        // commercialLocation: initalCommercialLocation()
    };
};

// export function initialDelayedCompletion(): DelayedCompletion {
//     // required: - cause
//     return {
//         accountableToCustomer: null,
//         cause: null
//     };
// };

// export function initialOrderChange(): OrderChange {
//     // required: - cause
//     return {
//         accountableToCustomer: null,
//         cause: null
//     };
// };
// export function initalThreshold(): Threshold {
//     return {
//         length: null,
//         weight: null
//     };
// };

// export function initialPeriod(): Period {
//     return {
//         endOfBookingPeriod: null,
//         endOfCompletionPeriod: null,
//         endOfCancellationPeriod: null,
//     };
// };

// export function initialAlternativeOffset(): AlternativeOffset {
//     // required: - type - dateTime
//     return {
//         type: null,
//         dateTime: null
//     };
// };

// export function initialMaximumTransportDuration(): MaximumTransportDuration {
//     return {
//         deliveryProvisioningDays: null,
//         deliveryProvisioningTime: null,
//         specialRuleSaturday: null,
//         specialRuleSunday: null,
//         specialRuleHoliday: null,
//         monday: null,
//         tuesday: null,
//         wednesday: null,
//         thursday: null,
//         friday: null,
//         saturday: null,
//         sunday: null,
//         holiday: null,
//     };
// };

// export function maximumTransportDurationList(): MaximumTransportDuration[] {
//     return [];
// };

// export function initialTransportIndicator(): TransportIndicator {
//     return {
//         emptyWagon: null,
//         damagedWagon: null,
//         inboundTraffic: null,
//         intermodalEmpty: null,
//         intermodalLoaded: null,
//         wasteTransport: null,
//         militaryTransport: null,
//         xrail: null
//     };
// };

export function initialRailOrder(): RailOrder {
    const railOrder: RailOrder = {
        orderId: null,
        // orderKey: initialOrderKey(),
        contractNumber: null,
        // generationId: null,
        // recorded: null,
        // creationDate: new Date(),
        // originalCapturingSystem: null,
        // inputChannel: null,
        // orderTemplateFlag: false,
        // notificationSuppression: null,
        // notificationEnforcement: null,
        // cpiTransmitted: null,
        // cpiReturnCode: null,
        // cpiReturnMessage: null,
        // cpiCancellationTransmitted: null,
        // cpiCancellationReturnCode: null,
        // epsTransmitted: null,
        // templateWarning: null,
        templateNumber: null,
        templateName: null,
        // orderRevision: null,
        // editingRemark: null,
        serviceType: railOrderServiceTypeToString(RailOrderServiceType.OM),
        specialTreatmentOrders: initialSpecialTreatmentOrdersList(),
        externalReferences: initalExternalReferenceList(),
        // customerRevision: null,
        // bookingTimestamp: null,
        shippingTimestamp: null,
        numberOfWagons: null,
        // typeOfTransportCode: null,
        typeOfTransportDescription: null,
        orderedTrainReference: null,
        // actualTrainReference: null,
        // printDataSheet: null,
        status: RailOrderStatus.INVALID,
        // validationStatus: null,
        exceptionalConsignmentIndicator: null,
        // transportMonitoring: null,
        // minimumLineCategory: null,
        // fulfilmentIndicator: null,
        // deliveryDateTimeOrdered: null,
        // aodIndicator: null,
        orderStage: null,
        // originalOrderNumber: null,
        coreConfiguration: null,
        // reservationType: null,
        // reservationNumber: null,
        // latestDelivery: null,
        // dangerousWasteIndicator: null,
        // waitlistIndicator: null,
        // completionTimestamp: null,
        // deletedFromWaitlist: null,
        // templateValidFrom: null,
        // templateValidTo: null,
        // submitProcessRunning: null,
        // archivingStatus: null,
        // archivingTimestamp: null,
        // ridOldFlag: null,
        transportationType: null,
        dangerousGoodLaw: null,
        // ediCollation: null,
        // operationalTransportConditions: initialOperationalTransportConditions(),
        commercialTransportConditions: initialCommercialTransportConditions(),
        // consignmentNote: initialCommercialConsignmentNote(),
        // customsData: initialCustomsData(),
        attachedDocuments: initialAttachedDocumentsList(),
        wagonInformation: initialWagonInformationList(),
        specialAnnotations: initialSpecialAnnotations(),
        // acceptancePoint: initialAcceptancePoint(),
        // deliveryPoint: initailDeliveryPoint(),
        // delayedCompletion: initialDelayedCompletion(),
        // orderChange: initialOrderChange(),
        // threshold: initalThreshold(),
        // period: initialPeriod(),
        // alternativeOffset: initialAlternativeOffset(),
        // maximumTransportDurations: maximumTransportDurationList(),
        // transportIndicator: initialTransportIndicator(),
        unloadingParty: initialParty(),
        loadingParty: initialParty(),
        consignor: initialParty(),
        consignee: initialParty(),
        // contractualCarrier: initialParty(),
        freightpayerConsignor: initialParty(),
        freightpayerConsignee: initialParty(),
        handOverConditions: initialHandoverConditions(),
        takeOverConditions: initialTakeOverConditions(),
        allowedActions: [Action.BOOK, Action.ORDER, Action.EDIT],
        authorization: undefined
    };
    return railOrder;
};

export function initialOrderKey(): OrderKey {
    return {
        orderAuthority: null,
        orderNumber: null
    };
};

export function initialSpecialTreatmentCharging(): SpecialTreatmentCharging {
    return {
        startAuthority: null,
        startLocationCode: null,
        startBorderCode: null,
        endAuthority: null,
        endLocationCode: null,
        endBorderCode: null,
        prepayment: null, // This is a required field, so it should have an empty string as the default
        amount: null
    };
};

export function initialSpecialTreatmentChargingList(): SpecialTreatmentCharging[] {
    const specialTreatmentChargings = [];
    return specialTreatmentChargings;
};

export function initialSpecialTreatmentOrderUTI(): SpecialTreatmentOrderUTI {
    return {
        loadUnitPrefix: null, // Empty string as default for required property
        loadUnitNumber: null, // Empty string as default for required property
    };
};

export function initialSpecialTreatmentOrderWagonPositions(): number[] {
    return [];
};

export function initialSpecialTreatmentOrderUTIList(): SpecialTreatmentOrderUTI[] {
    return [];
};

export function initialProductionLocation(): ProductionLocation {
    return {
        authority: null,
        locationCode: null,
        locationName: null
    };
};

export function initialExternalReference(): ExternalReference {
    return {
        type: null, //Required
        description: null,
        identifier: null,
        subType: null,
    };
};

export function initalExternalReferenceList(): ExternalReference[] {
    return [];
};

export function initialSpecialTreatmentOrder(): SpecialTreatmentOrder {
    return {
        productName: null,
        info: null,
        productExtraChargeCode: null,
        authority: null,
        locationCode: null,
        locationName: null,
        includedInPrepaymentNote: null,
        specialTreatmentChargings: initialSpecialTreatmentChargingList(),
        specialTreatmentOrderWagonPositions: initialSpecialTreatmentOrderWagonPositions(),
        specialTreatmentOrderUTIs: initialSpecialTreatmentOrderUTIList(),
        productionNode: initialProductionLocation(),
    };
};

export function initialLoadingPoint(): LoadingPoint {
    return {
        country: null,
        code: null,
        name: null,
        codeDescription: null,
        countryDescription: null,
        nameDescription: null
    };
};

// export function initialParkingPosition(): ParkingPosition {
//     return {
//         authority: null, // required (invalid value)
//         locationCode: null,
//         subLocation: null,
//         subLocationSeqNumber: null
//     };
// };

export function initialOperationalTransportConditions(): OperationalTransportConditions {
    return {
        // specialTransportationPlanDescription: null,
        // additionalBorderDigit: null,
        // domesticTransport: null,
        pointOfLoading: initialLoadingPoint(),
        pointOfUnloading: initialLoadingPoint(),
        // acceptancePointParkingPosition: initialParkingPosition(),
        // deliveryPointParkingPosition: initialParkingPosition(),
        acceptancePointProductionNode: initialProductionLocation(),
        deliveryPointProductionNode: initialProductionLocation()
    };
};

export function initialPrepaymentUpTo(): PrepaymentUpTo {
    return {
        authority: null,
        locationCode: null,
        locationName: null,
        borderCode: null,
        borderName: null,
        borderDescription: null
    };
};

// export function initialCashOnDelivery(): CashOnDelivery {
//     return {
//         price: null,
//         currency: null,
//         certificateNumber: null,
//         dateTimeOfCertificate: null
//     };
// };

export function initialCurrencyValue(): CurrencyValue {
    return {
        price: null,
        currency: null
    };
};

export function initialCustomerID(): CustomerID {
    return {
        ownerOfCustomerId: null,
        authorityOfCustomerId: null,
        sgv: null
    };
};

export function initialPartnerID(): PartnerID {
    return {
        ownerOfPartnerId: null,
        site: null
    };
};

export function initialFreightpayerTransit(): FreightpayerTransit {
    return {
        name: null,
        customerId: initialCustomerID(),
        partnerId: initialPartnerID()
    };
};

export function initialSectionalInvoicingList(): SectionalInvoicing[] {
    return [];
};

export function initialSectionalInvoicing(): SectionalInvoicing {
    return {
        // required: - sectionalInvoicingCarrierCode
        sectionalInvoicingCarrierCode: null,
        sectionalInvoicingCarrierName: null,
        startAuthority: null,
        endAuthority: null,
        executingCarrierRUCode: null,
        executingCarrierName: null,
        freightpayerTransit: initialFreightpayerTransit()
    };
};

export function initialChargingSection(): ChargingSection {
    return {
        // required: - startAuthority
        detourKM: null,
        detourZones: null,
        startAuthority: -1,
        startLocationCode: null,
        startBorderCode: null,
        startDescription: null,
        endAuthority: null,
        endLocationCode: null,
        endBorderCode: null,
        endDescription: null,
        globalIndicator: null,
        consignorsCharge: null,
        consigneesCharge: null,
        currency: null,
        nhmCode: null,
        tariffNumber: null,
        freightWeight: null
    };
};

export function initialChargingSectionList(): ChargingSection[] {
    return [];
};

export function initialCommercialTransportConditions(): CommercialTransportConditions {
    return {
        prepaymentNote: null,
        // prepaymentNoteRailway: null,
        // chargesNote: null,
        discountCode: null,
        // amountPrepaid: null,
        // prepaymentUpTo: initialPrepaymentUpTo(),
        // cashOnDelivery: initialCashOnDelivery(),
        valueOfDelivery: initialCurrencyValue(),
        valueOfCommodity: initialCurrencyValue(),
        sectionalInvoicings: initialSectionalInvoicingList(),
        chargingSections: initialChargingSectionList()
    };
};

export function initialSpecialTreatmentOrdersList(): SpecialTreatmentOrder[] {
    return [];
};

export function initialPartyAdress(): PartyAddress {
    return {
        street: null,
        houseNumber: null,
        poBox: null,
        zipCode: null,
        city: null,
        country: null,
    };
};

export function initialParty(): Party {
    const party: Party = {
        name: null,
        customerId: initialCustomerID(),
        partnerId: initialPartnerID(),
        extCustomerId: null,
        comment: null,
        signature: null,
        vatIndicator: null,
        vatId: null,
        address: initialPartyAdress(),
        contactPerson: initialContactPerson()
    }
    return party;
};

export function initialContactPerson(): ContactPerson {
    return {
        name: null,
        tel: null,
        fax: null,
        email: null
    };
};


