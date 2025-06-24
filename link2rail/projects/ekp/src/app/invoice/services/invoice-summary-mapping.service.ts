import {Injectable} from '@angular/core';
import {InvoiceSummary, InvoiceSummaryRequestView, InvoiceSummaryResponseView} from "../models/invoice-summary";
import {InvoiceSummaryRequest} from "../api/generated/model/invoice-summary-request";
import {InvoiceSummaryResponse} from "../api/generated/model/invoice-summary-response";

@Injectable({
    providedIn: 'root'
})
export class InvoiceSummaryMappingService {

    constructor() { }

    /**
     * Converts a view model InvoiceSummaryRequestView to the API model InvoiceSummaryRequest.
     * The date fields are formatted as 'YYYY-MM-DD' per the REST API requirements.
     *
     * @param {InvoiceSummaryRequestView} source - The view model request object.
     * @return {InvoiceSummaryRequest} - The API model request object.
     */

    public toApiRequest(source: InvoiceSummaryRequestView): InvoiceSummaryRequest {
        return {
            invoiceDateFrom: source.invoiceDateFrom ? source.invoiceDateFrom.toISOString().split('T')[0] : undefined,
            invoiceDateTo: source.invoiceDateTo ? source.invoiceDateTo.toISOString().split('T')[0] : undefined,
            debitorNumbers: source.debitorNumbers,
            invoiceNumber: source.invoiceNumber,
            sort: source.sort,
            // These properties are provided by BasicListRequest
            offset: (source as any).offset,
            limit: (source as any).limit,
            // API expects InvoiceTypes from a different source; leaving undefined unless set elsewhere.
            InvoiceTypes: undefined
        };
    }

    /**
     * Converts the API response model InvoiceSummaryResponse to the view model InvoiceSummaryResponseView.
     * Converts the date strings to Date objects for fields such as dueDate and invoiceDate.
     *
     * @param {InvoiceSummaryResponse} source - The API model response object.
     * @return {InvoiceSummaryResponseView} - The view model response object.
     */
    public fromApiResponse(source: InvoiceSummaryResponse): InvoiceSummaryResponseView {
        return {
            offset: source.offset,
            limit: source.limit,
            total: source.total,
            summaries: source.summaries?.map(apiSummary => this.mapInvoiceSummary(apiSummary))
        } as InvoiceSummaryResponseView;
    }

    /**
     * Maps an individual InvoiceSummary from the API response to the view model.
     * Converts date strings for dueDate and invoiceDate into Date objects.
     *
     * @param {*} apiSummary - The raw API summary object.
     * @return {InvoiceSummary} - The mapped view model invoice summary.
     */
    private mapInvoiceSummary(apiSummary: any): InvoiceSummary {
        return {
            uuid: apiSummary.uuid,
            repositoryUuid: apiSummary.repositoryUuid,
            invoiceNumber: apiSummary.invoiceNumber,
            currency: apiSummary.currency,
            debitorNumber: apiSummary.debitorNumber,
            dueDate: apiSummary.dueDate ? new Date(apiSummary.dueDate) : undefined,
            documentName: apiSummary.documentName,
            fileType: apiSummary.fileType,
            grossAmount: apiSummary.grossAmount,
            netAmount: apiSummary.netAmount,
            invoiceDate: apiSummary.invoiceDate ? new Date(apiSummary.invoiceDate) : undefined,
            recipientCompany: apiSummary.recipientCompany,
            referenceInvoiceNumber: apiSummary.referenceInvoiceNumber,
            vatAmount: apiSummary.vatAmount
        };
    }
}
