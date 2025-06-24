import { ComponentFixture, TestBed, fakeAsync, flush } from "@angular/core/testing";
import { TrackingHistoryComponent } from "./tracking-history.component";
import { Event, EventGroup, TrackingHistory } from "@src/app/trainorder/models/ApiTrainsTrackingHistory.model";
import { trainInfoMock, trainInfoMock4Chain, ttDailyEntriesTrain, ttEntriesChainOne, ttEntriesChainTwo, ttYearlyEntriesTrain } from "./test.mocks";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TrainorderService } from "@src/app/trainorder/services/trainorder.service";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { By } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { HttpClientModule } from "@angular/common/http";
import { ModalWindows } from "../modal-windows/modal-windows";
import { Authorization } from "@src/app/trainorder/models/authorization";
import { LocalStorageService } from "../../services/local-storage/local-storage.service";
import { SharedPipesModule } from "../../pipes/shared-pipes.module";

describe('TrackingHistoryComponent', () => {
    let component: TrackingHistoryComponent;
    let fixture: ComponentFixture<TrackingHistoryComponent>;

    let mockTrainOrderServiceGetTrackingHistory;
    const  storageService: LocalStorageService=new LocalStorageService();
    beforeEach(async () => {
        storageService.setImmediateAuthorizations([Authorization.READ_ORDER_DETAILS]);
    });

    afterEach(() => {
        component = null;
        fixture = null;
    });

    it('should create TrackingHistoryComponent', fakeAsync(() => {
        mockTrainOrderServiceGetTrackingHistory = jasmine.createSpyObj(['getTrackingHistory', 'getTrainChainsTrackingHistory']);
        mockTrainOrderServiceGetTrackingHistory.getTrackingHistory.and.returnValue(of(trackingHistoryResponseMock));
        mockTrainOrderServiceGetTrackingHistory.getTrainChainsTrackingHistory.and.returnValue(of([ttEntriesChainOne, ttEntriesChainTwo]));
        TestBed.configureTestingModule({
            imports: [
                SharedPipesModule,
                TranslateModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { 'trackingHistoryTrainData': trainInfoMock } },
                { provide: MatDialogRef, useValue: { 'trackingHistoryTrainData': trainInfoMock } },
                { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrackingHistory },
                PermissionService,
                ModalWindows
            ]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TrackingHistoryComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();

        flush();
        expect(component).toBeTruthy();
    }));

    it('Should correctly show header for single train', fakeAsync(() => {
        mockTrainOrderServiceGetTrackingHistory = jasmine.createSpyObj(['getTrackingHistory', 'getTrainChainsTrackingHistory']);
        mockTrainOrderServiceGetTrackingHistory.getTrackingHistory.and.returnValue(of(trackingHistoryResponseMock));
        mockTrainOrderServiceGetTrackingHistory.getTrainChainsTrackingHistory.and.returnValue(of([ttEntriesChainOne, ttEntriesChainTwo]));
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule,
                SharedPipesModule, HttpClientModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { 'trackingHistoryTrainData': trainInfoMock } },
                { provide: MatDialogRef, useValue: { 'trackingHistoryTrainData': trainInfoMock } },
                { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrackingHistory },
                PermissionService,
                ModalWindows
            ]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TrackingHistoryComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();

        flush();
        const trainNumber = fixture.debugElement.query(By.css('#train-id'));
        expect(trainNumber.nativeElement.textContent.trim()).toBe('60603 |');
        const fromTo = fixture.debugElement.query(By.css('#from-to'));
        expect(fromTo.nativeElement.textContent.trim()).toBe('Waltershof Hansaport'.toUpperCase() + ' - BEDDINGEN VPS');

        const trainNumberHeader = fixture.debugElement.query(By.css('#train-number-header'));
        expect(trainNumberHeader).toBeFalsy();
    }));

    it('Should correctly show header for train chain', fakeAsync(() => {
        mockTrainOrderServiceGetTrackingHistory = jasmine.createSpyObj(['getTrackingHistory', 'getTrainChainsTrackingHistory']);
        mockTrainOrderServiceGetTrackingHistory.getTrackingHistory.and.returnValue(of(trackingHistoryResponseMock));
        mockTrainOrderServiceGetTrackingHistory.getTrainChainsTrackingHistory.and.returnValue(of([ttEntriesChainOne, ttEntriesChainTwo]));
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                SharedPipesModule,
                HttpClientModule
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { 'trackingHistoryTrainData': trainInfoMock4Chain } },
                { provide: MatDialogRef, useValue: { 'trackingHistoryTrainData': trainInfoMock4Chain } },
                { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrackingHistory },
                PermissionService,
                ModalWindows
            ]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TrackingHistoryComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();

        flush();
        const trainNumber = fixture.debugElement.query(By.css('#train-id'));
        expect(trainNumber.nativeElement.textContent.trim()).toBe('54852, 54854 |');
        const fromTo = fixture.debugElement.query(By.css('#from-to'));
        expect(fromTo.nativeElement.textContent.trim()).toBe('MZ-BISCHOFSHM MI - DARMSTADT NORD');

        const trainNumberHeader = fixture.debugElement.query(By.css('#train-number-header'));
        expect(trainNumberHeader).toBeTruthy();
    }));

    it('Should correctly align columns with pre-, post events', fakeAsync(() => {
        mockTrainOrderServiceGetTrackingHistory = jasmine.createSpyObj(['getTrackingHistory']);
        mockTrainOrderServiceGetTrackingHistory.getTrackingHistory.and.returnValue(of(trackingHistoryResponseWithPrePostEventsMock));

        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule,
                SharedPipesModule, HttpClientModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { 'trackingHistoryTrainData': trainInfoMock } },
                { provide: MatDialogRef, useValue: { 'trackingHistoryTrainData': trainInfoMock } },
                { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrackingHistory },
                PermissionService,
                ModalWindows
            ]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TrackingHistoryComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();

        flush();
        const departureCols = fixture.debugElement.queryAll(By.css('.planned-departure-col'));
        expect(departureCols).toBeTruthy();
        expect(departureCols.length).toBeGreaterThan(1);
        const leftPosition = departureCols[0].nativeElement.getBoundingClientRect().left;
        departureCols.forEach(col => {
            const rect = col.nativeElement.getBoundingClientRect();
            expect(rect.left).toEqual(leftPosition);
        });
    }));

    it('Should correctly align columns with pre-, post events and train chain', fakeAsync(() => {
        mockTrainOrderServiceGetTrackingHistory = jasmine.createSpyObj(['getTrackingHistory', 'getTrainChainsTrackingHistory']);
        mockTrainOrderServiceGetTrackingHistory.getTrackingHistory.and.returnValue(of(trackingHistoryResponseWithPrePostEventsMock));
        ttEntriesChainOne.timetableDaily.unshift(
            {
                event: Event.END_TRAIN_FORMATION_EMPTY_TRAIN,
                eventGroup: EventGroup.PRE_CARRIAGE,
                eventDateTime: '2024-02-05T21:15:00+0000',
                location: {
                    name: 'A',
                    objectKeyAlpha: 'A',
                    objectKeySequence: 1,
                    country: 'DE',
                    tafTsiPrimaryCode: ''
                },
                scheduleDateTime: new Date('2024-02-06T00:00:00+0000'),
                scheduleDelta: -116
            })
        ttEntriesChainTwo.timetableDaily.push(
            {
                event: Event.ARRIVAL_PLACE_OF_UNLOADING,
                eventGroup: EventGroup.POST_TRANSPORT,
                eventDateTime: '2024-02-06T01:15:00+0000',
                location: {
                    name: 'B',
                    objectKeyAlpha: 'B',
                    objectKeySequence: 1,
                    country: 'DE',
                    tafTsiPrimaryCode: ''
                },
                scheduleDateTime: new Date('2024-02-06T01:00:00+0000'),
                scheduleDelta: -116
            });
        mockTrainOrderServiceGetTrackingHistory.getTrainChainsTrackingHistory.and.returnValue(of([ttEntriesChainOne, ttEntriesChainTwo]));
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule,
                SharedPipesModule, HttpClientModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { 'trackingHistoryTrainData': trainInfoMock4Chain } },
                { provide: MatDialogRef, useValue: { 'trackingHistoryTrainData': trainInfoMock4Chain } },
                { provide: TrainorderService, useValue: mockTrainOrderServiceGetTrackingHistory },
                PermissionService,
                ModalWindows
            ]
        })
            .compileComponents();
        fixture = TestBed.createComponent(TrackingHistoryComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();

        flush();
        const departureCols = fixture.debugElement.queryAll(By.css('.planned-departure-col'));
        expect(departureCols).toBeTruthy();
        expect(departureCols.length).toBeGreaterThan(1);
        const leftPosition = departureCols[0].nativeElement.getBoundingClientRect().left;
        departureCols.forEach(col => {
            const rect = col.nativeElement.getBoundingClientRect();
            expect(rect.left).toEqual(leftPosition);
        });
    }));

});

export const trackingHistoryResponseMock: TrackingHistory = {
    timetableDaily: ttDailyEntriesTrain,
    timetableYearly: ttYearlyEntriesTrain
};

export const trackingHistoryResponseWithPrePostEventsMock: TrackingHistory = {
    timetableDaily: ttDailyEntriesTrain.concat(
        {
            location: { objectKeyAlpha: 'A', objectKeySequence: 1, name: 'Name' },
            event: Event.END_TRAIN_FORMATION_EMPTY_TRAIN,
            eventDateTime: '2024-02-18T04:23:00+0000',
            scheduleDateTime: new Date('2024-02-18T04:42:00+0000'),
            eventGroup: EventGroup.PRE_CARRIAGE
        },
        {
            location: { objectKeyAlpha: 'A', objectKeySequence: 1, name: 'Name' },
            event: Event.END_TRAIN_FORMATION_EMPTY_TRAIN,
            eventDateTime: '2024-02-18T09:23:00+0000',
            scheduleDateTime: new Date('2024-02-18T10:15:00+0000'),
            eventGroup: EventGroup.POST_TRANSPORT
        }
    ),
    timetableYearly: ttYearlyEntriesTrain
};
