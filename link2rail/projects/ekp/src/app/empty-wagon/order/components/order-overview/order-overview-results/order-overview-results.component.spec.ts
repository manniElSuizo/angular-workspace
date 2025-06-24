import {ComponentFixture, TestBed} from '@angular/core/testing';
import {OrderOverviewResultsComponent} from './order-overview-results.component';
import {TranslateModule} from '@ngx-translate/core';

import {Subject} from 'rxjs';
import {OrderDialogService} from "../../../services/order-dialog.service";
import {PopupMenuComponent} from "../../../../../shared/components/popup-menu/popup-menu.component";

describe('OrderOverviewResultsComponent', () => {
    let component: OrderOverviewResultsComponent;
    let fixture: ComponentFixture<OrderOverviewResultsComponent>;
    let mockOrderDialogService: jasmine.SpyObj<OrderDialogService>;

    beforeEach(async () => {
        mockOrderDialogService = jasmine.createSpyObj('OrderDialogService', [
            'openOrderModificationDialog',
            'openOrderCancellationDialog',
            'openOrderStatusHistoryDialog'
        ]);

        await TestBed.configureTestingModule({
            declarations: [OrderOverviewResultsComponent, PopupMenuComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                {provide: OrderDialogService, useValue: mockOrderDialogService}
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrderOverviewResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call openOrderModificationDialog on modifyOrder', () => {
        const orderIdConsumer = '123';
        const resultSubject = new Subject<boolean>();
        mockOrderDialogService.openOrderModificationDialog.and.returnValue(resultSubject);

        component.modifyOrder(orderIdConsumer);

        expect(mockOrderDialogService.openOrderModificationDialog).toHaveBeenCalledWith('edit', orderIdConsumer);
    });

    it('should handle error in modifyOrder', () => {
        const orderIdConsumer = '123';
        spyOn(console, 'error');
        const resultSubject = new Subject<boolean>();
        mockOrderDialogService.openOrderModificationDialog.and.returnValue(resultSubject);
        resultSubject.error('error');

        component.modifyOrder(orderIdConsumer);

        expect(console.error).toHaveBeenCalledWith('Error opening modification dialog', 'error');
    });

    it('should call openOrderCancellationDialog on cancelOrder', () => {
        const orderId = '123';
        const orderIdConsumer = '456';
        const resultSubject = new Subject<boolean>();
        mockOrderDialogService.openOrderCancellationDialog.and.returnValue(resultSubject);

        component.cancelOrder(orderId, orderIdConsumer);

        expect(mockOrderDialogService.openOrderCancellationDialog).toHaveBeenCalledWith(orderId, orderIdConsumer);
    });

    it('should call openOrderStatusHistoryDialog on viewStatusHistory', () => {
        const orderIdConsumer = '789';
        const resultSubject = new Subject<boolean>();
        mockOrderDialogService.openOrderStatusHistoryDialog.and.returnValue(resultSubject);

        component.viewStatusHistory(orderIdConsumer);

        expect(mockOrderDialogService.openOrderStatusHistoryDialog).toHaveBeenCalledWith(orderIdConsumer);
    });

});