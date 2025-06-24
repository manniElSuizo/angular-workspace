import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {of, throwError} from 'rxjs';
import {OrderCancellationComponent} from './order-cancellation.component';
import {OrderService} from '../../services/order.service';
import {ErrorDialogService} from '../../../../shared/error-handler/service/api-error-dialog.service';
import {TranslateModule} from "@ngx-translate/core";

describe('OrderCancellationComponent', () => {
    let component: OrderCancellationComponent;
    let fixture: ComponentFixture<OrderCancellationComponent>;
    let mockOrderService: jasmine.SpyObj<OrderService>;
    let mockErrorDialogService: jasmine.SpyObj<ErrorDialogService>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<OrderCancellationComponent>>;

    beforeEach(async () => {
        mockOrderService = jasmine.createSpyObj('OrderService', ['cancelOrderByIdConsumer', 'cancelOrdersByOrderId']);
        mockErrorDialogService = jasmine.createSpyObj('ErrorDialogService', ['openApiErrorDialog']);
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [OrderCancellationComponent,
                      TranslateModule.forRoot()],
            providers: [
                {provide: OrderService, useValue: mockOrderService},
                {provide: ErrorDialogService, useValue: mockErrorDialogService},
                {provide: MatDialogRef, useValue: mockDialogRef},
                {provide: MAT_DIALOG_DATA, useValue: {orderIdConsumer: '123', orderId: '456'}}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderCancellationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should cancel order by orderIdConsumer successfully', () => {
        mockOrderService.cancelOrderByIdConsumer.and.returnValue(of({}));

        component.cancelOrderByIdConsumer();

        expect(mockOrderService.cancelOrderByIdConsumer).toHaveBeenCalledWith('123');
        expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle error when canceling order by orderIdConsumer', () => {
        const error = new Error('Test error');
        mockOrderService.cancelOrderByIdConsumer.and.returnValue(throwError(() => error));

        component.cancelOrderByIdConsumer();

        expect(mockOrderService.cancelOrderByIdConsumer).toHaveBeenCalledWith('123');
        expect(mockDialogRef.close).toHaveBeenCalledWith(false);
        expect(mockErrorDialogService.openApiErrorDialog).toHaveBeenCalledWith(error);
    });

    it('should cancel orders by orderId successfully', () => {
        mockOrderService.cancelOrdersByOrderId.and.returnValue(of([]));

        component.cancelOrdersByOrderId();

        expect(mockOrderService.cancelOrdersByOrderId).toHaveBeenCalledWith('456');
        expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle error when canceling orders by orderId', () => {
        const error = new Error('Test error');
        mockOrderService.cancelOrdersByOrderId.and.returnValue(throwError(() => error));

        component.cancelOrdersByOrderId();

        expect(mockOrderService.cancelOrdersByOrderId).toHaveBeenCalledWith('456');
        expect(mockDialogRef.close).toHaveBeenCalledWith(false);
        expect(mockErrorDialogService.openApiErrorDialog).toHaveBeenCalledWith(error);
    });
});