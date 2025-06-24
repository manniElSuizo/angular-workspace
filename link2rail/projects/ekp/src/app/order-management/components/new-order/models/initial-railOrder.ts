import { AcceptancePoint, AttachedDocument, ContactPerson, CurrencyValue, CustomerID, DeliveryPoint, ExceptionalConsignment, ExternalReference, HandoverConditions, initailDeliveryPoint, initalExternalReferenceList, initialAcceptancePoint, initialAttachedDocumentsList, initialCommercialConsignmentNote, initialCommercialTransportConditions, initialContactPerson, initialCurrencyValue, initialCustomerID, initialCustomsData, initialHandoverConditions, initialOperationalTransportConditions, initialOrderKey, initialPartnerID, initialParty, initialPrepaymentUpTo, initialSpecialAnnotations, initialSpecialTreatmentOrdersList, initialTakeOverConditions, initialWagonInformationList, OperationalTransportConditions, PackingUnit, PartnerID, PartyAddress, PrepaymentUpTo, ProductionLocation, RailOrder, Seal, SpecialTreatmentOrderUTI, TakeOverConditions, TypeOfConsignment } from "@src/app/order-management/models/rail-order-api";
import { OrderKey } from "../../wagon-view/models/api-wagon-list";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class RailOrderNoTemplateService {
    public getCompleteInitialRailOrderNoTemplate(): RailOrderNoTemplate {
        const railOrder: RailOrderNoTemplate = {
            contractNumber: null,
            templateNumber: null,
            templateName: null,
            serviceType: null,
            specialTreatmentOrders: [this.getEmptySpecialTreatmentOrderNoTemplate()],
            externalReferences: [],
            shippingTimestamp: null,
            numberOfWagons: null,
            typeOfTransportDescription: null,
            orderedTrainReference: null,
            type: null,
            exceptionalConsignmentIndicator: null,
            coreConfiguration: null,
            transportationType: null,
            modeOfTransport: null,
            dangerousGoodLaw: null,
            operationalTransportConditions: initialOperationalTransportConditions(),
            commercialTransportConditions: {
                prepaymentNote: null,
                discountCode: null,
                prepaymentUpTo: initialPrepaymentUpTo(),
                valueOfDelivery: initialCurrencyValue(),
                valueOfCommodity: initialCurrencyValue(),
                sectionalInvoicings: [new SectionalInvoicingNoTemplate()],
                chargingSections: [new ChargingSectionNoTemplate()]
            },
            consignmentNote: new ConsignmentNoteNoTemplate(),
            customsData: new CustomsDataNoTemplate(),
            attachedDocuments: [],
            wagonInformation: [this.getWagonInformationNoTemplate()],
            specialAnnotations: this.getSpecialAnnotationsNoTemplate(),
            acceptancePoint: {
                ...initialAcceptancePoint(),
                commercialLocation: {
                    authority: null,
                    locationCode: null,
                    locationName: null
                }
            },
            deliveryPoint: {
                ...initailDeliveryPoint(),
                commercialLocation: {
                    authority: null,
                    locationCode: null,
                    locationName: null
                }
            },
            unloadingParty: this.getPartyNoTemplate(),
            loadingParty: this.getPartyNoTemplate(),
            consignor: this.getPartyNoTemplate(),
            consignee: this.getPartyNoTemplate(),
            freightpayerConsignor: this.getPartyNoTemplate(),
            freightpayerConsignee: this.getPartyNoTemplate(),
            handOverConditions: initialHandoverConditions(),
            takeOverConditions: initialTakeOverConditions(),
        };
        return railOrder;
    }
    private getPartyNoTemplate(): PartyNoTemplate {
        const party = new PartyNoTemplate();
        party.address = {
            street: null,
            houseNumber: null,
            poBox: null,
            zipCode: null,
            city: null,
            country: null
        };
        party.contactPerson = initialContactPerson();
        party.customerId = initialCustomerID();
        party.partnerId = initialPartnerID();
        return party;
    }

    private getSpecialAnnotationsNoTemplate(): SpecialAnnotationsNoTemplate {
        return {
            annotationOfConsignorDescription: null,
            additionalDeclarationOfCarrier: null,
            consignorDeclarations: [new ConsignorDeclarationNoTemplate()],
            commercialSpecifications: [new CommercialSpecificationNoTemplate()]
        };
    }

    private getWagonInformationNoTemplate(): WagonInformationNoTemplate {
        return {
            wagonNumber: null,
            loadingStatus: null,
            dangerousGoodIndicator: null,
            goodWeight: null,
            loadingTacklesWeight: null,
            seals: [],
            goods: [this.getGoodNoTemplate()],
            loadingTackles: [new LoadingTacklesNoTemplate()],
            externalReferences: [],
            typeOfWagon: null,
            exceptionalConsignments: []
        };
    }

    private getGoodNoTemplate(): GoodNoTemplate {
        return {
            nhmCode: null,
            additionalDescription: null,
            additionalDeclarationCode: null,
            weight: null,
            volume: null,
            unit: null,
            wasteId: null,
            customsReferenceNumber: null,
            dangerousGoods: [new DangerousGoodNoTemplate()],
            packingUnits: [],
            externalReferences: []
        };
    }

    private getEmptySpecialTreatmentOrderNoTemplate(): SpecialTreatmentOrderNoTemplate {
        return {
            productName: null,
            info: null,
            productExtraChargeCode: null,
            authority: null,
            locationCode: null,
            locationName: null,
            includedInPrepaymentNote: null,
            specialTreatmentChargings: [this.getSpecialTreatmentChargingNoTemplate()]
        };
    }

    private getSpecialTreatmentChargingNoTemplate(): SpecialTreatmentChargingNoTemplate {
        return {prepayment: null};
    }

    public getEmptySectionalInvoicing(): SectionalInvoicingNoTemplate {
        return new SectionalInvoicingNoTemplate();
    }

    public getEmptyChargingSection(): ChargingSectionNoTemplate {
        return new ChargingSectionNoTemplate();
    }

    public CLASSES = {
        SpecialTreatmentOrderNoTemplate,
        WagonInformationNoTemplate,
        SpecialTreatmentChargingNoTemplate,
        SectionalInvoicingNoTemplate,
        ChargingSectionNoTemplate,
        ConsignorDeclarationNoTemplate,
        CommercialSpecificationNoTemplate,
        GoodNoTemplate,
        LoadingTacklesNoTemplate,
        DangerousGoodNoTemplate
    };

    public CLASSES_STRING = [
        "SpecialTreatmentOrderNoTemplate",
        "WagonInformationNoTemplate",
        "SpecialTreatmentChargingNoTemplate",
        "SectionalInvoicingNoTemplate",
        "ChargingSectionNoTemplate",
        "ConsignorDeclarationNoTemplate",
        "CommercialSpecificationNoTemplate",
        "GoodNoTemplate",
        "LoadingTacklesNoTemplate",
        "DangerousGoodNoTemplate"
    ];
}

