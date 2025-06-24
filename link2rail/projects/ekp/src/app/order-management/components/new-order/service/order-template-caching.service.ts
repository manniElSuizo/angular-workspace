import { Injectable } from '@angular/core';
import { RailOrder } from '@src/app/order-management/models/rail-order-api';

@Injectable({
  providedIn: 'root'
})
export class OrderTemplateCachingService {
  private orderTemplate: RailOrder = null;

  constructor() { }

  public setOrderTemplate(orderTemplate: RailOrder): void {
    this.orderTemplate = JSON.parse(JSON.stringify(orderTemplate));
  }

  public getOrderTemplate(): RailOrder {
    return this.orderTemplate;
  }
}
