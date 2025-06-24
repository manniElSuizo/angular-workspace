import { TestBed } from '@angular/core/testing';

import { NewOrderService } from './new-order.service';
import { HttpClientModule } from '@angular/common/http';

describe('NewOrderService', () => {
  let service: NewOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(NewOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
