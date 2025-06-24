import { OrderDetails } from "@src/app/trainorder/models/ApiOrders.model";
import { TrainSummary, TrainChainType } from "@src/app/trainorder/models/ApiTrainsList.models";
import { Authorization } from "@src/app/trainorder/models/authorization";

export const trainSummaryRoundTrip: TrainSummary = {
    trains: [
        {
            trainId: "TR2180DE60610-----002024",
            trainNumber: "60610",
            productionDate: new Date("2024-05-10"),
            startDate: new Date("2024-05-10")
        }
    ],
    trainChainIdentifier: {
        trainChainId: "IT2180DE60610-----002024/1",
        trainChainDate: new Date("2024-05-10"),
        trainChainName: "Beddingen - Waltershof",
        trainChainType: TrainChainType.ROUNDTRIP
    },
    sendingStation: {
        name: "BEDDINGEN",
        objectKeyAlpha: "BEDDINGEN",
        objectKeySequence: 1,
        tafTsiPrimaryCode: "10720",
        country: "DE"
    },
    receivingStation: {
        name: "Waltershof Hansaport",
        objectKeyAlpha: "HANSAPORT",
        objectKeySequence: 1,
        tafTsiPrimaryCode: "81399",
        country: "DE"
    },
    plannedDeparture: new Date("2024-05-10T16:32:00+0000"),
    plannedArrival: new Date("2024-05-10T20:03:00+0000"),
    numberOfConstructionSites: 0,
    productType: "REGULAR_TRAIN",
    operationalMode: "LOAD",
    orderStatus: "ORDER_ACCEPTED",
    cancelable: true,
    cancelReasonName: "",
    authorization: [
        Authorization.READ_ORDER,
        Authorization.CREATE_ORDER_FLEXTRAIN,
        Authorization.READ_ORDER_DETAILS,
        Authorization.CANCEL_SPECIAL_TRAIN,
        Authorization.REDUCTION,
        Authorization.READ_TRAIN,
        Authorization.READ_TRAIN_POSITION,
        Authorization.READ_TRACKING,
        Authorization.READ_TRAIN_DETAILS,
        Authorization.CANCEL_TRAIN,
    ],
    actualDeparture: undefined,
    actualArrival: undefined,
    cancellationFee: false,
    currentLocation: "",
    delayInMinutes: 0,
    comments: true,
    progress: 0,
    customerServiceRemark: "",
    currentTrainNumber: ""
};

