import { TestBed } from '@angular/core/testing';

import { OrderTemplateCachingService } from './order-template-caching.service';
import { initialRailOrder, RailOrder } from '@src/app/order-management/models/rail-order-api';

describe('OrderTemplateCachingService', () => {
  let service: OrderTemplateCachingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderTemplateCachingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null if template is not set', () => {
    expect(service.getOrderTemplate()).toBe(null);
  });

  it('should deep copy the template for caching', () => {
    const orderTemplate: RailOrder = initialRailOrder();
    orderTemplate.consignor.customerId.sgv = '4010';
    service.setOrderTemplate(orderTemplate);
    orderTemplate.consignor.customerId.sgv = '1234';
    const copy = service.getOrderTemplate();
    expect('4010').toEqual(copy.consignor.customerId.sgv)
  });
});

