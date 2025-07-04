/**
 * Invoice API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface InvoiceSummaryRequest { 
    /**
     * The start date for the invoice search range.
     */
    invoiceDateFrom?: string;
    /**
     * The end date for the invoice search range.
     */
    invoiceDateTo?: string;
    /**
     * A list of debitor numbers to filter the search.
     */
    debitorNumbers?: Array<string>;
    /**
     * The specific invoice number to search for.
     */
    invoiceNumber?: string;
    /**
     * A set of invoice types to filter the search.
     */
    InvoiceTypes?: Array<InvoiceSummaryRequest.InvoiceTypesEnum>;
    /**
     * zero-based offset of the page within the result list, must be a multiple of limit and not be negative
     */
    offset: number;
    /**
     * the maximum number of returned items, must be greater than 0
     */
    limit: number;
    /**
     * Comma seperated list of properties to sort by. A plus as prefix in front of the attribute name indicates ascending order. A Minus indicates descending order.
     */
    sort?: string;
}
export namespace InvoiceSummaryRequest {
    export type InvoiceTypesEnum = 'CPI' | 'SAP';
    export const InvoiceTypesEnum = {
        Cpi: 'CPI' as InvoiceTypesEnum,
        Sap: 'SAP' as InvoiceTypesEnum
    };
}