export class RailOrderNoTemplate {
    contractNumber?: string;
    templateNumber?: string;
    templateName?: string;
    serviceType?: string;
    specialTreatmentOrders?: SpecialTreatmentOrderNoTemplate[];
    externalReferences?: ExternalReference[];
    shippingTimestamp?: string;
    numberOfWagons?: number;
    typeOfTransportDescription?: string;
    orderedTrainReference: string;
    type?: string;
    exceptionalConsignmentIndicator?: boolean;
    coreConfiguration?: string;
    transportationType?: string;
    modeOfTransport?: string;
    dangerousGoodLaw: string;
    operationalTransportConditions?: OperationalTransportConditions;
    commercialTransportConditions?: CommercialTransportConditionsNoTemplate;
    consignmentNote?: ConsignmentNoteNoTemplate;
    customsData?: CustomsDataNoTemplate;
    attachedDocuments?: AttachedDocument[];
    wagonInformation?: WagonInformationNoTemplate[];
    specialAnnotations?: SpecialAnnotationsNoTemplate;
    acceptancePoint?: AcceptancePoint;
    deliveryPoint?: DeliveryPoint;
    unloadingParty?: PartyNoTemplate;
    loadingParty?: PartyNoTemplate;
    consignor?: PartyNoTemplate;
    consignee?: PartyNoTemplate;
    freightpayerConsignor?: PartyNoTemplate;
    freightpayerConsignee?: PartyNoTemplate;
    handOverConditions: HandoverConditions;
    takeOverConditions: TakeOverConditions;
};

