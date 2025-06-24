import { TrainChainType, TrainIdentifier, TrainInfoData } from '@src/app/trainorder/models/ApiTrainsList.models';
import { Event, TrackingHistory, TrackingHistoryEntry, TrainTrackingHistory, TrainTrackingHistoryResponse } from '@src/app/trainorder/models/ApiTrainsTrackingHistory.model';
import { Authorization } from '@src/app/trainorder/models/authorization';

const trainOne: TrainIdentifier = {
    'trainId': 'TR2180DE60603-----002024',
    'trainNumber': '60603',
    'productionDate': new Date('2024-02-18'),
    'startDate': new Date('2024-02-18')
};
export const trainInfoMock: TrainInfoData = {
    authorization : [Authorization.READ_TRACKING],
    'trains': [
        trainOne
    ],
    'sendingStation': {
        'name': 'Waltershof Hansaport',
        'objectKeyAlpha': 'HANSAPORT',
        'objectKeySequence': 1,
        'tafTsiPrimaryCode': '81399',
        'country': 'DE'
    },
    'receivingStation': {
        'name': 'BEDDINGEN VPS',
        'objectKeyAlpha': 'BEDDINGEN VPS',
        'objectKeySequence': 1,
        'tafTsiPrimaryCode': '10723',
        'country': 'DE'
    }
};
export const trainInfoMock4Chain: TrainInfoData = {
    authorization : [Authorization.READ_TRACKING],
    trains: [
        {
            'trainId': 'TR2180DE54852-----002024',
            'trainNumber': '54852',
            'productionDate': new Date('2024-02-06'),
            'startDate': new Date('2024-02-06')
        },
        {
            'trainId': 'TR2180DE54854-----002024',
            'trainNumber': '54854',
            'productionDate': new Date('2024-02-06'),
            'startDate': new Date('2024-02-06')
        }
    ],
    trainChainIdentifier: {
        'trainChainId': 'IT2180DE54852-----002024/1',
        'trainChainDate': new Date('2024-02-06'),
        'trainChainType': TrainChainType.INTERMODAL,
        'trainChainName': ''
    },
    sendingStation: {
        'name': 'MZ-BISCHOFSHM MI',
        'objectKeyAlpha': 'MZ-BISCHOFSHM MI',
        'objectKeySequence': 1,
        'tafTsiPrimaryCode': '16704',
        'country': 'DE'
    },
    receivingStation: {
        'name': 'DARMSTADT NORD',
        'objectKeyAlpha': 'DARMSTADT NORD',
        'objectKeySequence': 1,
        'tafTsiPrimaryCode': '12074',
        'country': 'DE'
    }
};

