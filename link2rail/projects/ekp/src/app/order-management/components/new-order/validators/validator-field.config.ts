import { ValidatorFn, Validators } from "@angular/forms";
import { ContractNumberNumericValidator, ContractNumberSequenceValidator, PrepaymentNoteNeedsProductExtraChargeCodeValidator, ContractNumberSequenceValidator as prepaymentNoteNeedsProductExtraChargeCodeValidator, PrepaymentNotesValidator, prepaymentUpToAuthorityObligatoryByPrepaymentNote, prepaymentUpToBorderDescriptionObligatoryByPrepaymentNote, SpecificationValidator } from "./new-order-commercial-custom-validators";
import { attachedDocumentCodeObligatoryByDescriptionNumberOfOriginalsReferenceNumber,consignorDeclarationCodeValidator, consignorDeclarationDescriptionValidator, destinationPortObligatoryByShipOwnerShipNameDepartureDate, originPortObligatoryByShipOwnerShipNameArrivalDate } from "./new-order-sender-policy-custom-validators";
import { paymentTyeObligatoryForNationalTransportValidator, validateServiceSpecificationArray } from "./new-order-service-custom-validatiors";
import { ConsignorConsigneeValidators } from "./consignor-consignee.validators";
import { orderedTrainReferenceValidators } from "./new-order-transport-validators";
import { WagonListValidators } from "./new-order-wagon-validators";
import { PickupDeliveryValidators } from "./pickup-delivery.validators";


