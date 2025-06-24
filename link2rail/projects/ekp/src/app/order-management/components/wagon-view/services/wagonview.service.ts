import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PartnerRole, PartnerSummary, WagonSearchSummaryDetailedResponse, WagonSummaryRequest, WagonSummaryResponse } from '../models/api-wagon-list';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { Country } from '@src/app/order-management/models/general-order';
import { countriesMock } from '@src/app/trainorder/mockup/orders.mock';
import { ApiUrls } from '@src/app/shared/enums/api-urls.enum';
import { StationType } from '@src/app/trainorder/models/location.models';
import { CommercialLocationSummary } from '@src/app/order-management/models/om-internal-api';

export const WAGON_SEARCH_URL = '/rail-orders/wagons/search';
export const RAIL_ORDERS_CURRENT_LOCATIONS_URL = '/rail-orders/current-locations';
export const RAIL_ORDERS_PARTNERS_URL = '/rail-orders/partners';
export const RAIL_ORDER_DELIVERY_ISO2COUNTRYCODES = '/rail-orders/delivery-iso2countrycodes';
export const RAIL_ORDER_SENDER_ISO2COUNTRYCODES = '/rail-orders/sender-iso2countrycodes';
@Injectable({
  providedIn: 'root'
})
export class WagonviewService {

  private backendUrl: string;

  constructor(private httpClient: HttpClient, private env: EnvService, private storageService: LocalStorageService) {
    this.backendUrl = this.env?.backendUrlOm;
    if (typeof this.backendUrl == 'undefined' || this.backendUrl == null) {
      console.info("no environment setting for backendUrl found!");
    }
  }

   public getWagonList(request: WagonSummaryRequest , detailed: boolean = false): Observable<WagonSummaryResponse> {
    const url = this.backendUrl + WAGON_SEARCH_URL;
    const queryParams = `?detailed=${detailed}`;

     return this.httpClient.post<WagonSummaryResponse>(url + queryParams, request);
  }

  // New method to get a detailed wagon list with 'detailed' query parameter
  public getDetailedWagonList(request: WagonSummaryRequest, detailed: boolean = true): Observable<WagonSearchSummaryDetailedResponse> {
    const url = this.backendUrl + WAGON_SEARCH_URL;
    // Append the 'detailed' query parameter to the URL
    const queryParams = `?detailed=${detailed}`;

    // Send the POST request with the 'detailed' flag in the query parameters
    return this.httpClient.post<WagonSearchSummaryDetailedResponse>(url + queryParams, request);
  }

  public getRailOrdersCurrentLocations(query: string): Observable<string[]> {
    let url = this.backendUrl + RAIL_ORDERS_CURRENT_LOCATIONS_URL;
    url += '?query=' + query;
    return this.httpClient.get<string[]>(url);
  }

  public getRailOrdersPartners(query: string, partnerRole: PartnerRole): Observable<PartnerSummary[]> {
    let url = this.backendUrl + RAIL_ORDERS_PARTNERS_URL;
    url += '?query=' + query + '&partnerRole=' + partnerRole;
    return this.httpClient.get<PartnerSummary[]>(url);
  }
}
