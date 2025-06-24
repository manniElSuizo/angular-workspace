import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DemandTimeComponent} from './demand-time.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../../../../shared/shared.module';
import { MasterdataService } from '@src/app/empty-wagon/masterdata/services/masterdata.service';
import {of} from 'rxjs';
import {OrderDemandDateTimeView} from '../../../models/order-demand-date-time-view';
import { DemandLocationView } from '@src/app/empty-wagon/common/models/demand-location-view';
import {HttpClientModule} from '@angular/common/http';
import {provideNgxMask} from "ngx-mask";
import {InjectionToken} from "@angular/core";

describe('DemandTimeComponent', () => {
    let component: DemandTimeComponent;
    let fixture: ComponentFixture<DemandTimeComponent>;
    let masterDataService = jasmine.createSpyObj('MasterdataService', [
        'searchMasterDataDemandDateTimes',
        'getNextWorkingDay',
        'isWorkingDay'
    ]);

    beforeEach(async () => {

        masterDataService.getNextWorkingDay.and.returnValue(of('2023-10-11'));
        masterDataService.isWorkingDay.and.returnValue(of(true));

        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                TranslateModule.forRoot(),
                SharedModule,
                DemandTimeComponent,
                HttpClientModule
            ],
            providers: [
                provideNgxMask(),
                {provide: MasterdataService, useValue: masterDataService},
                {provide: new InjectionToken('ngx-mask config'), useValue: {}}
            ]
        }).compileComponents();

    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DemandTimeComponent);
        component = fixture.componentInstance;
        component.data = {
            deliveryDateTime: new Date(),
            demands: [
                {
                    demandWagonType: {
                        code: "DW123",
                        number: "001",
                        name: "Type A"
                    },
                    nhm: {
                        code: "NHM001",
                        description: "NHM Description"
                    },
                    loadRunLocation: {
                        countryCodeUic: "123",
                        countryCodeIso: "ISO",
                        number: "LOC001",
                        owner: "Owner Name",
                        name: "Location Name"
                    },
                    transitRailwayUndertaking: {
                        companyCode: "TRU001",
                        companyName: "Railway Company"
                    },
                    maxNumberOfWagons: 50,
                    numberOfWagonsOrdered: 30,
                    numberOfWagonsDisposed: null,
                    customerReference: "CR12345",
                    commentToCustomerService: "Please handle with care.",
                    commentDisponent: "Urgent delivery required.",
                    assessment: true
                }
            ]
        } as OrderDemandDateTimeView;
        component.demandLocation = {
            commercialLocation: {number: '123', name: 'Location A'},
            freightWagonLocation: {number: '456', name: 'Location B'}
        } as DemandLocationView;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form controls', () => {
        expect(component.demandDateControl).toBeTruthy();
        expect(component.timeControl).toBeTruthy();
        expect(component.demandTypesArray).toBeTruthy();
    });

    it('should call searchMasterDataDemandDateTimes on demand date selection', () => {
        const mockResponse = ['10:00', '11:00'];
        masterDataService.searchMasterDataDemandDateTimes.and.returnValue(of(mockResponse));
        masterDataService.isWorkingDay.and.returnValue(of(true));  // always return an observable

        // Simulate the event that triggers onSelectDemandDate
        const demandDateControl = component.demandDateControl;
        demandDateControl.setValue('2023-10-10');
        demandDateControl.updateValueAndValidity();

        fixture.detectChanges();

        // Trigger the method that calls the service
        component.onSelectDemandDate({target: {value: '2023-10-10'}});

        expect(masterDataService.searchMasterDataDemandDateTimes).toHaveBeenCalled();
        // Verify the outcomes influenced by demandDateTimes and timeRangeIsSelectable
        expect(component['demandDateTimes']).toEqual(mockResponse);
        expect(component['timeRangeIsSelectable']).toBeTrue();
    });

    it('should emit addDemandDateTime event', () => {
        spyOn(component.addDemandDateTime, 'emit');
        component.addFormGroup();
        expect(component.addDemandDateTime.emit).toHaveBeenCalledWith(component.runningNumber);
    });

    it('should emit removeDemandDateTime event', () => {
        spyOn(component.removeDemandDateTime, 'emit');
        component.removeFormGroup();
        expect(component.removeDemandDateTime.emit).toHaveBeenCalledWith(component.runningNumber);
    });
});