export const orderDetail: OrderDetails = {
    orderer: {
        name: "ArcelorMittal Hamburg GmbH",
        sgvId: "489104",
        partnerId: "1000409",
        siteName: "Stammsitz"
    },
    customerLanguage: "de",
    sender: {
        name: "ArcelorMittal Hamburg GmbH",
        sgvId: "489104",
        partnerId: "1000409",
        siteName: "Stammsitz"
    },
    sendingStation: {
        name: "BEDDINGEN",
        objectKeyAlpha: "BEDDINGEN",
        objectKeySequence: 1
    },
    wagonStoringPositionSender: {
        name: "Ausfahrt",
        objectKeyAlpha: "",
        objectKeySequence: 1
    },
    firstCarrier: {
        name: "DB Cargo AG",
        uicCompanyCode: "2180"
    },
    receiver: {
        name: "ArcelorMittal Hamburg GmbH",
        sgvId: "489104",
        partnerId: "1000409",
        siteName: "Stammsitz"
    },
    receivingStation: {
        name: "HAMBURG-WALTERSHF HP",
        objectKeyAlpha: "HAMBURG-WALTERSHF HP",
        objectKeySequence: 1
    },
    wagonStoringPositionReceiver: {
        name: "Einfahrt",
        objectKeyAlpha: "",
        objectKeySequence: 1
    },
    lastCarrier: {
        name: "DB Cargo AG",
        uicCompanyCode: "2180"
    },
    cargo: [
        {
            weight: 1570,
            length: 630,
            bzaNumber: "A3-8700/24",
            maximumSpeed: 120,
            nhmCode: "",
            nhmCodeText: "",
            numberOfWagons: 0,
            netWeight: 0,
            intermodalProfileP2: 0,
            intermodalProfileP3: 0,
            intermodalProfileC2: 0,
            intermodalProfileC3: 0,
            items: []
        }
    ],
    shipmentDate: "2024-05-10",
    orderReason: "Bestellung Kunde",
    earliestHandover: "2024-05-10T16:32:00+0000",
    latestHandover: "2024-05-10T16:32:00+0000",
    earliestDelivery: "2024-05-10T20:03:00+0000",
    latestDelivery: "2024-05-10T20:03:00+0000",
    carrierRoute: [
        {
            carrier: {
                name: "DB Cargo AG",
                uicCompanyCode: "2180"
            },
            sendingStation: {
                name: "BEDDINGEN",
                objectKeyAlpha: "BEDDINGEN",
                objectKeySequence: 1
            },
            receivingStation: {
                name: "HAMBURG-WALTERSHF HP",
                objectKeyAlpha: "HAMBURG-WALTERSHF HP",
                objectKeySequence: 1
            },
            trainNumber: "60610",
            productionDate: new Date("2024-05-10"),
            plannedDeparture: "2024-05-10T16:32:00+0000",
            plannedArrival: "2024-05-10T20:03:00+0000"
        }
    ],
    trainType: "REGULAR_TRAIN",
    borderStations: [],
    customs: [],
    reasonOrderName: "Bestellung Kunde",
    reasonCancelName: "",
    authorization: [],
    loader: undefined,
    sendingWorkDirection: "",
    unloader: undefined,
    receivingWorkDirection: "",
    customerReference: "",
    ordererEmail: "",
    cancellationEmail: "",
    miscInformation: "",
    orderStatus: "",
    cancelationReason: "",
    reasonRejection: "",
    reductionNote: "",
    orderDateTime: "",
    cancellationDateTime: "",
    mainCarrier: undefined,
    marketSegmentCode: undefined,
    marketSegmentName: undefined,
    customerFreetext: ""
};

