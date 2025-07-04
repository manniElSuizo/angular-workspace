/**
 * Empty wagon API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { Status } from './status';
import { DemandWagonType } from './demand-wagon-type';
import { CommercialLocation } from './commercial-location';
import { IdNameType } from './id-name-type';


export interface OrderSummaryRequest { 
    /**
     * Name of template.
     */
    templateName?: Array<string>;
    demandLocations?: Array<CommercialLocation>;
    demandWagonTypes?: Array<DemandWagonType>;
    ordererSgvs?: Array<IdNameType>;
    ordererPartners?: Array<IdNameType>;
    loadRunCountryCodeIso?: Array<string>;
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
    /**
     * Demand date from.
     */
    deliveryDateTimeFrom?: string;
    /**
     * Demand date from.
     */
    deliveryDateTimeTo?: string;
    origin?: Array<string>;
    status?: Array<Status>;
    /**
     * Search reference. OrderId, OrderIdConsumer or OrderIdInternal.
     */
    reference?: string;
}

