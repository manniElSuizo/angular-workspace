import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {DemandComponent} from './demand.component';
import {TranslateModule} from '@ngx-translate/core';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {InjectionToken} from '@angular/core';
import {DemandView} from "../../../../template/models/template-demand-view";
import {NgxMaskDirective, provideNgxMask} from "ngx-mask";

describe('DemandComponent', () => {
    let component: DemandComponent;
    let fixture: ComponentFixture<DemandComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                DemandComponent,
                HttpClientTestingModule,
                TranslateModule.forRoot(),
                NgxMaskDirective
            ],
            providers: [
                provideNgxMask(),
                {provide: new InjectionToken('ngx-mask config'), useValue: {}}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DemandComponent);
        component = fixture.componentInstance;
        component.data = {
            demandLocation: {
                commercialLocation: {number: '123', name: 'Location A'},
                freightWagonLocation: {number: '456', name: 'Location B'}
            },
            demandDateTimes: [{
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
            }]
        } as DemandView;
        component.ngOnChanges();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form controls', () => {
        expect(component.commercialLocation).toBeTruthy();
        expect(component.freightWagonLocation).toBeTruthy();
        expect(component.demandDateTimesArray).toBeTruthy();
    });

    it('should disable commercial and freight wagon location controls', () => {
        expect(component.commercialLocation.disabled).toBeTrue();
        expect(component.freightWagonLocation.disabled).toBeTrue();
    });

    it('should add a demand date', () => {
        component.addDemandDate();
        expect(component.demandDateTimesArray.length).toBe(2);
    });

    it('should remove a demand date', () => {
        component.removeDemandDate(0);
        expect(component.demandDateTimesArray.length).toBe(0);
    });
});