export const trainChainDetailsRoundTrip = {
    trainChainIdentifier: {
        trainChainId: "IT2180DE60610-----002024/1",
        trainChainDate: "2024-05-10",
        trainChainName: "Beddingen - Waltershof",
        trainChainType: "ROUNDTRIP"
    },
    trainChainName: "Beddingen - Waltershof",
    trains: [
        {
            train: {
                trainId: "TR2180DE60610-----002024",
                trainNumber: "60610",
                productionDate: "2024-05-10",
                startDate: "2024-05-10"
            },
            sgvNumber: "489104",
            timetableDaily: {
                sendingStation: {
                    name: "BEDDINGEN",
                    objectKeyAlpha: "BEDDINGEN",
                    objectKeySequence: 1,
                    tafTsiPrimaryCode: "10720",
                    country: "DE"
                },
                receivingStation: {
                    name: "Waltershof Hansaport",
                    objectKeyAlpha: "HANSAPORT",
                    objectKeySequence: 1,
                    tafTsiPrimaryCode: "81399",
                    country: "DE"
                },
                plannedDeparture: "2024-05-10T16:32:00+0000",
                plannedArrival: "2024-05-10T20:03:00+0000",
                lengthMax: "630",
                weightMax: "1570",
                speedMax: 120,
                bzaNumber: "A3-8700/24",
                routeLocations: [
                    {
                        location: {
                            name: "BEDDINGEN",
                            objectKeyAlpha: "BEDDINGEN",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "10720",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T16:32:00+0000",
                        lengthMax: "630",
                        weightMax: "1570"
                    },
                    {
                        location: {
                            name: "LEHRTE NORD",
                            objectKeyAlpha: "LEHRTE NORD",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "16185",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T17:08:00+0000",
                        plannedArrival: "2024-05-10T17:05:00+0000"
                    },
                    {
                        location: {
                            name: "GARSSEN",
                            objectKeyAlpha: "GARSSEN",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "13567",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T17:45:00+0000",
                        plannedArrival: "2024-05-10T17:31:00+0000"
                    },
                    {
                        location: {
                            name: "UNTERLUESS",
                            objectKeyAlpha: "UNTERLUESS",
                            objectKeySequence: 2,
                            tafTsiPrimaryCode: "20512",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T18:14:00+0000",
                        plannedArrival: "2024-05-10T18:02:00+0000"
                    },
                    {
                        location: {
                            name: "DEUTSCH EVERN",
                            objectKeyAlpha: "DEUTSCH EVERN",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "12174",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T18:57:00+0000",
                        plannedArrival: "2024-05-10T18:51:00+0000"
                    },
                    {
                        location: {
                            name: "WINSEN (LUHE)",
                            objectKeyAlpha: "WINSEN (LUHE)",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "21201",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T19:23:00+0000",
                        plannedArrival: "2024-05-10T19:13:00+0000"
                    },
                    {
                        location: {
                            name: "MASCHEN RBF MSOF",
                            objectKeyAlpha: "MASCHEN RBF MSOF",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "16860",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T19:37:00+0000",
                        plannedArrival: "2024-05-10T19:34:00+0000"
                    },
                    {
                        location: {
                            name: "Waltershof Hansaport",
                            objectKeyAlpha: "HANSAPORT",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "81399",
                            country: "DE"
                        },
                        plannedArrival: "2024-05-10T20:03:00+0000"
                    }
                ]
            },
            timetableYearly: {
                sendingStation: {
                    name: "BEDDINGEN",
                    objectKeyAlpha: "BEDDINGEN",
                    objectKeySequence: 1,
                    tafTsiPrimaryCode: "10720",
                    country: "DE"
                },
                receivingStation: {
                    name: "Waltershof Hansaport",
                    objectKeyAlpha: "HANSAPORT",
                    objectKeySequence: 1,
                    tafTsiPrimaryCode: "81399",
                    country: "DE"
                },
                plannedDeparture: "2024-05-10T16:32:00+0000",
                plannedArrival: "2024-05-10T20:03:00+0000",
                lengthMax: "630",
                weightMax: "1570",
                speedMax: 120,
                bzaNumber: "A3-8700/24",
                routeLocations: [
                    {
                        location: {
                            name: "BEDDINGEN",
                            objectKeyAlpha: "BEDDINGEN",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "10720",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T16:32:00+0000",
                        lengthMax: "630",
                        weightMax: "1570"
                    },
                    {
                        location: {
                            name: "LEHRTE NORD",
                            objectKeyAlpha: "LEHRTE NORD",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "16185",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T17:08:00+0000",
                        plannedArrival: "2024-05-10T17:05:00+0000"
                    },
                    {
                        location: {
                            name: "MASCHEN RBF MSOF",
                            objectKeyAlpha: "MASCHEN RBF MSOF",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "16860",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T19:37:00+0000",
                        plannedArrival: "2024-05-10T19:34:00+0000"
                    },
                    {
                        location: {
                            name: "Waltershof Hansaport",
                            objectKeyAlpha: "HANSAPORT",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "81399",
                            country: "DE"
                        },
                        plannedArrival: "2024-05-10T20:03:00+0000"
                    }
                ]
            },
            majorDisruptions: [],
            constructionSites: [],
            operationalId: "I151",
            productType: "REGULAR_TRAIN",
            orderStatus: "ORDER_ACCEPTED",
            cancelable: true,
            cancelReasonName: "",
            authorization: [
                "READ_ORDER",
                "CREATE_ORDER_FLEXTRAIN",
                "READ_ORDER_DETAILS",
                "CANCEL_SPECIAL_TRAIN",
                "REDUCTION",
                "READ_TRAIN",
                "READ_TRAIN_POSITION",
                "READ_TRACKING",
                "READ_TRAIN_DETAILS",
                "CANCEL_TRAIN"
            ]
        },
        {
            train: {
                trainId: "TR2180DE60609-----002024",
                trainNumber: "60609",
                productionDate: "2024-05-10",
                startDate: "2024-05-10"
            },
            sgvNumber: "489104",
            timetableDaily: {
                sendingStation: {
                    name: "Waltershof Hansaport",
                    objectKeyAlpha: "HANSAPORT",
                    objectKeySequence: 1,
                    tafTsiPrimaryCode: "81399",
                    country: "DE"
                },
                receivingStation: {
                    name: "BEDDINGEN VPS",
                    objectKeyAlpha: "BEDDINGEN VPS",
                    objectKeySequence: 1,
                    tafTsiPrimaryCode: "10723",
                    country: "DE"
                },
                plannedDeparture: "2024-05-09T22:40:00+0000",
                plannedArrival: "2024-05-10T01:47:00+0000",
                lengthMax: "610",
                weightMax: "5400",
                speedMax: 90,
                bzaNumber: "A2-8690/24",
                routeLocations: [
                    {
                        location: {
                            name: "Waltershof Hansaport",
                            objectKeyAlpha: "HANSAPORT",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "81399",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-09T22:40:00+0000",
                        lengthMax: "610",
                        weightMax: "5400"
                    },
                    {
                        location: {
                            name: "MASCHEN RBF MSWF",
                            objectKeyAlpha: "MASCHEN RBF MSWF",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "16861",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-09T23:11:00+0000",
                        plannedArrival: "2024-05-09T23:06:00+0000"
                    },
                    {
                        location: {
                            name: "LEHRTE NORD",
                            objectKeyAlpha: "LEHRTE NORD",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "16185",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T01:06:00+0000",
                        plannedArrival: "2024-05-10T01:03:00+0000"
                    },
                    {
                        location: {
                            name: "BEDDINGEN VPS",
                            objectKeyAlpha: "BEDDINGEN VPS",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "10723",
                            country: "DE"
                        },
                        plannedArrival: "2024-05-10T01:47:00+0000"
                    }
                ]
            },
            timetableYearly: {
                sendingStation: {
                    name: "Waltershof Hansaport",
                    objectKeyAlpha: "HANSAPORT",
                    objectKeySequence: 1,
                    tafTsiPrimaryCode: "81399",
                    country: "DE"
                },
                receivingStation: {
                    name: "BEDDINGEN VPS",
                    objectKeyAlpha: "BEDDINGEN VPS",
                    objectKeySequence: 1,
                    tafTsiPrimaryCode: "10723",
                    country: "DE"
                },
                plannedDeparture: "2024-05-09T22:40:00+0000",
                plannedArrival: "2024-05-10T01:47:00+0000",
                lengthMax: "610",
                weightMax: "5400",
                speedMax: 90,
                bzaNumber: "A2-8690/24",
                routeLocations: [
                    {
                        location: {
                            name: "Waltershof Hansaport",
                            objectKeyAlpha: "HANSAPORT",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "81399",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-09T22:40:00+0000",
                        lengthMax: "610",
                        weightMax: "5400"
                    },
                    {
                        location: {
                            name: "MASCHEN RBF MSWF",
                            objectKeyAlpha: "MASCHEN RBF MSWF",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "16861",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-09T23:11:00+0000",
                        plannedArrival: "2024-05-09T23:06:00+0000"
                    },
                    {
                        location: {
                            name: "LEHRTE NORD",
                            objectKeyAlpha: "LEHRTE NORD",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "16185",
                            country: "DE"
                        },
                        plannedDeparture: "2024-05-10T01:06:00+0000",
                        plannedArrival: "2024-05-10T01:03:00+0000"
                    },
                    {
                        location: {
                            name: "BEDDINGEN VPS",
                            objectKeyAlpha: "BEDDINGEN VPS",
                            objectKeySequence: 1,
                            tafTsiPrimaryCode: "10723",
                            country: "DE"
                        },
                        plannedArrival: "2024-05-10T01:47:00+0000"
                    }
                ]
            },
            majorDisruptions: [],
            constructionSites: [],
            operationalId: "I151",
            productType: "REGULAR_TRAIN",
            orderStatus: "ORDER_ACCEPTED",
            cancelable: false,
            cancelReasonName: "",
            authorization: [
                "READ_ORDER",
                "CREATE_ORDER_FLEXTRAIN",
                "READ_ORDER_DETAILS",
                "CANCEL_SPECIAL_TRAIN",
                "REDUCTION",
                "READ_TRAIN",
                "READ_TRAIN_POSITION",
                "READ_TRACKING",
                "READ_TRAIN_DETAILS",
                "CANCEL_TRAIN"
            ]
        }
    ]
};
