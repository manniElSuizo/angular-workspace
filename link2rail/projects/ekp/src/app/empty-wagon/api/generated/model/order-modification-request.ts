/**
 * Empty wagon API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { NHM } from './nhm';
import { TransitRailwayUndertaking } from './transit-railway-undertaking';
import { CommercialLocation } from './commercial-location';


export interface OrderModificationRequest { 
    /**
     * Desired date and time of empty wagon delivery.
     */
    demandDateTime: string;
    /**
     * Number of wagons to be ordered.
     */
    numberOfWagons: number;
    /**
     * Comment addressed to the customer service.
     */
    commentCustomer?: string;
    /**
     * Reference number for the orders chosen by the customer.
     */
    customerReference?: string;
    loadRunLocation?: CommercialLocation;
    transitRailwayUndertaking?: TransitRailwayUndertaking;
    nhm?: NHM;
}

