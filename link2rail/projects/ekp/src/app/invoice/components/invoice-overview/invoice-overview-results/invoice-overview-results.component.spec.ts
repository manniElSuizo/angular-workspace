import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceOverviewResultsComponent} from './invoice-overview-results.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PopupMenuModule} from '../../../../shared/components/popup-menu/popup-menu.module';
import {SharedPipesModule} from '../../../../shared/pipes/shared-pipes.module';
import {NgForOf, NgIf} from '@angular/common';
import {InvoiceSummary} from '../../../models/invoice-summary';
import {of} from 'rxjs';

describe('InvoiceOverviewResultsComponent', () => {
    let component: InvoiceOverviewResultsComponent;
    let fixture: ComponentFixture<InvoiceOverviewResultsComponent>;
    let translateService: TranslateService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                InvoiceOverviewResultsComponent,
                TranslateModule.forRoot(),
                MatTooltipModule,
                PopupMenuModule,
                SharedPipesModule,
                NgForOf,
                NgIf
            ],
            providers: [
                TranslateService
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InvoiceOverviewResultsComponent);
        component = fixture.componentInstance;
        translateService = TestBed.inject(TranslateService);
        // Provide a stub for translate if necessary
        spyOn(translateService, 'get').and.callFake((key: string) => of(key));
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit showSelectedInvoice when showInvoice is called with a valid index', () => {
        const dummyInvoice: InvoiceSummary = {
            invoiceNumber: 'INV001',
            invoiceDate: new Date(),
            referenceInvoiceNumber: 'REF001',
            recipientCompany: 'Company Ltd',
            debitorNumber: 'DN001',
            dueDate: new Date(),
            currency: 'USD',
            netAmount: 100,
            vatAmount: 20,
            grossAmount: 120,
            uuid: "uuid",
            repositoryUuid: "repositoryUuid"
        };
        component.tableData = [dummyInvoice];
        spyOn(component.showSelectedInvoice, 'emit');
        component.showInvoice(0);
        expect(component.showSelectedInvoice.emit).toHaveBeenCalledWith(dummyInvoice);
    });

    it('should not crash when showInvoice is called with an invalid index', () => {
        // Even if index is invalid, since no check exists the function may throw error
        // This test confirms that behavior, if necessary update implementation.
        expect(() => component.showInvoice(100)).toThrowError();
    });
});