export const VALIDATOR_FIELD_CONFIG: ValidatorFieldConfig[] = [
    // General (include more than on section)
    // Service/Commercial
    {
        fieldName: '', //'service.serviceSpecificatio and 'commercial.prepaymentNote'   
        validatorsBooking: [paymentTyeObligatoryForNationalTransportValidator],
        // validatorsOrder: [  paymentTyeObligatoryForNationalTransportValidator,PrepaymentNotesValidator]
        validatorsOrder: [paymentTyeObligatoryForNationalTransportValidator],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },

    // Consignor-Consignee
    {
        fieldName: 'consignorConsignee.consignor.customerId',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsDraft: [Validators.required],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.consignor.partnerId',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsDraft: [Validators.required],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.freightpayerConsignor',
        validatorsBooking: [ConsignorConsigneeValidators.freightPayerConsignorAuthority, ConsignorConsigneeValidators.freightpayerConsignorSgvZip, ConsignorConsigneeValidators.freightpayerConsignorZipSgv,ConsignorConsigneeValidators.freightpayerConsignorSgvIsNumeric],
        validatorsOrder: [ ConsignorConsigneeValidators.freightPayerConsignorAuthority,ConsignorConsigneeValidators.freightpayerConsignorSgvZip, ConsignorConsigneeValidators.freightpayerConsignorZipSgv,ConsignorConsigneeValidators.freightpayerConsignorSgvIsNumeric],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.loadingParty',
        validatorsBooking: [ConsignorConsigneeValidators.loadingPartyCustomerIdNumeric, ConsignorConsigneeValidators.loaderZip, ConsignorConsigneeValidators.loadingPartySgvZip],
        validatorsOrder: [ConsignorConsigneeValidators.loadingPartyCustomerIdNumeric, ConsignorConsigneeValidators.loaderZip, ConsignorConsigneeValidators.loadingPartySgvZip],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.consignee.authorityOfCustomerId',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.consignee.customerId',
        validatorsBooking: [],
        validatorsOrder: [],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.consignee.name',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },    
    {
        fieldName: 'consignorConsignee.consignee.city',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.consignee.country',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.consignee',
        validatorsBooking: [ConsignorConsigneeValidators.ConsigneeGermanZipCode],
        validatorsOrder: [ConsignorConsigneeValidators.ConsigneeGermanZipCode],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.freightPayerConsignee',
        validatorsBooking: [ConsignorConsigneeValidators.freightPayerConsigneeSgvNumeric],
        validatorsOrder: [ConsignorConsigneeValidators.freightPayerConsigneeSgvNumeric],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
        fieldName: 'consignorConsignee.freightPayerConsignee',
        validatorsBooking: [ConsignorConsigneeValidators.freightPayerConsigneeZipCodeRequired],
        validatorsOrder: [ConsignorConsigneeValidators.freightPayerConsigneeZipCodeRequired],
        validatorsBookingAC: [],
        validatorsOrderAC: []
    },
    {
    fieldName: 'consignorConsignee.unloadingParty',
    validatorsBooking: [ConsignorConsigneeValidators.unloadingPartySgv],
    validatorsOrder: [ConsignorConsigneeValidators.unloadingPartySgv],
    validatorsBookingAC: [],
    validatorsOrderAC: []
    },
    {
    fieldName: 'consignorConsignee.unloadingParty',
    validatorsBooking: [ConsignorConsigneeValidators.unloadingPartyZip],
    validatorsOrder: [ConsignorConsigneeValidators.unloadingPartyZip],
    validatorsBookingAC: [],
    validatorsOrderAC: []
    },
    // Pickup - Delivery
    {
        // Rule 17
        fieldName: 'pickupDelivery.pickupCountry',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },
    {
        // Rule 18
        fieldName: 'pickupDelivery',
        validatorsBooking: [PickupDeliveryValidators.pickupStationHasMaritimePoint],
        validatorsOrder: [PickupDeliveryValidators.pickupStationHasMaritimePoint],
        validatorsBookingAC: [PickupDeliveryValidators.pickupStationHasMaritimePoint],
        validatorsOrderAC: [PickupDeliveryValidators.pickupStationHasMaritimePoint]
    },
    {
        // Rule 19
        fieldName: 'pickupDelivery.pickupStation',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },
    {
        // Rule 20
        fieldName: 'pickupDelivery.deliveryCountry',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },
    {
        // Rule 21
        fieldName: 'pickupDelivery.deliveryStation',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },
      // Rule 22
    {
        fieldName: 'pickupDelivery',
        validatorsBooking: [PickupDeliveryValidators. deliveryStationHasMaritimePoint],
        validatorsOrder: [PickupDeliveryValidators. deliveryStationHasMaritimePoint],
        validatorsBookingAC: [PickupDeliveryValidators. deliveryStationHasMaritimePoint],
        validatorsOrderAC: [PickupDeliveryValidators. deliveryStationHasMaritimePoint]
    },
    {
        // Rule 23
        fieldName: '',
        validatorsBooking: [PickupDeliveryValidators.shippingDateValidatorBooking],
        validatorsOrder: [PickupDeliveryValidators.shippingDateValidatorOrder],
        validatorsBookingAC: [PickupDeliveryValidators.shippingDateValidatorBooking],
        validatorsOrderAC: [PickupDeliveryValidators.shippingDateValidatorOrder]
    },
    {
        // Rule 23
        fieldName: 'pickupDelivery.shippingTime',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },

    // Transport
    {
        // Rule 25
        fieldName: 'transport.transportationType',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },
    {
        // Rule 26
        fieldName: 'transport.typeOfTransportCode',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },
    {
        // Rule 27
        fieldName: 'transport', //.orderedTrainReference',
        validatorsBooking: [orderedTrainReferenceValidators],
        validatorsOrder: [orderedTrainReferenceValidators],
        validatorsBookingAC: [orderedTrainReferenceValidators],
        validatorsOrderAC: [orderedTrainReferenceValidators]
    },
    {
        fieldName: 'transport.dangerousgoodLaw',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },
    {
        fieldName: 'transport.consignmentNoteTypeOfConsignment',
        validatorsBooking: [Validators.required],
        validatorsOrder: [Validators.required],
        validatorsBookingAC: [Validators.required],
        validatorsOrderAC: [Validators.required]
    },

     // Wagon
        // Rule 29 Wagenanzahl keine Fehlauswahl möglich      
     {
         // Rule 31 Wagennummer
         // Rule 32 Wagengattung
         // Rule 33 Gewicht Rule 33 Gewicht
         fieldName: '',
         validatorsBooking: [WagonListValidators.wagonListValidatorBooking],
         validatorsBookingAC: [WagonListValidators.wagonListValidatorBooking],
         validatorsOrder: [WagonListValidators.wagonListValidatorOrder],
         validatorsOrderAC: [WagonListValidators.wagonListValidatorOrder]
     },

    //{
        // Rule 35 NHM
        //fieldName: 'wagonData.firstGoodNhmCode',
        //validatorsBooking: [Validators.required],
        //validatorsOrder: [Validators.required],
        //validatorsBookingAC: [Validators.required],
        //validatorsOrderAC: [Validators.required]
   // },

    // Commercial
    {
        fieldName: 'commercial.prepaymentNote',
        validatorsBooking: [prepaymentNoteNeedsProductExtraChargeCodeValidator],
        validatorsOrder: [prepaymentNoteNeedsProductExtraChargeCodeValidator],
        validatorsBookingAC: [prepaymentNoteNeedsProductExtraChargeCodeValidator],
        validatorsOrderAC: [prepaymentNoteNeedsProductExtraChargeCodeValidator]
    },
    {
        fieldName: '',
        validatorsBooking: [PrepaymentNotesValidator],
        validatorsOrder: [PrepaymentNotesValidator],
        validatorsBookingAC: [PrepaymentNotesValidator],
        validatorsOrderAC: [PrepaymentNotesValidator]
    },
    {   //Rule 61
        fieldName: 'commercial',
        validatorsBooking: [prepaymentUpToAuthorityObligatoryByPrepaymentNote],
        validatorsOrder: [prepaymentUpToAuthorityObligatoryByPrepaymentNote],
        validatorsBookingAC: [prepaymentUpToAuthorityObligatoryByPrepaymentNote],
        validatorsOrderAC: [prepaymentUpToAuthorityObligatoryByPrepaymentNote]
    },
    {   //Rule 62
        fieldName: 'commercial',
        validatorsBooking: [prepaymentUpToBorderDescriptionObligatoryByPrepaymentNote],
        validatorsOrder: [prepaymentUpToBorderDescriptionObligatoryByPrepaymentNote],
        validatorsBookingAC: [prepaymentUpToBorderDescriptionObligatoryByPrepaymentNote],
        validatorsOrderAC: [prepaymentUpToBorderDescriptionObligatoryByPrepaymentNote]
    },

    {
        fieldName: 'commercial.commercialSpecifications',
        validatorsBooking: [SpecificationValidator],
        validatorsOrder: [SpecificationValidator],
        validatorsBookingAC: [SpecificationValidator],
        validatorsOrderAC: [SpecificationValidator]
    },
    {
        fieldName: 'commercial',
        validatorsBooking: [ContractNumberSequenceValidator],
        validatorsOrder: [ContractNumberSequenceValidator],
        validatorsBookingAC: [ContractNumberSequenceValidator],
        validatorsOrderAC: [ContractNumberSequenceValidator]
    },

    {
        fieldName: 'commercial',
        validatorsBooking: [PrepaymentNoteNeedsProductExtraChargeCodeValidator],
        validatorsOrder: [PrepaymentNoteNeedsProductExtraChargeCodeValidator],
        validatorsBookingAC: [PrepaymentNoteNeedsProductExtraChargeCodeValidator],
        validatorsOrderAC: [PrepaymentNoteNeedsProductExtraChargeCodeValidator]
    },

    // Sevice
    {
        fieldName: 'service.serviceSpecification',
        validatorsBooking: [validateServiceSpecificationArray ],
        validatorsOrder: [validateServiceSpecificationArray],
        validatorsBookingAC: [validateServiceSpecificationArray],
        validatorsOrderAC: [validateServiceSpecificationArray]
    },
    // Sender policy   

    {
        fieldName: 'senderPolicy.consignorDeclarations',
        validatorsBooking: [consignorDeclarationDescriptionValidator,consignorDeclarationCodeValidator],
        validatorsOrder: [consignorDeclarationDescriptionValidator,consignorDeclarationCodeValidator],
        validatorsBookingAC: [consignorDeclarationDescriptionValidator,consignorDeclarationCodeValidator],
        validatorsOrderAC: [consignorDeclarationDescriptionValidator,consignorDeclarationCodeValidator]
    },

    {
        fieldName: 'senderPolicy', //.takeOverConditionsOriginPort',
        validatorsBooking: [originPortObligatoryByShipOwnerShipNameArrivalDate],
        validatorsOrder: [originPortObligatoryByShipOwnerShipNameArrivalDate],
        validatorsBookingAC: [originPortObligatoryByShipOwnerShipNameArrivalDate],
        validatorsOrderAC: [originPortObligatoryByShipOwnerShipNameArrivalDate]
    },
    {
        fieldName: 'senderPolicy', //.handOverConditionsDestinationPort',
        validatorsBooking: [destinationPortObligatoryByShipOwnerShipNameDepartureDate],
        validatorsOrder: [destinationPortObligatoryByShipOwnerShipNameDepartureDate],
        validatorsBookingAC: [destinationPortObligatoryByShipOwnerShipNameDepartureDate],
        validatorsOrderAC: [destinationPortObligatoryByShipOwnerShipNameDepartureDate]
    },
    {
        fieldName: 'senderPolicy.attachedDocuments',
        validatorsBooking: [attachedDocumentCodeObligatoryByDescriptionNumberOfOriginalsReferenceNumber],
        validatorsOrder: [attachedDocumentCodeObligatoryByDescriptionNumberOfOriginalsReferenceNumber],
        validatorsBookingAC: [attachedDocumentCodeObligatoryByDescriptionNumberOfOriginalsReferenceNumber],
        validatorsOrderAC: [attachedDocumentCodeObligatoryByDescriptionNumberOfOriginalsReferenceNumber]
    },
    {
        fieldName: 'senderPolicy.attachedDocuments.attachedDocumentCode',
        validatorsAlways: [Validators.maxLength(3)],
        validatorsBooking: [Validators.maxLength(3)],
        validatorsOrder: [Validators.maxLength(3)],
        validatorsBookingAC: [Validators.maxLength(3)],
        validatorsOrderAC: [Validators.maxLength(3)]
    }


];

export interface ValidatorFieldConfig {
    fieldName: string;
    validatorsBooking?: ValidatorFn[];
    validatorsBookingAC?: ValidatorFn[];
    validatorsOrder?: ValidatorFn[];
    validatorsOrderAC? :ValidatorFn[];
    validatorsDraft?: ValidatorFn[];
    validatorsAlways?: ValidatorFn[];
    validatorsAC?: ValidatorFn[];
}

export enum ValidationMode {
    VALIDATORS_BOOKING = 'validatorsBooking',
    VALIDATORS_BOOKING_AC = 'validatorsBookingAC',
    VALIDATORS_ORDER = 'validatorsOrder',
    VALIDATORS_ORDER_AC = 'validatorsOrderAC',
    VALIDATORS_DRAFT = 'validatorsDraft',
    VALIDATORS_ALWAYS = 'validatorsAllways',
    VALIDATORS_AC = 'validatorsAC'
}