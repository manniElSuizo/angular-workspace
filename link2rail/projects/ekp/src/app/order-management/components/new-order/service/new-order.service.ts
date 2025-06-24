import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { initialRailOrder, RailOrder, TemplateSummary } from '../../../models/rail-order-api';
import { ApiUrls } from '@src/app/shared/enums/api-urls.enum';
import { PrepaymentNote, SpecialTreatment } from '@src/app/order-management/models/om-internal-api';

@Injectable({
  providedIn: 'root'
})
export class NewOrderService {

  private backendUrl: string;

  constructor(
    private httpClient: HttpClient,
    private env: EnvService
  ) {
    this.backendUrl = this.env?.backendUrlOm;
    if (!this.backendUrl) {
      // Handle error case here if needed
      // console.info("No environment setting for backendUrl found!");
    }
  }

  private httpHeaders = {
    headers: new HttpHeaders({
      'Requested-By': 'OM-Web-Frontend'
    })
  }

  public getOrder(orderId: number): Observable<RailOrder> {
    if (!this.backendUrl || !orderId) {
      console.error('Backend URL is not configured or orderId is missing.');
      throw new Error('Backend URL is not configured or orderId is missing');
    }
    const url = ApiUrls.RAILORDERS.replace('{orderId}', `${orderId}`);
    const uri = this.backendUrl + url;
    return this.httpClient.get<RailOrder>(uri, this.httpHeaders);
  }

  private getEmptyObject(): Observable<RailOrder> {
    return of(initialRailOrder());
  }


  public getRailOrderTemplatesByQuery(query: string): Observable<TemplateSummary[]> {
    return this.httpClient.get<TemplateSummary[]>(this.backendUrl + ApiUrls.RAIL_ORDER_TEMPLATES_BY_QUERY.replace('$query', query));
  }

  public getRailOrderTemplates(context?: string): Observable<TemplateSummary[]> {
    let url = this.backendUrl + ApiUrls.RAIL_ORDER_TEMPLATES_GET;
    if (context) {
      url += `?context=${encodeURIComponent(context)}`;
    }
    return this.httpClient.get<TemplateSummary[]>(url);
  }

  public getAllRailOrderTemplates(): Observable<TemplateSummary[]> {
    return this.httpClient.get<TemplateSummary[]>(this.backendUrl + ApiUrls.RAIL_ORDER_TEMPLATES);
  }

  public getRailOrderTemplateByTemplateNumber(templateNumber: string): Observable<RailOrder> {
    return this.httpClient.get<RailOrder>(this.backendUrl + ApiUrls.RAIL_ORDER_TEMPLATE_BY_TEMPLATE_NUMBER.replace('{templateNumber}', templateNumber));
  }

  public getSpecialTreatments(includeInPrepaymentNote: boolean = true): Observable<SpecialTreatment[]> {
    return this.httpClient.get<SpecialTreatment[]>(this.backendUrl + ApiUrls.SPECIAL_TREATMENTS, this.httpHeaders).pipe(
      map((specialTreatments) => {
        let result: SpecialTreatment[];

        if (!includeInPrepaymentNote) {
          result = specialTreatments.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          result = specialTreatments
            .filter((treatment) => !treatment.includedInPrepaymentNote)
            .sort((a, b) => a.name.localeCompare(b.name));
        }
        return result;
      })
    );
  }

  public getPrepaymentNotes(): Observable<PrepaymentNote[]> {
    return this.httpClient.get<PrepaymentNote[]>(this.backendUrl + ApiUrls.PREPAYMENT_NOTES, this.httpHeaders) .pipe(
      map((specialTreatments) => this.sortPrepaymentsByText(specialTreatments)));
  }

  private sortPrepaymentsByText(stList: PrepaymentNote[]): PrepaymentNote[] {
    return stList.sort((a, b) => a.text.localeCompare(b.text));
  }

}
