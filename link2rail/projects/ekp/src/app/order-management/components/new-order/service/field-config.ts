import { RailOrderStatus } from "@src/app/order-management/models/general-order";
import { FieldConfig } from "../models/new-order-field.config";
import { RailOrderStage } from "../../wagon-view/models/api-wagon-list";

export const fieldConfig: FieldConfig[] =
[
    {
        fieldName: "consignorConsignee.consignor.country",
        allwaysDisabled: true
    },
    {
        fieldName: "consignorConsignee.consignor.street",
        allwaysDisabled: true
    },
    {
        fieldName: "consignorConsignee.consignor.customerId",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignor.partnerId",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignor.city",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.consignor.street",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignor.country",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignor.email",
        editableAC: true,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.freightpayerConsignor.sgv",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.freightpayerConsignor.authorityOfCustomerId",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.freightpayerConsignor.vatId",
        editableAC: false,
        editableStatus: []
    },

    {
        fieldName: "consignorConsignee.freightpayerConsignor.zipCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.loadingParty.sgv",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.loadingParty.authorityOfCustomerId",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.loadingParty.name",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.loadingParty.zipCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.consignee.authorityOfCustomerId",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignee.customerId",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignee.name",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignee.zipCode",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignee.city",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignee.street",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignee.country",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.consignee.email",
        editableAC: true,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.freightPayerConsignee.sgv",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.freightPayerConsignee.zipCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.freightPayerConsignee.authorityOfCustomerId",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.freightPayerConsignee.vatId",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.unloadingParty.sgv",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.consignor.authorityOfCustomerId",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "consignorConsignee.unloadingParty.authorityOfCustomerId",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.unloadingParty.name",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "consignorConsignee.unloadingParty.zipCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "senderPolicy.consignorDeclarations.consignorDeclarationCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "senderPolicy.consignorDeclarations.consignorDeclarationDescription",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "senderPolicy.consignorDeclarations.consignorDeclarationAdditionalInformation",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "pickup.pickupCountry",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "pickup.pickupStation",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "pickup.pickupSealoadingpoint",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "pickup.pickupLocationInfo",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "pickup.pickupLocationCode",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "pickup.pickupLocationText",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "delivery.deliveryLocationInfo",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "delivery.deliveryLocationCode",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "delivery.deliveryLocationText",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "delivery.deliveryCountry",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "delivery.deliveryStation",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "delivery.deliverySealoadingpoint",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "commercial.prepaymentNote",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.productExtraChargeCodes.productExtraChargeCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.prepaymentUpToBorderDescription",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.prepaymentUpToAuthority",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialSpecification",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialSpecifications.commercialSpecificationAdditionalInfo",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialSpecifications.commercialSpecificationCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialSpecificationAdditionalInfo",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialInformationNhmCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialInformationContractNumber",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialInformationDiscountCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialInformationValueOfCommodityPrice",
        allwaysDisabled: true,
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialInformationValueOfCommodityCurrency",
        allwaysDisabled: true,
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialInformationValueOfDeliveryPrice",
        allwaysDisabled: true,
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "commercial.commercialInformationValueOfDeliveryCurrency",
        allwaysDisabled: true,
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "transport.transportationType",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "transport.typeOfTransportCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "transport.customsDataCustomsDescriptor",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "transport.consignmentNoteTypeOfConsignment",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "transport.dangerousgoodLaw",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "transport.coreConfiguration",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "service.serviceSpecification.productExtraChargeCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "service.serviceSpecification.authority",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "service.serviceSpecification.locationCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "service.serviceSpecification.specialTreatmentChargingPrepayment",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "service.serviceSpecification.info",
        editableAC: false,
        editableStatus: []
    },
    {

        fieldName: "senderPolicy.annotationOfConsignorDescription",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "senderPolicy.consignorDeclarationDescription",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "senderPolicy.consignorDeclarationAdditionalInformation",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "wagonData.wagonInformationList.firstGoodNhmCode",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "wagonData.wagonInformationList.loadingStatus",
        editableAC: false,
        editableStatus: []
    },
    {
        fieldName: "wagonDetails.goodsInformationList.unNr",
        allwaysDisabled: true
    },
    {
        fieldName: "wagonDetails.goodsInformationList.additionalInformation",
        editableAC: true,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "wagonDetails.goodsInformationList.specialInstruction",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    /*{
        fieldName: "wagonDetails.goodsInformationList.specialInstructionDisplay",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "wagonDetails.goodsInformationList.additionalInformationNag",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },
    {
        fieldName: "wagonDetails.goodsInformationList.specialInstruction",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    },*/
    {
        fieldName: "wagonDetails.loadingTacklesList.type",
        editableAC: false,
        editableStatus: [],
        disableStage: [RailOrderStage.BOOKING]
    }


]
