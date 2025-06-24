import {BasicListRequest, PagingResponse} from "../../shared/models/paging";

export interface InvoiceSummaryRequestView extends BasicListRequest {
    invoiceDateFrom?: Date;
    invoiceDateTo?: Date;
    debitorNumbers?: Array<string>;
    invoiceNumber?: string;
    offset: number;
    limit: number;
    sort?: string;
}

export interface InvoiceSummaryResponseView extends PagingResponse {
    summaries?: Array<InvoiceSummary>;
}

export interface InvoiceSummary {
    uuid?: string;
    repositoryUuid?: string;
    invoiceNumber: string;
    currency?: string;
    debitorNumber: string;
    dueDate?: Date;
    documentName?: string;
    fileType?: string;
    grossAmount?: number;
    netAmount?: number;
    invoiceDate?: Date;
    recipientCompany?: string;
    referenceInvoiceNumber?: string;
    vatAmount?: number;
}