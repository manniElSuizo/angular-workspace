import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OrderModificationComponent} from './order-modification.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {OrderService} from '../../services/order.service';
import {ErrorDialogService} from '../../../../shared/error-handler/service/api-error-dialog.service';
import {DemandComponent} from '../common/demand/demand.component';
import {OrderView} from '../../models/order-view';
import {DemandView} from '../../../template/models/template-demand-view';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";
import {OrderPartnersComponent} from "../common/order-partners/order-partners.component";

describe('OrderModificationComponent', () => {
    let component: OrderModificationComponent;
    let fixture: ComponentFixture<OrderModificationComponent>;
    let mockOrderService: jasmine.SpyObj<OrderService>;
    let mockErrorDialogService: jasmine.SpyObj<ErrorDialogService>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<OrderModificationComponent>>;
    let mockData: OrderView;

    beforeEach(async () => {
        mockOrderService = jasmine.createSpyObj('OrderService', ['modifyOrder']);
        mockErrorDialogService = jasmine.createSpyObj('ErrorDialogService', ['openApiErrorDialog']);
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        mockData = {
            orderId: '123',
            orderIdConsumer: '456',
            orderer: {sgvId: 'Orderer', partnerId: "OrdererPartnerId"},
            shipper: {sgvId: 'Shipper', partnerId: "ShipperPartnerId"},
            status: 'CREATED',
            origin: 'EKP',
            demand: {
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
            } as DemandView
        } as OrderView;

        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule,
                      OrderModificationComponent,
                      DemandComponent,
                      OrderPartnersComponent,
                      HttpClientTestingModule,
                      TranslateModule.forRoot()
            ],
            providers: [
                {provide: OrderService, useValue: mockOrderService},
                {provide: ErrorDialogService, useValue: mockErrorDialogService},
                {provide: MatDialogRef, useValue: mockDialogRef},
                {provide: MAT_DIALOG_DATA, useValue: {order: mockData, action: 'edit'}}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderModificationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form on init', () => {
        expect(component.formGroup).toBeDefined();
        expect(component.templateControl).toBeDefined();
        expect(component.partnersControl).toBeDefined();
        expect(component.demandControl).toBeDefined();
    });

    it('should validate form correctly', () => {
        component.formGroup.setErrors({invalid: true});
        expect(component.isFormValid()).toBeFalse();
        expect(component.formGroup.valid).toBeFalse();
    });

    it('should fill data correctly', () => {
        spyOn(component.demandComponent, 'fillData');
        component.fillData();
        expect(component.demandComponent.fillData).toHaveBeenCalledWith(component.demand);
    });
});