export const ttYearlyEntriesTrain: TrackingHistoryEntry[] = [
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T07:23:00+0000',
        location: {
            'name': 'Waltershof Hansaport',
            'objectKeyAlpha': 'HANSAPORT',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '81399',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T05:42:00+0000'),
        scheduleDelta: 101
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T08:12:22+0000',
        location: {
            'name': 'MASCHEN RBF MSWF',
            'objectKeyAlpha': 'MASCHEN RBF MSWF',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '16861',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T06:08:00+0000'),
        scheduleDelta: 124
    },
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T08:13:05+0000',
        location: {
            'name': 'MASCHEN RBF MSWF',
            'objectKeyAlpha': 'MASCHEN RBF MSWF',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '16861',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T06:12:00+0000'),
        scheduleDelta: 121
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T10:36:27+0000',
        location: {
            'name': 'LEHRTE NORD',
            'objectKeyAlpha': 'LEHRTE NORD',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '16185',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T08:48:00+0000'),
        scheduleDelta: 108
    },
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T10:36:27+0000',
        location: {
            'name': 'LEHRTE NORD',
            'objectKeyAlpha': 'LEHRTE NORD',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '16185',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T09:13:00+0000'),
        scheduleDelta: 83
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T11:26:47+0000',
        location: {
            'name': 'BEDDINGEN VPS',
            'objectKeyAlpha': 'BEDDINGEN VPS',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '10723',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T09:55:00+0000'),
        scheduleDelta: 91
    }
];

export const ttDailyEntriesTrain: TrackingHistoryEntry[] = [
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T07:23:00+0000',
        location: {
            'name': 'Waltershof Hansaport',
            'objectKeyAlpha': 'HANSAPORT',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '81399',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T05:42:00+0000'),
        scheduleDelta: 101
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T08:12:22+0000',
        location: {
            'name': 'MASCHEN RBF MSWF',
            'objectKeyAlpha': 'MASCHEN RBF MSWF',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '16861',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T06:08:00+0000'),
        scheduleDelta: 124
    },
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T08:13:05+0000',
        location: {
            'name': 'MASCHEN RBF MSWF',
            'objectKeyAlpha': 'MASCHEN RBF MSWF',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '16861',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T06:12:00+0000'),
        scheduleDelta: 121
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T08:50:51+0000',
        location: {
            'name': 'BIENENBUETTEL',
            'objectKeyAlpha': 'BIENENBUETTEL',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '11232',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T06:48:00+0000'),
        scheduleDelta: 122
    },
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T08:51:30+0000',
        location: {
            'name': 'BIENENBUETTEL',
            'objectKeyAlpha': 'BIENENBUETTEL',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '11232',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T06:58:00+0000'),
        scheduleDelta: 113
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T08:59:22+0000',
        location: {
            'name': 'BAD BEVENSEN',
            'objectKeyAlpha': 'BAD BEVENSEN',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '10408',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T07:09:00+0000'),
        scheduleDelta: 110
    },
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T09:13:35+0000',
        location: {
            'name': 'BAD BEVENSEN',
            'objectKeyAlpha': 'BAD BEVENSEN',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '10408',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T07:12:00+0000'),
        scheduleDelta: 121
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T09:52:56+0000',
        location: {
            'name': 'ESCHEDE',
            'objectKeyAlpha': 'ESCHEDE',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '13008',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T07:49:00+0000'),
        scheduleDelta: 123
    },
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T09:56:34+0000',
        location: {
            'name': 'ESCHEDE',
            'objectKeyAlpha': 'ESCHEDE',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '13008',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T08:03:00+0000'),
        scheduleDelta: 113
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T10:07:51+0000',
        location: {
            'name': 'GARSSEN',
            'objectKeyAlpha': 'GARSSEN',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '13567',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T08:13:00+0000'),
        scheduleDelta: 114
    },
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T10:08:52+0000',
        location: {
            'name': 'GARSSEN',
            'objectKeyAlpha': 'GARSSEN',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '13567',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T08:20:00+0000'),
        scheduleDelta: 108
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T10:36:27+0000',
        location: {
            'name': 'LEHRTE NORD',
            'objectKeyAlpha': 'LEHRTE NORD',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '16185',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T08:48:00+0000'),
        scheduleDelta: 108
    },
    {
        event: 'DEPARTURE',
        'eventDateTime': '2024-02-18T10:36:27+0000',
        location: {
            'name': 'LEHRTE NORD',
            'objectKeyAlpha': 'LEHRTE NORD',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '16185',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T09:13:00+0000'),
        scheduleDelta: 83
    },
    {
        event: 'ARRIVAL',
        'eventDateTime': '2024-02-18T11:26:47+0000',
        location: {
            'name': 'BEDDINGEN VPS',
            'objectKeyAlpha': 'BEDDINGEN VPS',
            'objectKeySequence': 1,
            'tafTsiPrimaryCode': '10723',
            'country': 'DE'
        },
        'scheduleDateTime': new Date('2024-02-18T09:55:00+0000'),
        scheduleDelta: 91
    }
];

export const ttEntriesChainOne: TrainTrackingHistory = {
    timetableDaily: [
        {
            event: 'DEPARTURE',
            eventDateTime: '2024-02-05T22:15:00+0000',
            location: {
                'name': 'MZ-BISCHOFSHM MI',
                'objectKeyAlpha': 'MZ-BISCHOFSHM MI',
                'objectKeySequence': 1,
                'tafTsiPrimaryCode': '16704',
                'country': 'DE'
            },
            'scheduleDateTime': new Date('2024-02-06T00:11:00+0000'),
            scheduleDelta: -116
        },
        {
            event: 'ARRIVAL',
            'eventDateTime': '2024-02-05T23:06:34+0000',
            location: {
                'name': 'DARMSTADT-KRANICHSTN',
                'objectKeyAlpha': 'DARMSTADT-KRANICHSTN',
                'objectKeySequence': 1,
                'tafTsiPrimaryCode': '12085',
                'country': 'DE'
            },
            'scheduleDateTime': new Date('2024-02-06T00:46:00+0000'),
            scheduleDelta: -100
        }
    ],
    'timetableYearly': [
        {
            event: 'DEPARTURE',
            eventDateTime: '2024-02-05T22:15:00+0000',
            location: {
                'name': 'MZ-BISCHOFSHM MI',
                'objectKeyAlpha': 'MZ-BISCHOFSHM MI',
                'objectKeySequence': 1,
                'tafTsiPrimaryCode': '16704',
                'country': 'DE'
            },
            'scheduleDateTime': new Date('2024-02-06T00:11:00+0000'),
            scheduleDelta: -116
        },
        {
            event: 'ARRIVAL',
            eventDateTime: '2024-02-05T23:06:34+0000',
            location: {
                'name': 'DARMSTADT-KRANICHSTN',
                'objectKeyAlpha': 'DARMSTADT-KRANICHSTN',
                'objectKeySequence': 1,
                'tafTsiPrimaryCode': '12085',
                'country': 'DE'
            },
            'scheduleDateTime': new Date('2024-02-06T00:46:00+0000'),
            scheduleDelta: -100
        }
    ],
    train: {
        'trainNumber': '54852',
        'productionDate': new Date('2024-02-06'),
        startDate: new Date('2024-02-06'),
        trainId: 'ID54852'
    },
    'sendingStation': {
        'name': 'MZ-BISCHOFSHM MI',
        'objectKeyAlpha': 'MZ-BISCHOFSHM MI',
        'objectKeySequence': 1,
        'tafTsiPrimaryCode': '16704',
        'country': 'DE'
    },
    'receivingStation': {
        'name': 'DARMSTADT-KRANICHSTN',
        'objectKeyAlpha': 'DARMSTADT-KRANICHSTN',
        'objectKeySequence': 1,
        'tafTsiPrimaryCode': '12085',
        'country': 'DE'
    }
};
export const ttEntriesChainTwo: TrainTrackingHistory = {
    timetableDaily: [
        {
            event: '',
            eventDateTime: '2024-02-06T00:53:45+0000',
            location: {
                'name': 'DARMSTADT-KRANICHSTN',
                'objectKeyAlpha': 'DARMSTADT-KRANICHSTN',
                'objectKeySequence': 1,
                'tafTsiPrimaryCode': '12085',
                'country': 'DE'
            },
            'scheduleDateTime': new Date('2024-02-06T02:44:00+0000'),
            scheduleDelta: -111
        },
        {
            event: 'ARRIVAL',
            eventDateTime: '2024-02-06T00:57:00+0000',
            location: {
                'name': 'DARMSTADT NORD',
                'objectKeyAlpha': 'DARMSTADT NORD',
                'objectKeySequence': 1,
                'tafTsiPrimaryCode': '12074',
                'country': 'DE'
            },
            'scheduleDateTime': new Date('2024-02-06T02:51:00+0000'),
            scheduleDelta: -114
        }
    ],
    timetableYearly: [
        {
            event: 'DEPARTURE',
            eventDateTime: '2024-02-06T00:53:45+0000',
            location: {
                'name': 'DARMSTADT-KRANICHSTN',
                'objectKeyAlpha': 'DARMSTADT-KRANICHSTN',
                'objectKeySequence': 1,
                'tafTsiPrimaryCode': '12085',
                'country': 'DE'
            },
            'scheduleDateTime': new Date('2024-02-06T02:44:00+0000'),
            scheduleDelta: -111
        },
        {
            event: 'ARRIVAL',
            eventDateTime: '2024-02-06T00:57:00+0000',
            location: {
                'name': 'DARMSTADT NORD',
                'objectKeyAlpha': 'DARMSTADT NORD',
                'objectKeySequence': 1,
                'tafTsiPrimaryCode': '12074',
                'country': 'DE'
            },
            'scheduleDateTime': new Date('2024-02-06T02:51:00+0000'),
            scheduleDelta: -114
        }
    ],
    'train': {
        'trainNumber': '54854',
        'productionDate': new Date('2024-02-06'),
        startDate: new Date('2024-02-06'),
        trainId: 'ID54854'
    },
    'sendingStation': {
        'name': 'DARMSTADT-KRANICHSTN',
        'objectKeyAlpha': 'DARMSTADT-KRANICHSTN',
        'objectKeySequence': 1,
        'tafTsiPrimaryCode': '12085',
        'country': 'DE'
    },
    'receivingStation': {
        'name': 'DARMSTADT NORD',
        'objectKeyAlpha': 'DARMSTADT NORD',
        'objectKeySequence': 1,
        'tafTsiPrimaryCode': '12074',
        'country': 'DE'
    }
};
