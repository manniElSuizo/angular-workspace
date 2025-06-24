import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OrderAction, OrderCreationComponent} from './order-creation.component';
import {ReactiveFormsModule} from '@angular/forms';
import {DBUIElementsModule} from "@db-ui/ngx-elements-enterprise/dist/lib";
import {TranslateModule} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OrderService} from "../../services/order.service";
import {ErrorDialogService} from "../../../../shared/error-handler/service/api-error-dialog.service";
import {TemplateService} from "../../../template/services/template.service";
import {of, throwError} from 'rxjs';
import {DemandComponent} from '../common/demand/demand.component';
import {OrderInquiryView} from '../../models/order-inquiry-view';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {OrderPartnersComponent} from "../common/order-partners/order-partners.component";

describe('OrderCreationComponent', () => {
    let component: OrderCreationComponent;
    let fixture: ComponentFixture<OrderCreationComponent>;
    let mockOrderService: jasmine.SpyObj<OrderService>;
    let mockTemplateService: jasmine.SpyObj<TemplateService>;
    let mockErrorDialogService: jasmine.SpyObj<ErrorDialogService>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<OrderCreationComponent>>;

    beforeEach(async () => {
        mockOrderService = jasmine.createSpyObj('OrderService', ['createOrder']);
        mockTemplateService = jasmine.createSpyObj('TemplateService', ['getTemplateByName']);
        mockErrorDialogService = jasmine.createSpyObj('ErrorDialogService', ['openApiErrorDialog']);
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                DBUIElementsModule,
                TranslateModule.forRoot(),
                HttpClientTestingModule,
                OrderCreationComponent,
                OrderPartnersComponent,
                DemandComponent
            ],
            providers: [
                {provide: MatDialogRef, useValue: mockDialogRef},
                {provide: MAT_DIALOG_DATA, useValue: {action: OrderAction.CREATE}},
                {provide: OrderService, useValue: mockOrderService},
                {provide: ErrorDialogService, useValue: mockErrorDialogService},
                {provide: TemplateService, useValue: mockTemplateService}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form on init', () => {
        expect(component.formGroup).toBeDefined();
        expect(component.demandsControl.length).toBe(0);
    });

    it('should call ngOnChanges and detect changes', () => {
        spyOn(component['cd'], 'detectChanges');
        component.ngOnChanges();
        expect(component['cd'].detectChanges).toHaveBeenCalled();
    });

    it('should call ngAfterViewInit and detect changes', () => {
        spyOn(component['cd'], 'detectChanges');
        component.ngAfterViewInit();
        expect(component['cd'].detectChanges).toHaveBeenCalled();
    });

    it('should reset data and form on template name change', () => {
        mockTemplateService.getTemplateByName.and.returnValue(of({} as OrderInquiryView));
        component.onTemplateNameChange('newTemplate');
        expect(mockTemplateService.getTemplateByName).toHaveBeenCalledWith('newTemplate');
        // Verify the effects of reset indirectly
        expect(component.formGroup.get('templateControl').value).toEqual({templateNameControl: undefined});
        expect(component.demandsControl.length).toBe(0);
    });

    it('should handle order creation request success', () => {
        mockOrderService.createOrder.and.returnValue(of({}));
        component.sendOrderCreationRequest();
        expect(mockOrderService.createOrder).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalledWith({success: true, orderId: undefined});
    });

    it('should handle order creation request error', () => {
        mockOrderService.createOrder.and.returnValue(throwError(() => new Error('error')));
        component.sendOrderCreationRequest();
        expect(mockOrderService.createOrder).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalledWith({success: false});
        expect(mockErrorDialogService.openApiErrorDialog).toHaveBeenCalled();
    });

    it('should validate form and submit order creation request', () => {
        spyOn(component, 'sendOrderCreationRequest');
        component.submit();
        expect(component.sendOrderCreationRequest).not.toHaveBeenCalled();
        component.formGroup.setErrors(null); // Simulate valid form
        component.submit();
    });

    // Add more tests for other methods and scenarios as needed
});