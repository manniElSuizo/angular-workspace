import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {InvoiceSummaryMappingService} from "./invoice-summary-mapping.service";
import {InvoiceSummaryRequestView, InvoiceSummaryResponseView} from "../models/invoice-summary";
import {InvoicePdfRequest} from "../models/invoice-view";
import {InvoiceAPIService} from "../api/generated";

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    constructor(
        private apiService: InvoiceAPIService,
        private mapper: InvoiceSummaryMappingService
    ) { }

    /**
     * Retrieves the invoice PDF by calling the underlying apiService.
     *
     * @param request - The request object containing debitorNumber, invoiceNumber, repositoryUuid, and documentUuid.
     * @returns Observable emitting the PDF blob.
     */
    public getInvoicePdf(request: InvoicePdfRequest): Observable<Blob> {
        return this.apiService.getInvoicePdf(
            request.debitorNumber,
            request.invoiceNumber,
            request.repositoryUuid,
            request.documentUuid,
            'body',
            false,
            {
                httpHeaderAccept: 'application/pdf'
            }
        );
    }

    /**
     * Searches invoices using the provided view request.
     * Converts the view request to the API model then maps the API response back to a view model.
     * @param request - The view model request for invoice summary.
     * @returns Observable emitting the invoice summary response view.
     */
    public searchInvoices(request: InvoiceSummaryRequestView): Observable<InvoiceSummaryResponseView> {
        const apiRequest = this.mapper.toApiRequest(request);
        return this.apiService.searchInvoices(apiRequest, 'body', false, {
            httpHeaderAccept: 'application/json'
        }).pipe(
            map(apiResponse => this.mapper.fromApiResponse(apiResponse))
        );
    }
}