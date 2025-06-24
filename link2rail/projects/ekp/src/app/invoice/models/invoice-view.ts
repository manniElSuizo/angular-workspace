/**
 * Request object for retrieving an invoice PDF.
 */
export interface InvoicePdfRequest {
    debitorNumber: string;
    invoiceNumber: string;
    repositoryUuid: string;
    documentUuid: string;
}

export interface InvoiceView {
}
