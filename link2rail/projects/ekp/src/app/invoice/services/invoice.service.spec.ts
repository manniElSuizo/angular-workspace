import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {InvoiceService} from './invoice.service';
import {InvoiceSummaryMappingService} from './invoice-summary-mapping.service';
import {InvoiceSummaryRequestView, InvoiceSummaryResponseView} from '../models/invoice-summary';
import {InvoiceAPIService, InvoiceSummaryRequest} from '../api/generated';
import {InvoicePdfRequest} from "../models/invoice-view";

describe('InvoiceService', () => {
    let service: InvoiceService;
    let invoicesServiceSpy: jasmine.SpyObj<InvoiceAPIService>;
    let mappingServiceSpy: jasmine.SpyObj<InvoiceSummaryMappingService>;

    beforeEach(() => {
        const invoicesSpy = jasmine.createSpyObj('InvoiceAPIService', ['getInvoicePdf', 'searchInvoices']);
        const mappingSpy = jasmine.createSpyObj('InvoiceSummaryMappingService', ['toApiRequest', 'fromApiResponse']);

        TestBed.configureTestingModule({
            providers: [
                InvoiceService,
                {provide: InvoiceAPIService, useValue: invoicesSpy},
                {provide: InvoiceSummaryMappingService, useValue: mappingSpy}
            ]
        });
        service = TestBed.inject(InvoiceService);
        invoicesServiceSpy = TestBed.inject(InvoiceAPIService) as jasmine.SpyObj<InvoiceAPIService>;
        mappingServiceSpy = TestBed.inject(InvoiceSummaryMappingService) as jasmine.SpyObj<InvoiceSummaryMappingService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getInvoicePdf', () => {
        it('should call apiService.getInvoicePdf and return the pdf blob', (done) => {
            const dummyBlob = new Blob(['dummy content'], {type: 'application/pdf'});
            // Cast to any to match the expected Observable<HttpEvent<Blob>> type.
            invoicesServiceSpy.getInvoicePdf.and.returnValue(of(dummyBlob) as any);
            const request = {
                debitorNumber: "debitor1",
                invoiceNumber: 'inv001',
                repositoryUuid: 'repo001',
                documentUuid: 'doc001'

            } as InvoicePdfRequest;

            service.getInvoicePdf(request).subscribe(result => {
                expect(result).toEqual(dummyBlob);
                expect(invoicesServiceSpy.getInvoicePdf).toHaveBeenCalledWith(
                    'debitor1',
                    'inv001',
                    'repo001',
                    'doc001',
                    "body" as any,
                    false,
                    {httpHeaderAccept: 'application/pdf'}
                );
                done();
            });
        });

        it('should propagate error when apiService.getInvoicePdf fails', (done) => {
            const errorResponse = new Error('PDF not found');
            invoicesServiceSpy.getInvoicePdf.and.returnValue(throwError(() => errorResponse) as any);

            const request = {
                debitorNumber: "debitor1",
                invoiceNumber: 'inv001',
                repositoryUuid: 'repo001',
                documentUuid: 'doc001'

            } as InvoicePdfRequest;

            service.getInvoicePdf(request).subscribe({
                next: () => {
                    done.fail('Expected an error, but got success response');
                },
                error: err => {
                    expect(err).toEqual(errorResponse);
                    done();
                }
            });
        });
    });

    describe('searchInvoices', () => {
        it('should convert view request to API request, search invoices and map response back to view model', (done) => {
            const viewRequest: InvoiceSummaryRequestView = {
                limit: 25,
                offset: 0,
                invoiceDateFrom: new Date('2023-01-01'),
                invoiceDateTo: new Date('2023-02-01'),
                debitorNumbers: ['debitor1'],
                invoiceNumber: 'inv001',
                sort: 'asc'
            };

            // Provide a minimal valid object for InvoiceSummaryRequest.
            const apiRequest: InvoiceSummaryRequest = {
                converted: true,
                offset: 0,
                limit: 10
            } as any;

            // Provide a valid InvoiceSummaryResponse object.
            const apiResponse = {
                offset: 0,
                limit: 10,
                total: 0,
                summaries: []
            };

            const viewResponse: InvoiceSummaryResponseView = {
                summaries: [],
                offset: 0,
                limit: 10,
                total: 0
            };

            mappingServiceSpy.toApiRequest.and.returnValue(apiRequest);
            // Cast the observable result to any to bypass HttpEvent type mismatch.
            invoicesServiceSpy.searchInvoices.and.returnValue(of(apiResponse) as any);
            mappingServiceSpy.fromApiResponse.and.returnValue(viewResponse);

            service.searchInvoices(viewRequest).subscribe(result => {
                expect(mappingServiceSpy.toApiRequest).toHaveBeenCalledWith(viewRequest);
                expect(invoicesServiceSpy.searchInvoices).toHaveBeenCalledWith(
                    apiRequest,
                    "body" as any,
                    false,
                    {httpHeaderAccept: 'application/json'}
                );
                expect(mappingServiceSpy.fromApiResponse).toHaveBeenCalledWith(apiResponse);
                expect(result).toEqual(viewResponse);
                done();
            });
        });

        it('should propagate error when apiService.searchInvoices fails', (done) => {
            const viewRequest: InvoiceSummaryRequestView = {
                limit: 25,
                offset: 0,
                invoiceDateFrom: new Date('2023-01-01'),
                invoiceDateTo: new Date('2023-02-01'),
                debitorNumbers: ['debitor1'],
                invoiceNumber: 'inv001',
                sort: 'asc'
            };

            const apiRequest: InvoiceSummaryRequest = {
                converted: true,
                offset: 0,
                limit: 10
            } as any;

            const errorResponse = new Error('Search failed');
            mappingServiceSpy.toApiRequest.and.returnValue(apiRequest);
            invoicesServiceSpy.searchInvoices.and.returnValue(throwError(() => errorResponse) as any);

            service.searchInvoices(viewRequest).subscribe({
                next: () => {
                    done.fail('Expected an error, but got success response');
                },
                error: err => {
                    expect(mappingServiceSpy.toApiRequest).toHaveBeenCalledWith(viewRequest);
                    expect(invoicesServiceSpy.searchInvoices).toHaveBeenCalledWith(
                        apiRequest,
                        "body" as any,
                        false,
                        {httpHeaderAccept: 'application/json'}
                    );
                    expect(err).toEqual(errorResponse);
                    done();
                }
            });
        });
    });
});