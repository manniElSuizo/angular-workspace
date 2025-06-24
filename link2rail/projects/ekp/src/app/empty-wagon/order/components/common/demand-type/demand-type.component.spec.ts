import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {DemandTypeComponent} from './demand-type.component';
import {TranslateModule} from '@ngx-translate/core';
import {ChangeDetectorRef} from '@angular/core';
import {NHMView} from '../../../../common/models/nhm-view';
import {TransitRailwayUndertakingView} from '../../../../common/models/transit-railway-undertaking-view';
import {CommercialLocationView} from '../../../../common/models/commercial-location-view';
import {RailOrderInternalService} from "../../../../../order-management/service/rail-order-internal.service";
import {TrainorderService} from "../../../../../trainorder/services/trainorder.service";
import {OrderDemandTypeView} from "../../../models/order-demand-type-view";

describe('DemandTypeComponent', () => {
    let component: DemandTypeComponent;
    let fixture: ComponentFixture<DemandTypeComponent>;
    let mockRailOrderInternalService: jasmine.SpyObj<RailOrderInternalService>;
    let mockTrainorderService: jasmine.SpyObj<TrainorderService>;

    beforeEach(async () => {
        mockRailOrderInternalService = jasmine.createSpyObj('RailOrderInternalService', ['getCountries', 'getRailwayCompanies', 'getCommercialLocations']);
        mockTrainorderService = jasmine.createSpyObj('TrainorderService', ['getCargoInfo']);

        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                TranslateModule.forRoot(),
                DemandTypeComponent
            ],
            providers: [
                {provide: RailOrderInternalService, useValue: mockRailOrderInternalService},
                {provide: TrainorderService, useValue: mockTrainorderService},
                ChangeDetectorRef
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DemandTypeComponent);
        component = fixture.componentInstance;
        component.data = {
            loadRunLocation: {countryCodeUic: '123', number: 'LOC001', name: 'Location Name'} as CommercialLocationView,
            demandWagonType: {code: 'DW123', number: '001', name: 'Type A'},
            numberOfWagonsOrdered: 30,
            maxNumberOfWagons: 50,
            commentToCustomerService: 'Please handle with care.',
            customerReference: 'CR12345',
            transitRailwayUndertaking: {
                companyCode: 'TRU001',
                companyName: 'Railway Company'
            } as TransitRailwayUndertakingView,
            nhm: {code: 'NHM001', description: 'NHM Description'} as NHMView
        } as OrderDemandTypeView;
        component.ngOnChanges(); // Ensure formGroup is initialized
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form controls', () => {
        expect(component.demandWagonTypeControl).toBeTruthy();
        expect(component.wagonAmountControl).toBeTruthy();
        expect(component.commentToCustomerServiceControl).toBeTruthy();
        expect(component.customerReferenceControl).toBeTruthy();
        expect(component.countryCodeControl).toBeTruthy();
        expect(component.loadRunLocationControl).toBeTruthy();
        expect(component.transitRailwayControl).toBeTruthy();
        expect(component.nhmCodeControl).toBeTruthy();
    });

    it('should fill form with data', () => {
        component.fillForm();
        expect(component.demandWagonTypeControl.value).toBe('DW123-001 (Type A)');
        expect(component.wagonAmountControl.value).toBe(30);
        expect(component.commentToCustomerServiceControl.value).toBe('Please handle with care.');
        expect(component.customerReferenceControl.value).toBe('CR12345');
        expect(component.countryCodeControl.value).toBe('123');
        expect(component.loadRunLocationControl.value).toBe('LOC001 (Location Name)');
        expect(component.transitRailwayControl.value).toBe('Railway Company (TRU001)');
        expect(component.nhmCodeControl.value).toBe('NHM Description (NHM001)');
    });

    it('should disable form controls in view mode', () => {
        component.action = 'view';
        (component as any).configureFormControls();
        expect(component.formGroup.disabled).toBeTrue();
    });

    it('should enable loadRunLocationControl when country code is selected', () => {
        (component as any).onChangeCountryCode({target: {value: '123'}});
        expect(component.loadRunLocationControl.enabled).toBeTrue();
    });

    it('should disable loadRunLocationControl when no country code is selected', () => {
        (component as any).onChangeCountryCode({target: {value: null}});
        expect(component.loadRunLocationControl.disabled).toBeTrue();
    });
});