import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { take } from "rxjs/operators";
import { ApiUrls } from "@src/app/shared/enums/api-urls.enum";
import { EnvService } from "@src/app/shared/services/env/env.service";


import { StationType } from "@src/app/trainorder/models/location.models";
import { PartnerRole, PartnerSummary } from "../../wagon-view/models/api-wagon-list";
import { DangerousGood, NHMCodes, RailOrderCodeSummaryRequest, RailOrderCodeSummaryResponse } from "../models/ApiRailOrderCode.model";
import { TemplateSummary } from "../../../models/rail-order-api";
import { CommercialLocationSummary } from "@src/app/order-management/models/om-internal-api";
import { of } from "rxjs";
import { Country } from "@src/app/order-management/models/general-order";
import { countriesMock } from "@src/app/trainorder/mockup/orders.mock";


export const RAIL_ORDERS_TAMPLATES_COMMERCIAL_LOCATIONS_URL = '/rail-order-templates/commercial-locations';
export const RAIL_ORDERS_TAMPLATES_PARTNERS_URL = '/rail-order-templates/partners';
export const RAIL_ORDERS_TAMPLATES_TAMPLATES_URL = '/rail-order-templates/templates';

@Injectable({
  providedIn: 'root'
})
export class RailOrderCodeSearchService {


  private backendUrl: string;
  private backendUrlOm: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.backendUrl = this.env?.backendUrl;
    this.backendUrlOm = this.env?.backendUrlOm;
    if (typeof this.backendUrl == 'undefined' || this.backendUrl == null) {
      console.info("no environment setting for backendUrl found!");
    }
    if (typeof this.backendUrlOm == 'undefined' || this.backendUrlOm == null) {
      console.info("no environment setting for backendUrlOm found!");
    }
  }

  public getRailOrderCodeList(request: RailOrderCodeSummaryRequest): Observable<RailOrderCodeSummaryResponse> {
    return this.httpClient.post<RailOrderCodeSummaryResponse>(this.backendUrlOm + ApiUrls.RAIL_ORDER_TEMPLATE_LIST, request).pipe(take(1));
  }

  public getRailOrdersCodeCommercialLocations(query: string, stationType: StationType): Observable<CommercialLocationSummary[]> {
    let url = this.backendUrlOm + RAIL_ORDERS_TAMPLATES_COMMERCIAL_LOCATIONS_URL;
    url += '?query=' + query + '&stationType=' + stationType;
    return this.httpClient.get<CommercialLocationSummary[]>(url);
  }

  public getRailOrdersCodePartners(query: string, partnerRole: PartnerRole): Observable<PartnerSummary[]> {
    let url = this.backendUrlOm + RAIL_ORDERS_TAMPLATES_PARTNERS_URL;
    url += '?query=' + query + '&partnerRole=' + partnerRole;
    return this.httpClient.get<PartnerSummary[]>(url);
  }

  public getRailOrdersTemplate(query: string): Observable<TemplateSummary[]> {
    let url = this.backendUrlOm + RAIL_ORDERS_TAMPLATES_TAMPLATES_URL;
    url += '?query=' + query;
    return this.httpClient.get<TemplateSummary[]>(url);
  }

  // TODO method for this requests exists in TrainorderService! Remove this method!
  public getGoods(query: string, codeLength: number = null): Observable<NHMCodes[]> {
    let url = this.backendUrl + ApiUrls.GOODS;
    url += '?query=' + query;
    if(codeLength) {
      url += '&codeLength=' + codeLength;
    }
    return this.httpClient.get<NHMCodes[]>(url);
  }

  public getDangerousGoods(query: string): Observable<DangerousGood[]> {
    let url = this.backendUrl + ApiUrls.DANGEROUS_GOODS;
    url += '?query=' + query;
    return this.httpClient.get<DangerousGood[]>(url);
  }

  public getRailOrdersTemplatesCountryCodes(query: string, stationType: StationType): Observable<Country[]> {
    let url = this.backendUrlOm + ApiUrls.RAIL_ORDER_TEMPLATES_COUNTRIES;
     url += `?query=${query}&stationType=${stationType}`;
    return this.httpClient.get<Country[]>(url);
  }
}
