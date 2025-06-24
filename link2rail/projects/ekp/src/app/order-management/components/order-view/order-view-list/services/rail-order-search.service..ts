import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { take } from "rxjs/operators";
import { ApiUrls } from "@src/app/shared/enums/api-urls.enum";
import { EnvService } from "@src/app/shared/services/env/env.service";
import { RailOrderSummaryRequest, RailOrderSummaryResponse } from "@src/app/trainorder/models/ApiRailOrder.model";

@Injectable({
  providedIn: 'root'
})
export class RailOrderSearchService {

  private backendUrl: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.backendUrl = this.env?.backendUrlOm;
    if (typeof this.backendUrl == 'undefined' || this.backendUrl == null) {
      console.info("no environment setting for backendUrl found!");
    }
  }

  public getRailOrderList(request: RailOrderSummaryRequest): Observable<RailOrderSummaryResponse> {
    return this.httpClient.post<RailOrderSummaryResponse>(this.backendUrl + ApiUrls.RAIL_ORDERS_SEARCH, request).pipe(take(1));
    //return this.httpClient.post<RailOrderSummaryResponse>(this.backendUrl + ApiUrls.RAIL_ORDERS_SEARCH).pipe(take(1));
    /*
    const result: RailOrderSummaryResponse = {
      items: [],
      offset: 0,
      limit: 25,
      total: 10
    };
    for(let i= 0; i< 10; i++ ){
    result.items.push (ApiMocks.response());
    }
    return  of(result);
    */
  }

  public notFoundUrl() {
    return this.httpClient.get('http://localhost:4200/api/om/v1/not-existent');
  }
}
