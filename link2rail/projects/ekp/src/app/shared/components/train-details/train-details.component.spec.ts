import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TrainChain, TrainDetail } from '@src/app/trainorder/models/ApiTrainsDetail.model';
import { TrainChainType } from '@src/app/trainorder/models/ApiTrainsList.models';
import { TrainDetailsComponent } from './train-details.component';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { By } from '@angular/platform-browser';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderStatusTypes } from '../../enums/order-status';
import { DateTimePipe } from '../../pipes/date-time.pipe';
import { SharedPipesModule } from '../../pipes/shared-pipes.module';

describe('TrainDetailsComponent', () => {
  let component: TrainDetailsComponent;
  let fixture: ComponentFixture<TrainDetailsComponent>;

  const trainNumber = "60609";
  const trainNumberTwo = "60610";
  const sendingStation = "Test Sending Station";
  const receivingStation = "Test Receiving Station";
  const AuthorizationRole = Authorization.CREATE_ORDER_FLEXTRAIN;

  const trainOne = {productionDate: new Date('2022-01-02'), startDate: new Date('2022-01-02'), trainId: 'TR2180DE60609-----002022', trainNumber: trainNumber};
  const trainTwo = {productionDate: new Date('2022-01-03'), startDate: new Date('2022-01-03'), trainId: 'TR2180DE60610-----002022', trainNumber: trainNumberTwo};

  let trainDetails: TrainDetail = {
    actualArrival: new Date('2022-01-05T00:01:00Z'),
    actualDeparture: new Date('2022-01-02T00:01:00Z'),
    authorization: AuthorizationRole,
    orderStatus: OrderStatusTypes.ORDER_ACCEPTED,
    currentTrainNumber: '',
    operationalId: '',
    corridor: '',
    constructionSites: [],
    timetableDaily: {
      lengthMax: '',
      plannedArrival: new Date('2022-01-05T00:01:00Z'),
      plannedDeparture: new Date('2022-01-02T00:01:00Z'),
      receivingStation: { name: receivingStation, objectKeyAlpha: "2", objectKeySequence: 2 },
      routeLocations: [],
      sendingStation: { name: sendingStation, objectKeyAlpha: "1", objectKeySequence: 1 },
      weightMax: '',
      speedMax: '',
      bzaNumber: ''
    },
    deadline: new Date('2022-01-11T00:01:00Z'),
    majorDisruptions: [],
    productType: 'REGULAR_TRAIN',
    sgvNumber: 55,
    timetableYearly: {
      lengthMax: '550',
      plannedArrival: new Date('2022-01-05T00:01:00Z'),
      plannedDeparture: new Date('2022-01-02T00:01:00Z'),
      receivingStation: { name: receivingStation, objectKeyAlpha: "2", objectKeySequence: 2 },
      routeLocations: [],
      sendingStation: { name: sendingStation, objectKeyAlpha: "1", objectKeySequence: 1 },
      weightMax: '1250',
      speedMax: '',
      bzaNumber: ''
    },
    cancelReasonName: '',
    train: trainOne,
    closeTimes: undefined,
    craneTimes: undefined,
    provisionTimes: undefined,
    cancelable: false
  };

  let trainDetailsTrainTwo: TrainDetail = {
    actualArrival: new Date('2022-01-05T00:05:00Z'),
    actualDeparture: new Date('2022-01-02T00:05:00Z'),
    authorization: AuthorizationRole,
    orderStatus: OrderStatusTypes.ORDER_ACCEPTED,
    currentTrainNumber: '',
    operationalId: '',
    corridor: '',
    constructionSites: [],
    timetableDaily: {
      lengthMax: '',
      plannedArrival: new Date('2022-01-05T00:05:00Z'),
      plannedDeparture: new Date('2022-01-02T00:05:00Z'),
      receivingStation: { name: receivingStation, objectKeyAlpha: "3", objectKeySequence: 2 },
      routeLocations: [],
      sendingStation: { name: sendingStation, objectKeyAlpha: "2", objectKeySequence: 1 },
      weightMax: '',
      speedMax: '',
      bzaNumber: ''
    },
    deadline: new Date('2022-01-11T00:05:00Z'),
    majorDisruptions: [],
    productType: 'REGULAR_TRAIN',
    sgvNumber: 55,
    timetableYearly: {
      lengthMax: '550',
      plannedArrival: new Date('2022-01-05T00:05:00Z'),
      plannedDeparture: new Date('2022-01-02T00:05:00Z'),
      receivingStation: { name: receivingStation, objectKeyAlpha: "3", objectKeySequence: 2 },
      routeLocations: [],
      sendingStation: { name: sendingStation, objectKeyAlpha: "2", objectKeySequence: 1 },
      weightMax: '1250',
      speedMax: '',
      bzaNumber: ''
    },
    cancelReasonName: '',
    train: trainTwo,
    closeTimes: undefined,
    craneTimes: undefined,
    provisionTimes: undefined,
    cancelable: false
  };

  const trainDetailsWithConstructionSites: TrainDetail = {
    actualArrival: new Date('2022-01-05T00:01:00Z'),
    actualDeparture: new Date('2022-01-02T00:01:00Z'),
    authorization: AuthorizationRole,
    orderStatus: OrderStatusTypes.ORDER_ACCEPTED,
    currentTrainNumber: '',
    operationalId: '',
    corridor: '',
    constructionSites: [
      {
        fploNr: '20108',
        impact: 'Umzuleitender Zug',
        location: 'Almstedt - Sorsum',
        period: '18.02.-25.02.2024',
        eta: undefined
      }
    ],
    timetableDaily: {
      lengthMax: '',
      plannedArrival: new Date('2022-01-05T00:01:00Z'),
      plannedDeparture: new Date('2022-01-02T00:01:00Z'),
      receivingStation: { name: receivingStation, objectKeyAlpha: "2", objectKeySequence: 2 },
      routeLocations: [],
      sendingStation: { name: sendingStation, objectKeyAlpha: "1", objectKeySequence: 1 },
      weightMax: '',
      speedMax: '',
      bzaNumber: ''
    },
    deadline: new Date('2022-01-11T00:01:00Z'),
    majorDisruptions: [],
    productType: 'REGULAR_TRAIN',
    sgvNumber: 55,
    timetableYearly: {
      lengthMax: '550',
      plannedArrival: new Date('2022-01-05T00:01:00Z'),
      plannedDeparture: new Date('2022-01-02T00:01:00Z'),
      receivingStation: { name: receivingStation, objectKeyAlpha: "2", objectKeySequence: 2 },
      routeLocations: [],
      sendingStation: { name: sendingStation, objectKeyAlpha: "1", objectKeySequence: 1 },
      weightMax: '1250',
      speedMax: '',
      bzaNumber: ''
    },
    cancelReasonName: '',
    train: trainOne,
    closeTimes: undefined,
    craneTimes: undefined,
    provisionTimes: undefined,
    cancelable: false
  };

  const singleTrainWithConstructionSite: { trainDetail: TrainDetail | undefined, trainChain: TrainChain | undefined } = {
    trainChain: undefined,
    trainDetail: trainDetailsWithConstructionSites
  };

  const mockSingleTrain: { trainDetail: TrainDetail | undefined, trainChain: TrainChain | undefined } = {
    trainChain: undefined,
    trainDetail: trainDetails
  };

  const mockTrainChain: { trainDetail: TrainDetail | undefined, trainChain: TrainChain | undefined } = {
    trainChain: {
      trainChainIdentifier: {trainChainDate: new Date('2022-01-02'), trainChainId: 'TR2180DE60609-----002022/1', trainChainType: TrainChainType.INTERMODAL, trainChainName: 'My superdoupertrainchain'},
      trainChainName: 'Name',
      trains: [trainDetails, trainDetailsTrainTwo]
    },
    trainDetail: trainDetails
  };

  let mockTrainOrderServiceGetTrainInfo;

  beforeEach(async () => {
    mockTrainOrderServiceGetTrainInfo = jasmine.createSpyObj(['getTrainInfo']);
    mockTrainOrderServiceGetTrainInfo.getTrainInfo.and.returnValue(trainDetails);
  });

  it('should create', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, SharedPipesModule],
      // declarations: [ DateTimePipe ],
      providers: [ DateTimePipe,
        { provide: MAT_DIALOG_DATA, useValue: mockSingleTrain },
        { provide: MatDialogRef, useValue: mockSingleTrain },
        { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrainInfo }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TrainDetailsComponent);
    component = fixture.componentInstance;
    component.data = mockSingleTrain;
    fixture.detectChanges();
    flush();
    expect(component).toBeTruthy();
  }));

  it('Should correctly show train info for single train', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, SharedPipesModule],
      // declarations: [ DateTimePipe ],
      providers: [ DateTimePipe,
        { provide: MAT_DIALOG_DATA, useValue: mockSingleTrain },
        { provide: MatDialogRef, useValue: mockSingleTrain },
        { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrainInfo }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TrainDetailsComponent);
    component = fixture.componentInstance;
    component.data = mockSingleTrain;
    fixture.detectChanges();
    flush();
    const headLine = fixture.debugElement.query(By.css('.details-h2-normal'));
    expect(headLine.nativeElement.textContent.trim()).toBe('- 02.01.2022');
    const selectBox = fixture.debugElement.query(By.css('#train-chain-items'));
    expect(selectBox).toBeFalsy();
  }));

  it('Should correctly show train info for train chain', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, SharedPipesModule],
      // declarations: [ DateTimePipe ],
      providers: [ DateTimePipe,
        { provide: MAT_DIALOG_DATA, useValue: mockTrainChain },
        { provide: MatDialogRef, useValue: mockTrainChain },
        { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrainInfo }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TrainDetailsComponent);
    component = fixture.componentInstance;
    component.data = mockTrainChain;
    fixture.detectChanges();
    flush();
    const selectBox = fixture.debugElement.query(By.css('#train-chain-items'));
    expect(selectBox).toBeTruthy();
  }));

  it('Should show construction site information', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, SharedPipesModule],
      // declarations: [ DateTimePipe ],
      providers: [ DateTimePipe,
        { provide: MAT_DIALOG_DATA, useValue: singleTrainWithConstructionSite },
        { provide: MatDialogRef, useValue: singleTrainWithConstructionSite },
        { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrainInfo }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TrainDetailsComponent);
    component = fixture.componentInstance;
    component.data = singleTrainWithConstructionSite;
    fixture.detectChanges();
    flush();
    const constructionSiteInformation = fixture.debugElement.query(By.css('#construction-site-information'));
    expect(constructionSiteInformation).toBeTruthy();
  }));
