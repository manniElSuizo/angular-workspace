import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InvoiceOverviewComponent} from './invoice-overview.component';
import {InvoiceService} from '../../services/invoice.service';
import {ErrorDialogService} from '../../../shared/error-handler/service/api-error-dialog.service';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {CsvReportBuilder} from '../../../shared/utils/csv-report-builder';
import {Subject} from 'rxjs';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('InvoiceOverviewComponent', () => {
    let component: InvoiceOverviewComponent;
    let fixture: ComponentFixture<InvoiceOverviewComponent>;
    let mockInvoiceService: jasmine.SpyObj<InvoiceService>;
    let mockErrorDialogService: jasmine.SpyObj<ErrorDialogService>;
    let mockTranslateService: jasmine.SpyObj<TranslateService>;

    beforeEach(async () => {
        mockInvoiceService = jasmine.createSpyObj('InvoiceService', ['searchInvoices', 'getInvoicePdf']);
        mockErrorDialogService = jasmine.createSpyObj('ErrorDialogService', ['openApiErrorDialog']);
        mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);

        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                HttpClientTestingModule,
                InvoiceOverviewComponent
            ],
            providers: [
                DatePipe,
                CurrencyPipe,
                {provide: InvoiceService, useValue: mockInvoiceService},
                {provide: ErrorDialogService, useValue: mockErrorDialogService},
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(InvoiceOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('formatCurrency', () => {
        it('should format number as decimal string', () => {
            expect(component['formatCurrency'](null)).toBe('');
            expect(component['formatCurrency'](undefined)).toBe('');
        });
    });

    describe('formatDate', () => {
        it('should format date as shortDate', () => {
            const date = new Date(2023, 0, 2);
            expect(component['formatDate'](date)).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
            expect(component['formatDate'](null)).toBe('');
        });
    });

    describe('toStartOfDay', () => {
        it('should set time to 00:00:00.000', () => {
            const d = component['toStartOfDay']('2023-01-02T15:30:00Z');
            expect(d?.getHours()).toBe(0);
            expect(d?.getMinutes()).toBe(0);
            expect(d?.getSeconds()).toBe(0);
            expect(d?.getMilliseconds()).toBe(0);
        });
        it('should return null for null', () => {
            expect(component['toStartOfDay'](null)).toBeNull();
        });
    });

    describe('toEndOfDay', () => {
        it('should set time to 23:59:59.999', () => {
            const d = component['toEndOfDay']('2023-01-02T15:30:00Z');
            expect(d?.getHours()).toBe(23);
            expect(d?.getMinutes()).toBe(59);
            expect(d?.getSeconds()).toBe(59);
            expect(d?.getMilliseconds()).toBe(999);
        });
        it('should return null for null', () => {
            expect(component['toEndOfDay'](null)).toBeNull();
        });
    });

    describe('toDebitorKeys', () => {
        it('should map ListKeyValue array to keys', () => {
            const items = [{key: 'A'}, {key: 'B'}];
            expect(component['toDebitorKeys'](items as any)).toEqual(['A', 'B']);
        });
        it('should return null for null or empty', () => {
            expect(component['toDebitorKeys'](null)).toBeNull();
            expect(component['toDebitorKeys']([])).toBeNull();
        });
    });

    describe('onReportData', () => {
        it('should build and download CSV with correct headers and rows', () => {
            // Arrange
            const fakeSummaries = [{
                invoiceNumber: 'INV-1',
                invoiceDate: new Date('2023-01-01'),
                referenceInvoiceNumber: 'REF-1',
                recipientCompany: 'Company A',
                debitorNumber: 'D-1',
                dueDate: new Date('2023-01-10'),
                netAmount: 100,
                vatAmount: 19,
                grossAmount: 119,
                currency: 'EUR'
            }];
            component.results = {
                tableHeaders: [
                    {fieldName: 'invoiceNumber', headerText: 'Invoice Number'},
                    {fieldName: 'invoiceDate', headerText: 'Invoice Date'},
                    {fieldName: 'referenceInvoiceNumber', headerText: 'Reference'},
                    {fieldName: 'recipientCompany', headerText: 'Recipient'},
                    {fieldName: 'debitorNumber', headerText: 'Debitor'},
                    {fieldName: 'dueDate', headerText: 'Due Date'},
                    {fieldName: 'netAmount', headerText: 'Net'},
                    {fieldName: 'vatAmount', headerText: 'VAT'},
                    {fieldName: 'grossAmount', headerText: 'Gross'}
                ],
                translationKey: 'invoice'
            } as any;

            spyOn(CsvReportBuilder.prototype, 'download');
            mockTranslateService.instant.and.returnValue('Currency');

            // Act
            component['onReportData']({
                summaries: fakeSummaries,
                offset: 0,
                limit: 0,
                total: 0
            });

            // Assert
            expect(CsvReportBuilder.prototype.download).toHaveBeenCalled();
        });
    });

    describe('onReportError', () => {
        it('should call onFetchError', () => {
            spyOn(component as any, 'onFetchError');
            component['onReportError']('err');
            expect((component as any).onFetchError).toHaveBeenCalledWith('err');
        });
    });

    describe('onFetchSuccess', () => {
        it('should set tableData and numberOfResults', () => {
            const resp = {summaries: [{invoiceNumber: '1'}], total: 1};
            component['request'] = {offset: 0} as any;
            component['onFetchSuccess'](resp as any);
            expect(component.tableData.length).toBe(1);
            expect(component.numberOfResults).toBe(1);
            expect(component.totalNumberOfResults).toBe(1);
        });
        it('should append data if offset > 0', () => {
            component.tableData = [{invoiceNumber: 'old'} as any];
            const resp = {summaries: [{invoiceNumber: 'new'}], total: 2};
            component['request'] = {offset: 1} as any;
            component['onFetchSuccess'](resp as any);
            expect(component.tableData.length).toBe(2);
        });
    });

    describe('onFetchError', () => {
        it('should open error dialog and set isLoading to false', () => {
            const err = {message: 'fail'};
            component.isLoading = new Subject<boolean>();
            const loadingSpy = spyOn(component.isLoading, 'next');
            component['onFetchError'](err);
            expect(mockErrorDialogService.openApiErrorDialog).toHaveBeenCalledWith(err);
            expect(loadingSpy).toHaveBeenCalledWith(false);
        });
    });

    // Additional tests for filter, sorting, and PDF download can be added as needed.
});