export class SpecialTreatmentOrderNoTemplate {
    productName?: string;
    info?: string;
    productExtraChargeCode: number;
    authority?: number;
    locationCode?: string;
    locationName?: string;
    includedInPrepaymentNote?: boolean;
    specialTreatmentChargings?: SpecialTreatmentChargingNoTemplate[];
};

export class SpecialTreatmentChargingNoTemplate {
    prepayment?: string;
};

export class CommercialTransportConditionsNoTemplate {
    prepaymentNote?: string;
    discountCode?: string;
    prepaymentUpTo?: PrepaymentUpTo;
    valueOfDelivery?: CurrencyValue;
    valueOfCommodity?: CurrencyValue;
    sectionalInvoicings?: SectionalInvoicingNoTemplate[];
    chargingSections?: ChargingSectionNoTemplate[];
};

export class SectionalInvoicingNoTemplate {
    sectionalInvoicingCarrierCode?: string;
    executingCarrierRUCode?: string;
};


export class ChargingSectionNoTemplate {
    nhmCode?: string;
    startAuthority?: number;
    startLocationCode?: string;
    endAuthority?: number;
    endLocationCode?: string;
    currency?: string;
};

export class ConsignmentNoteNoTemplate {
    consignmentNumber?: number;
    typeOfConsignment?: TypeOfConsignment;
};

export class CustomsDataNoTemplate {
    additionalCustomsProcedure?: string;
    customsDescriptor?: string;
};

export class SpecialAnnotationsNoTemplate {
    annotationOfConsignorDescription?: string;
    additionalDeclarationOfCarrier?: string;
    consignorDeclarations?: ConsignorDeclarationNoTemplate[];
    commercialSpecifications?: CommercialSpecificationNoTemplate[];
};

export class ConsignorDeclarationNoTemplate {
    code: string;
    additionalInformation?: string;
};

export class CommercialSpecificationNoTemplate {
    code: string;
    additionalInformation?: string;
};

export class PartyNoTemplate {
    name?: string;
    customerId?: CustomerID;
    partnerId?: PartnerID;
    comment?: string;
    vatId?: string;
    address?: PartyAddress;
    contactPerson?: ContactPerson;
};

// WagonInformation

export class WagonInformationNoTemplate {
    wagonNumber?: string
    loadingStatus: boolean;
    dangerousGoodIndicator?: boolean;
    goodWeight?: number;
    loadingTacklesWeight?: number;
    seals: Seal[];
    goods: GoodNoTemplate[];
    loadingTackles: LoadingTacklesNoTemplate[];
    externalReferences?: ExternalReference[];
    typeOfWagon?: string;
    exceptionalConsignments?: ExceptionalConsignment[];
};

export class GoodNoTemplate {
    nhmCode?: string;
    additionalDescription?: string;
    additionalDeclarationCode?: string;
    weight?: number;
    volume?: number;
    unit?: string;
    wasteId?: number;
    customsReferenceNumber?: string;
    dangerousGoods?: DangerousGoodNoTemplate[];
    packingUnits?: PackingUnit[];
    externalReferences?: ExternalReference[];
};

export class DangerousGoodNoTemplate {
    classificationCode?: string;
    class?:string;
    description?: string;
    unNr?: string;
    dangerIdentificationNumber?: string;
    explosiveMass?: number;
    weight?: number;
    emptyPackingUnit?: string;
    packingGroup?: string;
    specialInstruction?: string;
    restrictionFlag?: boolean;
    additionalInformation?: string;
    wasteIndicator?: boolean;
    dangerLabels?: string[];
    approvalFlag?: boolean;
    accidentInformationSheetNr?: string;
    nagFlag?: boolean;
};

export class LoadingTacklesNoTemplate {
    type: string;
    number?: number;
    weight: number;
    identifier?: string;
};
