import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { ApiUrls } from "@src/app/shared/enums/api-urls.enum";
import { EnvService } from "@src/app/shared/services/env/env.service";
import { RailOrderStatusHistory } from "../models/api-railorder-status-history";


export const RAILORDER_STATUS_HISTORY = '/rail-orders/{orderId}/status-history'

@Injectable({
  providedIn: 'root'
})
export class RailOrderStatusHistoryService {
  private backendUrl: string;
  private backendUrlOm: string;

  private httpHeaders = {
    headers: new HttpHeaders({
      'Requested-By': 'TM-Web-Frontend'
    })
  }

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

  public getRailOrderStatusHistory(orderId: number): Observable<RailOrderStatusHistory[]> {
    {
      if (!this.backendUrlOm || !orderId) {
        console.error('Backend URL is not configured or orderId is missing.');
        throw new Error('Backend URL is not configured or orderId is missing');
      }
      const url = ApiUrls.RAIL_ORDERS_STATUS_HISTORY.replace('{orderId}', `${orderId}`);
      const uri = this.backendUrlOm + url;
      return this.httpClient.get<RailOrderStatusHistory[]>(uri, this.httpHeaders);
    }
  }
}