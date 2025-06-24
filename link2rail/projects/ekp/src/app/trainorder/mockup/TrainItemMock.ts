
import { ProductType } from '@src/app/shared/enums/train-types.enum';
import { ApiTrainsListResponse, TrainChainType, TrainIdentifier, TrainSummary } from '../models/ApiTrainsList.models';
import { Tools } from './tools';
import { TrainChain, TrainDetail } from '@src/app/trainorder/models/ApiTrainsDetail.model';

const stationMock = {
    name: 'a railway station',
    objectKeyAlpha: 'A RAILWAY STATION',
    objectKeySequence: 1,
};

export const trainDetailMock1: TrainDetail = {
    train: {
        trainId: 'xxx',
        trainNumber: '60601',
        productionDate: new Date("2024-05-01"),
        startDate: new Date("2024-05-01")
    },
    actualDeparture: undefined,
    authorization: undefined,
    operationalId: '',
    corridor: '',
    orderStatus: '',
    currentTrainNumber: '',
    timetableDaily: undefined,
    deadline: undefined,
    majorDisruptions: [],
    productType: '',
    sgvNumber: 0,
    timetableYearly: undefined,
    cancelReasonName: '',
    constructionSites: [],
    closeTimes: undefined,
    craneTimes: undefined,
    provisionTimes: undefined,
    cancelable: false
};

export const trainDetailMock2: TrainDetail = {
    train: {
        trainId: 'xxx2',
        trainNumber: '60602',
        productionDate: new Date("2024-05-02"),
        startDate: new Date("2024-05-02")
    },
    actualDeparture: undefined,
    authorization: undefined,
    operationalId: '',
    corridor: '',
    orderStatus: '',
    currentTrainNumber: '',
    timetableDaily: undefined,
    deadline: undefined,
    majorDisruptions: [],
    productType: '',
    sgvNumber: 0,
    timetableYearly: undefined,
    cancelReasonName: '',
    constructionSites: [],
    closeTimes: undefined,
    craneTimes: undefined,
    provisionTimes: undefined,
    cancelable: false
};

export const trainSummaryBase: TrainSummary = {
    currentLocation: 'current loc',
    customerServiceRemark: 'Kunden Bemerkung',
    operationalMode: 'SW',
    orderStatus: 'ordered',
    plannedDeparture: new Date(),
    productType: '',
    progress: 5,
    receivingStation: stationMock,
    sendingStation: stationMock,
    plannedArrival: new Date(),
    authorization: [],
    cancellationFee: false,
    delayInMinutes: 0,
    cancelable: false,
    trains: [{productionDate: new Date(),startDate: new Date(),trainId: "xxx",trainNumber: "60601"}],
    trainChainIdentifier: undefined,
    actualDeparture: undefined,
    actualArrival: undefined,
    cancelReasonName: '',
    currentTrainNumber: '',
    numberOfConstructionSites: 0
};

export const trainSummary1: TrainSummary = {
    currentLocation: 'current loc',
    customerServiceRemark: 'Kunden Bemerkung',
    operationalMode: 'SW',
    orderStatus: 'ordered',
    plannedDeparture: new Date(),
    productType: '',
    progress: 5,
    receivingStation: stationMock,
    sendingStation: stationMock,
    comments: true,
    plannedArrival: new Date(),
    authorization: [],
    cancellationFee: false,
    delayInMinutes: 0,
    cancelable: false,
    trains: [{productionDate: new Date("2024-05-01"),startDate: new Date("2024-05-01"),trainId: "xxx",trainNumber: "60601"}],
    trainChainIdentifier: undefined,
    actualDeparture: undefined,
    actualArrival: undefined,
    cancelReasonName: '',
    currentTrainNumber: '',
    numberOfConstructionSites: 0
};

export const trainSummary2: TrainSummary = {
    currentLocation: 'current loc',
    customerServiceRemark: 'Kunden Bemerkung',
    operationalMode: 'SW',
    orderStatus: 'ordered',
    plannedDeparture: new Date('2024-05-01'),
    productType: '',
    progress: 5,
    receivingStation: stationMock,
    sendingStation: stationMock,
    comments: true,
    plannedArrival: new Date(),
    authorization: [],
    cancellationFee: false,
    delayInMinutes: 0,
    cancelable: false,
    trains: [
        {productionDate: new Date("2024-05-02"),startDate: new Date("2024-05-02"),trainId: "xxx2",trainNumber: "60602"}
    ],
    trainChainIdentifier: {trainChainDate: new Date("2024-05-01"), trainChainId: 'TCID', trainChainName: '', trainChainType: TrainChainType.INTERMODAL},
    actualDeparture: undefined,
    actualArrival: undefined,
    cancelReasonName: '',
    currentTrainNumber: '',
    numberOfConstructionSites: 0
};

