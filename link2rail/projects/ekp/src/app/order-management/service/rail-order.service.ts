import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { RailOrder } from '../models/rail-order-api';
import { Observable } from 'rxjs';
import { RailOrderApiUrls } from './rail-order-api-urls';
import { RailOrderStage } from '../components/wagon-view/models/api-wagon-list';

@Injectable({
  providedIn: 'root'
})
export class RailOrderService {
  private omBackendUrl;
  private env: EnvService = inject(EnvService);
  private httpClient: HttpClient = inject(HttpClient);

  constructor() {
    this.omBackendUrl = this.env?.backendUrlOm;
  }

  public railOrdersPost(railOrder: RailOrder, stage: RailOrderStage, separateConsignmentNotes: boolean = false): Observable<RailOrder> {
    let url = `${this.omBackendUrl}${RailOrderApiUrls.RAIL_ORDERS}?stage=${stage}`;
    if(separateConsignmentNotes) {
      url = url + "&separateConsignmentNotes=true";
    }
    return this.httpClient.post<RailOrder>(url, railOrder);
  }

  public railOrdersPut(railOrder: RailOrder, stage: RailOrderStage): Observable<RailOrder> {
    const url = `${this.omBackendUrl}${RailOrderApiUrls.RAIL_ORDERS_ORDER_ID.replace('{orderId}', `${railOrder.orderId}`)}?stage=${stage}`;
    return this.httpClient.put<RailOrder>(url, railOrder);
  }

  public railOrdersCancel(orderId: number): Observable<void> {
    const url = `${this.omBackendUrl}${RailOrderApiUrls.RAIL_ORDERS_CANCEL.replace('{orderId}', `${orderId}`)}`;
    return this.httpClient.post<void>(url, null);
  }

  public railOrderTemplatesRename(templateNumber: string, templateName: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.omBackendUrl}${RailOrderApiUrls.RAIL_ORDER_TEMPLATES.replace('{templateNumber}', templateNumber)}`, {templateName: templateName});
  }
}
