import {TestBed} from '@angular/core/testing';
import {InvoiceSummaryMappingService} from './invoice-summary-mapping.service';
import {InvoiceSummary, InvoiceSummaryRequestView} from '../models/invoice-summary';
import {InvoiceSummaryResponse} from '../api/generated/model/invoice-summary-response';

describe('InvoiceSummaryMappingService', () => {
    let service: InvoiceSummaryMappingService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [InvoiceSummaryMappingService]
        });
        service = TestBed.inject(InvoiceSummaryMappingService);
    });

    describe('toApiRequest', () => {
        it('should convert date fields to "YYYY-MM-DD" format and copy other properties', () => {
            const dateFrom = new Date('2023-10-01T12:00:00Z');
            const dateTo = new Date('2023-10-31T12:00:00Z');

            // Creating a sample request view. Additional properties from BasicListRequest are appended.
            const viewRequest: InvoiceSummaryRequestView = {
                invoiceDateFrom: dateFrom,
                invoiceDateTo: dateTo,
                debitorNumbers: ['12345'],
                invoiceNumber: 'INV-001',
                sort: 'asc',
                // Assuming BasicListRequest properties exist
                offset: 10,
                limit: 20
            } as any; // Casting as any to satisfy the extended type if needed

            const apiRequest = service.toApiRequest(viewRequest);

            expect(apiRequest.invoiceDateFrom).toBe('2023-10-01');
            expect(apiRequest.invoiceDateTo).toBe('2023-10-31');
            expect(apiRequest.debitorNumbers).toEqual(['12345']);
            expect(apiRequest.invoiceNumber).toBe('INV-001');
            expect(apiRequest.sort).toBe('asc');
            expect(apiRequest.offset).toBe(10);
            expect(apiRequest.limit).toBe(20);
            expect(apiRequest.InvoiceTypes).toBeUndefined();
        });
    });

    describe('fromApiResponse', () => {
        it('should map API response to view response with date conversion to Date objects', () => {
            const apiResponse: InvoiceSummaryResponse = {
                offset: 5,
                limit: 10,
                total: 100,
                summaries: [{
                    uuid: 'uuid-1',
                    repositoryUuid: 'repo-1',
                    invoiceNumber: 'INV-001',
                    currency: 'USD',
                    debitorNumber: 'D-001',
                    dueDate: '2023-11-01',
                    documentName: 'Invoice Document',
                    fileType: 'PDF',
                    grossAmount: 150,
                    netAmount: 120,
                    invoiceDate: '2023-10-15',
                    recipientCompany: 'Company A',
                    referenceInvoiceNumber: 'REF-001',
                    vatAmount: 30
                }]
            };

            const viewResponse = service.fromApiResponse(apiResponse);
            expect(viewResponse.offset).toBe(5);
            expect(viewResponse.limit).toBe(10);
            expect(viewResponse.total).toBe(100);
            expect(viewResponse.summaries && viewResponse.summaries.length).toBe(1);

            const summary: InvoiceSummary = viewResponse.summaries![0];
            expect(summary.uuid).toBe('uuid-1');
            expect(summary.repositoryUuid).toBe('repo-1');
            expect(summary.invoiceNumber).toBe('INV-001');
            expect(summary.currency).toBe('USD');
            expect(summary.debitorNumber).toBe('D-001');

            // Check that date strings have been converted to Date objects
            expect(summary.dueDate instanceof Date).toBeTrue();
            if (summary.dueDate) {
                expect(summary.dueDate.toISOString().split('T')[0]).toBe('2023-11-01');
            }
            expect(summary.invoiceDate instanceof Date).toBeTrue();
            if (summary.invoiceDate) {
                expect(summary.invoiceDate.toISOString().split('T')[0]).toBe('2023-10-15');
            }

            expect(summary.documentName).toBe('Invoice Document');
            expect(summary.fileType).toBe('PDF');
            expect(summary.grossAmount).toBe(150);
            expect(summary.netAmount).toBe(120);
            expect(summary.recipientCompany).toBe('Company A');
            expect(summary.referenceInvoiceNumber).toBe('REF-001');
            expect(summary.vatAmount).toBe(30);
        });
    });
});