/*
  it('Should align stations equal to order status', fakeAsync(() => {
    flush();
    const status = fixture.debugElement.query(By.css('#order-status-value'));
    const statusRect = status.nativeElement.getBoundingClientRect();
    const sendingStation = fixture.debugElement.query(By.css('#sending-station-value'));
    const sendingStationRect = sendingStation.nativeElement.getBoundingClientRect();
    expect(sendingStationRect.left).toBe(statusRect.left);
  }));
*/
  it('Should not show originally lable', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, SharedPipesModule],
      // declarations: [ DateTimePipe ],
      providers: [ DateTimePipe,
        { provide: MAT_DIALOG_DATA, useValue: mockSingleTrain },
        { provide: MatDialogRef, useValue: mockSingleTrain },
        { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrainInfo }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TrainDetailsComponent);
    component = fixture.componentInstance;
    trainDetails.timetableYearly.sendingStation.name = sendingStation;
    trainDetails.timetableDaily.sendingStation.name = sendingStation;
    mockSingleTrain.trainDetail = trainDetails;
    component.data = mockSingleTrain;
    fixture.detectChanges();
    flush();
    const originallyLable = fixture.debugElement.query(By.css('.originally-lable'));
    expect(originallyLable).toBeFalsy();
  }));

  it('Should show originally lable', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, SharedPipesModule],
      // declarations: [ DateTimePipe ],
      providers: [ DateTimePipe,
        { provide: MAT_DIALOG_DATA, useValue: mockSingleTrain },
        { provide: MatDialogRef, useValue: mockSingleTrain },
        { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrainInfo }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TrainDetailsComponent);
    component = fixture.componentInstance;
    trainDetails.timetableYearly.sendingStation.name = "a different station";
    trainDetails.timetableDaily.sendingStation.name = sendingStation;
    mockSingleTrain.trainDetail = trainDetails;
    component.data = mockSingleTrain;
    fixture.detectChanges();
    flush();
    const originallyLable = fixture.debugElement.query(By.css('.originally-lable'));
    expect(originallyLable).toBeTruthy();
  }));
});
