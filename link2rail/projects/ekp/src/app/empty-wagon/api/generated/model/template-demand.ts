/**
 * Empty wagon API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { DemandType } from './demand-type';
import { DemandLocation } from './demand-location';


export interface TemplateDemand { 
    demandLocation: DemandLocation;
    demandTypes: Array<DemandType>;
}

