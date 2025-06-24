import { Injectable } from '@angular/core';
import { RailOrder } from '@src/app/order-management/models/rail-order-api';
import { RAIL_ORDER_LOCKED_FIELDS_CONFIG } from './locked-fields.service.config';

@Injectable({
  providedIn: 'root'
})
export class LockedFieldsService {

  constructor() { }

  public railOrderTemplateCanBeSaved(railOrderTemplate: RailOrder): boolean {
    return this.hasAllFields(railOrderTemplate, RAIL_ORDER_LOCKED_FIELDS_CONFIG);
  }

  private hasAllFields(obj: Object, config: string[]): boolean {
    return config.every(path => {
      const value = this.getValueByPath(obj, path);
      return value !== undefined && value !== null && value !== '';
    });
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }
}