export const trainSummary4TrainChain: TrainSummary = {
    currentLocation: 'current loc',
    customerServiceRemark: 'Kunden Bemerkung',
    operationalMode: 'SW',
    orderStatus: 'ordered',
    plannedDeparture: new Date('2024-05-01'),
    productType: '',
    progress: 5,
    receivingStation: stationMock,
    sendingStation: stationMock,
    comments: true,
    plannedArrival: new Date(),
    authorization: [],
    cancellationFee: false,
    delayInMinutes: 0,
    cancelable: false,
    trains: [
        {productionDate: new Date("2024-05-01"),startDate: new Date("2024-05-01"),trainId: "xxx",trainNumber: "60601"},
        {productionDate: new Date("2024-05-02"),startDate: new Date("2024-05-02"),trainId: "xxx2",trainNumber: "60602"}
    ],
    trainChainIdentifier: {trainChainDate: new Date("2024-05-01"), trainChainId: 'TCID', trainChainName: '', trainChainType: TrainChainType.INTERMODAL},
    actualDeparture: undefined,
    actualArrival: undefined,
    cancelReasonName: '',
    currentTrainNumber: '',
    numberOfConstructionSites: 0
};

export const trainChainMock: TrainChain = {
    trainChainIdentifier: {
        trainChainId: 'TCID',
        trainChainDate: new Date("2024-05-01"),
        trainChainName: '',
        trainChainType: TrainChainType.INTERMODAL
    },
    trainChainName: '',
    trains: [trainDetailMock1, trainDetailMock2]
}

export const trainIdentifierMockOne: TrainIdentifier = {
    trainId: '123456',
    trainNumber: '123456',
    productionDate: new Date('2024-02-19'),
    startDate: new Date('2024-02-19')
};

export const trainIdentifierMockTwo: TrainIdentifier = {
    trainId: '123457',
    trainNumber: '123457',
    productionDate: new Date('2024-02-19'),
    startDate: new Date('2024-02-19')
};

export class TrainsMock {
    static list(): ApiTrainsListResponse {
        const list: TrainSummary[] = [];
        for(let el of ['ABC', 'DEF', 'GHI', 'sdf', 'wer', 'fgh', 'sdf', 'fjsdf']) {
            list.push(TrainsMock.train(el));
        }

        const response: ApiTrainsListResponse = {
            items: list,
            offset: 0,
            limit: 25,
            total: 25
        };
        return response;
    }

    static train(text: string): TrainSummary {
        const operationMode = Tools.randomNumber(0, 10) % 2 == 0 ? 'IDLE' : Tools.randomNumber(0, 10) % 3 == 0 ? 'LOAD' : '';
        const train: TrainSummary = {
            currentLocation: text + ' Current location',
            orderStatus: 'STATUS',
            receivingStation: {
                name: 'Receiving station name',
                objectKeyAlpha: 'OBJ_K_A',
                objectKeySequence: 123
            },
            sendingStation: {
                name: 'Sending station name',
                objectKeyAlpha: 'OBJ_K_A_Sending',
                objectKeySequence: 321
            },
            customerServiceRemark: text + ' cutomer service remark',
            operationalMode: operationMode,
            plannedArrival: new Date(),
            plannedDeparture: new Date(),
            productType: Tools.randomNumber(0, 10) % 2 == 0 ? ProductType.REGULAR_TRAIN : ProductType.SPECIAL_TRAIN,
            progress: 5,
            comments: true,
            authorization: [],
            trains: [trainIdentifierMockOne],
            trainChainIdentifier: undefined,
            actualDeparture: new Date('2024-02-19T12:15'),
            actualArrival: new Date('2024-02-20T15:15'),
            cancellationFee: false,
            delayInMinutes: 0,
            cancelable: false,
            cancelReasonName: '',
            currentTrainNumber: '',
            numberOfConstructionSites: 0
        }

        return train;
    }
}
